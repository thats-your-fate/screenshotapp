import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db/prisma";
import { trackServerEvent } from "@/lib/analytics/ga-server";
import { signInSchema } from "@/features/auth/validations";

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      console.error("[auth][error]", code, ...message);
    },
    warn(code, ...message) {
      console.warn("[auth][warn]", code, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[auth][debug]", code, ...message);
      }
    },
  },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) {
          return null;
        }
        if (!user.passwordHash.startsWith("$2")) {
          return null;
        }

        const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!matches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) {
          return url;
        }
      } catch {
        return `${baseUrl}/app`;
      }

      return `${baseUrl}/app`;
    },
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = profile?.email;
      if (!email || typeof email !== "string") {
        return false;
      }

      const name =
        typeof profile.name === "string" && profile.name.trim().length > 0
          ? profile.name
          : email.split("@")[0] || "Google user";

      await db.user.upsert({
        where: { email },
        update: { name },
        create: {
          email,
          name,
          passwordHash: "",
          role: "USER",
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? token.email;
      }

      if (token.email) {
        const appUser = await db.user.findUnique({ where: { email: token.email } });
        if (appUser) {
          token.id = appUser.id;
          token.role = appUser.role;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      const appUser = user.email ? await db.user.findUnique({ where: { email: user.email } }) : null;
      await trackServerEvent({
        name: "login_completed",
        userId: appUser?.id || user.id,
        params: { method: account?.provider || "unknown" },
      });
    },
  },
} satisfies NextAuthConfig;
