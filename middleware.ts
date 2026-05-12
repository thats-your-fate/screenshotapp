import { NextResponse } from "next/server";

import { auth } from "@/features/auth/auth";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const user = req.auth?.user;

  const isAppRoute = pathname.startsWith("/app");
  const isAdminRoute = pathname.startsWith("/admin");

  if ((isAppRoute || isAdminRoute) && !user) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("redirectTo", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/app", req.nextUrl.origin));
  }

  if ((pathname === "/sign-in" || pathname === "/sign-up") && user) {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo");
    const nextPath = redirectTo?.startsWith("/") ? redirectTo : user.role === "ADMIN" ? "/admin" : "/app";
    return NextResponse.redirect(new URL(nextPath, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/sign-in", "/sign-up"],
};
