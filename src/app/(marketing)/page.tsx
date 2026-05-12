/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";

import { AstraxFaq } from "@/components/marketing/astrax-faq";
import landingCopy from "@/lib/i18n/landing-copy.json";

export type LandingLocale = keyof typeof landingCopy;

const plans = [
  { price: "$5", highlight: false },
  { price: "$10", highlight: true },
  { price: "$15", highlight: false },
];

const featureIcons = ["bi bi-layout-text-sidebar-reverse", "bi bi-phone", "bi bi-cloud-arrow-down"];
const siteUrl = "https://appshotstudio.cc";
const languageAlternates = Object.fromEntries(
  Object.entries(landingCopy).map(([locale, copy]) => [copy.hreflang, `${siteUrl}${copy.path}`]),
);

export function getLandingMetadata(locale: LandingLocale): Metadata {
  const copy = landingCopy[locale];
  const url = `${siteUrl}${copy.path}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates,
        "x-default": siteUrl + landingCopy.en.path,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: "website",
      url,
      siteName: "AppShot Studio",
      locale: copy.hreflang,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
  };
}

export const metadata = getLandingMetadata("en");

export function MarketingLandingPage({ locale = "en" }: { locale?: LandingLocale }) {
  const copy = landingCopy[locale];

  return (
    <>
      <section
        className="fintech-app-home-section-1 position-relative overflow-hidden pt-120 pb-120 rounded-bottom-5 z-4"
        data-background="assets/imgs/pages/fintech-app/page-home/home-section-1/img-bg.png"
        style={{
          backgroundColor: "var(--tc-theme-primary)",
          backgroundImage: "url('/assets/imgs/pages/fintech-app/page-home/home-section-1/img-bg.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <img
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover z-0"
          src="/assets/imgs/pages/fintech-app/page-home/home-section-1/img-bg.png"
          alt="AppShot Studio app store screenshot template preview"
        />
        <div className="container position-relative z-2 pt-8 text-lg-start text-center overflow-hidden">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <span className="content-top btn-text text-white">{copy.eyebrow}</span>
              <h1 className="title-stroke my-3 text-primary">
                {copy.h1.start}
                <span className="text-white">
                  {" "}{copy.h1.middle.split("\n")[0]} <br />
                  {copy.h1.middle.split("\n")[1]}
                </span>
                <span className="text-secondary"> {copy.h1.accent} </span>
              </h1>
              <p className="fs-5 text-white opacity-75 mb-0 pe-lg-8">
                {copy.subtitle}
              </p>
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start flex-wrap mt-8">
                <Link href="/sign-up" className="btn btn-dashed">
                  <span> {copy.primaryCta} </span>
                  <i className="fa-solid fa-arrow-right-long text-primary" />
                </Link>
                <div className="d-flex align-items-center ps-md-6 pt-md-0 pt-5">
                  <div>
                    <h6 className="mb-0 text-start">62</h6>
                    <p className="mb-0 text-primary">{copy.uniqueTemplates}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="banner position-absolute bottom-0 start-40 z-1 ps-10 d-none d-lg-block" style={{ transform: "translateY(96px)" }}>
          <img src="/assets/imgs/pages/fintech-app/page-home/home-section-1/img-phone.png" alt="Mobile app screenshot editor preview" />
        </div>
      </section>

      <section className="fintech-app-home-section-2 position-relative pt-120 rounded-bottom-5 bg-primary">
        <div className="position-absolute top-50 start-50 translate-middle z-0 w-100 h-100">
          <img className="w-100 h-100" src="/assets/imgs/pages/fintech-app/page-home/home-section-2/img-bg.png" alt="iPhone screenshot template layout" />
        </div>
        <div className="container position-relative z-1 border-dashed-bottom pb-120 overflow-hidden">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-4">
                <svg className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width={112} height={112} viewBox="0 0 40 40" fill="none">
                  <path fill="#292929" d="M24.5043 9.79724L22.7082 18.3981L35.2929 17.1948L37.1117 7.00605L24.5043 9.79724Z" />
                  <path fill="#292929" d="M31.9171 17.6837L23.2697 20.6189L30.6333 30.3865L40.723 26.6545L31.9171 17.6837Z" />
                  <path fill="#292929" d="M28.4204 27.86L21.4605 22.2312L16.332 33.3249L24.7296 39.7347L28.4204 27.86Z" />
                  <path fill="#292929" d="M17.5913 29.998L19.1912 21.3633L6.63465 22.8288L5.04812 33.0511L17.5913 29.998Z" />
                  <path fill="#292929" d="M10.2917 22.1777L18.8717 19.0632L11.2859 9.45346L1.28177 13.3945L10.2917 22.1777Z" />
                  <path fill="#292929" d="M13.7243 12.2243L20.8121 17.7054L25.6875 6.50938L17.1442 0.277556L13.7243 12.2243Z" />
                </svg>
                <h2 className="mb-0 text-dark">{copy.featureHeading}</h2>
              </div>
            </div>
            <div className="col-lg-4">
              <p className="fs-18 text-dark">
                {copy.featureIntro}
              </p>
            </div>
          </div>
        </div>
        <div className="container position-relative pt-120 pb-120 z-1">
          <div className="row g-5">
            {copy.features.map((feature, index) => (
              <div key={feature.title} className="col-lg-4">
                <div className="card-feature p-5 rounded-4 hover-up bg-white h-100 shadow-1" style={{ boxShadow: "0 24px 60px rgba(41, 41, 41, 0.16)" }}>
                  <Link href="/templates" className="d-flex align-items-center gap-3 mb-4">
                    <i className={`${featureIcons[index] || featureIcons[0]} text-dark fs-2 flex-shrink-0`} />
                    <div>
                      <h6 className="mb-3 text-dark">{feature.title}</h6>
                      <p className="mb-0 btn-text text-muted">{feature.subtitle}</p>
                    </div>
                  </Link>
                  <p className="mb-0 text-dark opacity-75">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fintech-app-home-section-4 position-relative bg-dark-3 rounded-bottom-5">
        <div className="container overflow-hidden pt-120 pb-120">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="content-top btn-text text-white">{copy.editorEyebrow}</span>
              <h2 className="mt-3 mb-5 text-primary position-relative">
                {copy.editorHeading.start}
                <span className="text-white">
                  {" "}{copy.editorHeading.middle.split("\n")[0]} <br />
                  {copy.editorHeading.middle.split("\n")[1]}
                </span>
                <span className="text-secondary"> {copy.editorHeading.accent} </span> <br />
                <span className="text-white">{copy.editorHeading.end}</span>
                <span className="stroke-primary text-dark">{copy.editorHeading.stroke}</span>
              </h2>
              <ul className="list-unstyled mb-8">
                {copy.editorBullets.map((item) => (
                  <li key={item} className="d-flex align-items-center mb-3 gap-3">
                    <i className="bi bi-check-circle-fill text-primary" />
                    <p className="mb-0 text-white">{item}</p>
                  </li>
                ))}
              </ul>
              <Link href="/app" className="btn btn-primary text-dark fw-bold">
                {copy.workspaceCta}
                <i className="fa-solid fa-arrow-right-long ms-2" />
              </Link>
            </div>
            <div className="col-lg-6">
              <div className="position-relative d-inline-block">
                <img className="rounded-4" src="/assets/imgs/pages/fintech-app/page-home/home-section-4/img-1.png" alt="Editor preview" />
                <img
                  className="position-absolute top-100 start-100 translate-middle pe-10 d-none d-md-block"
                  src="/assets/imgs/pages/fintech-app/page-home/home-section-4/img-list.png"
                  alt="Template list preview"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fintech-app-home-section-5 position-relative pt-120 pb-120 bg-dark rounded-bottom-5">
        <div className="container position-relative z-1 overflow-hidden">
          <div className="row">
            <div className="text-center">
              <span className="content-top btn-text text-white">{copy.plansEyebrow}</span>
              <h2 className="my-3 text-primary">
                {copy.plansHeading.start}
                <span className="text-white">
                  {" "}{copy.plansHeading.middle.split("\n")[0]} <br />
                  {copy.plansHeading.middle.split("\n")[1]}
                </span>
                <span className="text-secondary"> {copy.plansHeading.accent} </span>
                <span className="text-white">{copy.plansHeading.end}</span>
              </h2>
            </div>
          </div>
          <div className="row g-5 mt-80">
            {plans.map((plan, index) => {
              const planCopy = copy.plans[index] || copy.plans[0];

              return (
              <div key={planCopy.name} className="col-lg-4">
                <div className={`card-pricing rounded-4 p-md-6 p-4 position-relative ${plan.highlight ? "bg-primary" : "border border-white border-opacity-10"}`}>
                  <span className={`btn-text ${plan.highlight ? "text-dark opacity-75" : "text-white opacity-50"}`}>{planCopy.name}</span>
                  <h1 className={`mb-3 ${plan.highlight ? "text-dark" : ""}`}>{plan.price}</h1>
                  <p className={`fs-7 ${plan.highlight ? "text-dark" : "text-white opacity-75"}`}>{planCopy.text}</p>
                  <Link href="/pricing" className={`mt-3 hover-up btn w-100 mb-6 ${plan.highlight ? "btn-dark text-primary border-dark" : "btn-outline-dark"}`}>
                    {copy.pricingCta}
                  </Link>
                  <span className={`btn-text ${plan.highlight ? "text-dark" : "text-white"}`}>{copy.includedLabel}</span>
                  <ul className="list-unstyled mt-3 mb-0">
                    {copy.included.map((item) => (
                      <li key={item} className={`d-flex align-items-center justify-content-between border-top py-3 ${plan.highlight ? "border-secondary" : "border-white border-opacity-10"}`}>
                        <p className={`fs-7 mb-0 ${plan.highlight ? "text-dark" : "text-white opacity-75"}`}>{item}</p>
                        <img className="filter-invert" src="/assets/imgs/template/icons/check.svg" alt="Included feature" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="fintech-app-home-section-7 position-relative bg-dark">
        <div className="position-absolute bottom-50 start-50 translate-middle-x w-100 h-50 bg-dark-3 rounded-bottom-5" />
        <div className="container overflow-hidden">
          <div className="position-relative z-1 text-center bg-primary rounded-3 py-120 px-md-4 px-3">
            <div className="position-relative z-1">
              <i className="bi bi-phone-vibrate-fill text-dark fs-1" />
              <h2 className="text-dark pt-4">
                {copy.launchHeading.split("\n")[0]} <br />
                {copy.launchHeading.split("\n")[1]}
              </h2>
              <p className="text-dark py-3">{copy.launchText}</p>
              <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
                <Link href="/templates" className="btn btn-dark text-primary">
                  {copy.browseTemplatesCta}
                </Link>
                <Link href="/sign-up" className="btn btn-dark text-primary">
                  {copy.createAccountCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fintech-app-home-section-8 pt-120 pb-120 position-relative rounded-bottom-5 bg-dark">
        <div className="container position-relative overflow-hidden">
          <div className="row">
            <div className="col-lg-5">
              <span className="content-top btn-text text-white">{copy.faqEyebrow}</span>
              <h2 className="my-3 text-primary position-relative">
                {copy.faqHeading.start}
                <span className="text-white">
                  {" "}{copy.faqHeading.middle.split("\n")[0]} <br className="d-block" />
                  {copy.faqHeading.middle.split("\n")[1]}
                </span>
                <span className="text-secondary"> {copy.faqHeading.accent} </span>
                <span className="stroke-primary text-dark">{copy.faqHeading.stroke}</span>
              </h2>
              <p className="mb-0 fs-5 text-white opacity-75">
                {copy.faqIntro}
              </p>
            </div>
            <div className="col-lg-7 mt-lg-0 mt-8">
              <AstraxFaq items={copy.faqs as Array<[string, string]>} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function MarketingPage() {
  return <MarketingLandingPage locale="en" />;
}
