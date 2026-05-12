"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-MXNGNR4CRJ";
const tagManagerId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-5M7XLNWJ";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!measurementId || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || !window.gtag) return;

    const query = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path: query ? `${pathname}?${query}` : pathname,
    });
  }, [pathname, searchParams]);

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          (function(w,d,s,l,i){
            var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),
              dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${tagManagerId}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${tagManagerId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
