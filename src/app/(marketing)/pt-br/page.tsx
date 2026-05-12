import { getLandingMetadata, MarketingLandingPage } from "@/app/(marketing)/page";

export const metadata = getLandingMetadata("pt-br");

export default function PortugueseBrazilLandingPage() {
  return <MarketingLandingPage locale="pt-br" />;
}
