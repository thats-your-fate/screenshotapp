import { getLandingMetadata, MarketingLandingPage } from "@/app/(marketing)/page";

export const metadata = getLandingMetadata("es");

export default function SpanishLandingPage() {
  return <MarketingLandingPage locale="es" />;
}
