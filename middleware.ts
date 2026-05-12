import { NextResponse } from "next/server";

import { auth } from "@/features/auth/auth";

function marketingLocaleFromPath(pathname: string) {
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  if (pathname === "/pt-br" || pathname.startsWith("/pt-br/")) return "pt-br";
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (pathname === "/") return "en";
  return null;
}

function withMarketingLocaleCookie(response: NextResponse, pathname: string) {
  const locale = marketingLocaleFromPath(pathname);
  if (locale) {
    response.cookies.set("app_locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const user = req.auth?.user;

  const isAppRoute = pathname.startsWith("/app");
  const isAdminRoute = pathname.startsWith("/admin");

  if ((isAppRoute || isAdminRoute) && !user) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("redirectTo", `${pathname}${req.nextUrl.search}`);
    return withMarketingLocaleCookie(NextResponse.redirect(signInUrl), pathname);
  }

  if (isAdminRoute && user?.role !== "ADMIN") {
    return withMarketingLocaleCookie(NextResponse.redirect(new URL("/app", req.nextUrl.origin)), pathname);
  }

  if ((pathname === "/sign-in" || pathname === "/sign-up") && user) {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo");
    const nextPath = redirectTo?.startsWith("/") ? redirectTo : user.role === "ADMIN" ? "/admin" : "/app";
    return withMarketingLocaleCookie(NextResponse.redirect(new URL(nextPath, req.nextUrl.origin)), pathname);
  }

  return withMarketingLocaleCookie(NextResponse.next(), pathname);
});

export const config = {
  matcher: ["/", "/de/:path*", "/pt-br/:path*", "/es/:path*", "/app/:path*", "/admin/:path*", "/sign-in", "/sign-up"],
};
