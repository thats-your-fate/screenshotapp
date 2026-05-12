/* eslint-disable @next/next/no-css-tags */
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/vendors/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/css/vendors/swiper-bundle.min.css" />
      <link rel="stylesheet" href="/assets/css/vendors/aos.css" />
      <link rel="stylesheet" href="/assets/css/vendors/carouselTicker.css" />
      <link rel="stylesheet" href="/assets/css/vendors/odometer.css" />
      <link rel="stylesheet" href="/assets/css/vendors/magnific-popup.css" />
      <link rel="stylesheet" href="/assets/fonts/bootstrap-icons/bootstrap-icons.min.css" />
      <link rel="stylesheet" href="/assets/fonts/boxicons/boxicons.min.css" />
      <link rel="stylesheet" href="/assets/fonts/remixicon/remixicon.css" />
      <link rel="stylesheet" href="/assets/fonts/fontawesome/fontawesome.min.css" />
      <link rel="stylesheet" href="/assets/fonts/fontawesome/solid.min.css" />
      <link rel="stylesheet" href="/assets/fonts/fontawesome/regular.min.css" />
      <link rel="stylesheet" href="/assets/css/main.css" />
      <link rel="stylesheet" href="/assets/css/style.css" />
      <MarketingShell>{children}</MarketingShell>
    </>
  );
}
