/* eslint-disable @next/next/no-css-tags */
import type { ReactNode } from "react";

export default function FrontendRefsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/sassio-ref/css/vendors.css" />
      <link rel="stylesheet" href="/sassio-ref/css/animate.min.css" />
      <link rel="stylesheet" href="/sassio-ref/css/main.css" />
      {children}
    </>
  );
}
