"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { db } from "@/lib/db/prisma";
import { trackServerEvent } from "@/lib/analytics/ga-server";
import { signIn, signOut } from "@/features/auth/auth";
import { signInSchema, signUpSchema } from "@/features/auth/validations";

function safeRedirectTo(value: FormDataEntryValue | string | null | undefined) {
  return typeof value === "string" && value.startsWith("/") ? value : "/app";
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") || "/app",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { ok: false, error: "Email already in use." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "USER",
    },
  });

  await trackServerEvent({
    name: "sign_up_completed",
    userId: user.id,
    params: { method: "credentials" },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: safeRedirectTo(parsed.data.redirectTo),
  });

  return { ok: true };
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: safeRedirectTo(formData.get("redirectTo")),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirectTo(parsed.data.redirectTo),
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }

    return { ok: false, error: "Sign-in failed. Please try again." };
  }

  return { ok: true };
}

export async function signInWithGoogleAction(formData: FormData) {
  const redirectTo = formData.get("redirectTo");

  await signIn("google", {
    redirectTo: safeRedirectTo(redirectTo),
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
  redirect("/");
}
