import type { Metadata } from "next";
import { Space_Grotesk, Fraunces, Manrope, Merriweather } from "next/font/google";

import "./globals.css";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AppShot Studio",
  description: "Template-based App Store screenshot generator starter boilerplate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${space.variable} ${fraunces.variable} ${manrope.variable} ${merriweather.variable}`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
