import { getLandingMetadata, MarketingLandingPage } from "@/app/(marketing)/page";

export const metadata = getLandingMetadata("de");

export default function GermanLandingPage() {
  return <MarketingLandingPage locale="de" />;
}
