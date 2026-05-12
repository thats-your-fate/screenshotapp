import type { Metadata } from "next";
import { Space_Grotesk, Fraunces, Manrope, Merriweather } from "next/font/google";
import { Suspense } from "react";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const siteUrl = "https://appshotstudio.cc/";
const siteTitle = "AppShot Studio – App Store Screenshot Generator for iOS and Android";
const siteDescription =
  "Create polished App Store and Google Play screenshot sets from reusable templates, device frames, editable text, and bulk exports.";
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AppShot Studio",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description: "App Store and Google Play screenshot generator for creating launch-ready mobile app screenshot sets.",
};

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
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
      de: "https://appshotstudio.cc/de/",
      "pt-BR": "https://appshotstudio.cc/pt-br/",
      es: "https://appshotstudio.cc/es/",
      "x-default": siteUrl,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    url: siteUrl,
    siteName: "AppShot Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
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
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
