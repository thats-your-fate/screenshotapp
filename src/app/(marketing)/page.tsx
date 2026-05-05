/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { AstraxFaq } from "@/components/marketing/astrax-faq";

const features = [
  {
    title: "Template-locked layouts",
    subtitle: "Admin-controlled structure",
    text: "Admins define the screenshot frame, background, and editable text zones once.",
    icon: "bi bi-layout-text-sidebar-reverse",
  },
  {
    title: "Device screenshot slots",
    subtitle: "Aligned screen placement",
    text: "Drop mobile screens into polished iPhone slots and keep each screen aligned.",
    icon: "bi bi-phone",
  },
  {
    title: "Bulk export pipeline",
    subtitle: "Launch assets in one pass",
    text: "Create complete App Store sets from a multi-screen project workspace.",
    icon: "bi bi-cloud-arrow-down",
  },
];

const plans = [
  { name: "Starter", price: "$19", text: "For solo creators testing store visuals.", highlight: false },
  { name: "Growth", price: "$79", text: "For teams shipping screenshots regularly.", highlight: true },
  { name: "Studio", price: "$249", text: "For agencies managing many app brands.", highlight: false },
];

const faqs = [
  ["Can I use my own screenshots?", "Yes. Upload screenshots into editable device slots and export final store-ready screens."],
  ["Can admins lock parts of a template?", "Yes. Templates can restrict which layers are editable by users."],
  ["Is this connected to cloud storage?", "Not yet. The current build uses local storage so development stays simple."],
] satisfies Array<[string, string]>;

export default function MarketingPage() {
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
          alt=""
        />
        <div className="container position-relative z-2 pt-8 text-lg-start text-center overflow-hidden">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <span className="content-top btn-text text-white">APP STORE SCREENSHOTS</span>
              <h1 className="title-stroke my-3 text-primary">
                AppShot
                <span className="text-white">
                  {" "}is <br />
                  shaping the
                </span>
                <span className="text-secondary"> future </span> <br />
                <span className="text-white">of</span>
                <span className="stroke-primary text-dark">launches.</span>
              </h1>
              <p className="fs-5 text-white opacity-75 mb-0 pe-lg-8">
                Turn reusable templates, device frames, and editable text into polished screenshot sets for every release.
              </p>
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start flex-wrap mt-8">
                <Link href="/sign-up" className="btn btn-dashed">
                  <span> get started now </span>
                  <i className="fa-solid fa-arrow-right-long text-primary" />
                </Link>
                <div className="d-flex align-items-center ps-md-6 pt-md-0 pt-5">
                  <div className="d-flex align-items-center gap-1">
                    <img className="icon-shape rounded-circle avatar-1" src="/assets/imgs/pages/fintech-app/page-home/home-section-1/avatar-1.png" alt="" />
                    <img className="icon-shape rounded-circle avatar-2" src="/assets/imgs/pages/fintech-app/page-home/home-section-1/avatar-2.png" alt="" />
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-0 text-start">62</h6>
                    <p className="mb-0 text-primary">Seeded templates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="banner position-absolute bottom-0 start-40 z-1 ps-10 d-none d-lg-block">
          <img src="/assets/imgs/pages/fintech-app/page-home/home-section-1/img-phone.png" alt="AppShot mobile preview" />
        </div>
      </section>

      <section className="fintech-app-home-section-2 position-relative pt-120 rounded-bottom-5 bg-primary">
        <div className="position-absolute top-50 start-50 translate-middle z-0 w-100 h-100">
          <img className="w-100 h-100" src="/assets/imgs/pages/fintech-app/page-home/home-section-2/img-bg.png" alt="" />
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
                <h2 className="mb-0 text-dark">Core features for App Store creative production</h2>
              </div>
            </div>
            <div className="col-lg-4">
              <p className="fs-18 text-dark">
                Build complete screenshot campaigns from reusable templates. Replace screenshots, tune copy, and export every screen from one
                project.
              </p>
            </div>
          </div>
        </div>
        <div className="container position-relative pt-120 pb-120 z-1">
          <div className="row g-5">
            {features.map((feature) => (
              <div key={feature.title} className="col-lg-4">
                <div className="card-feature p-5 rounded-4 hover-up bg-white h-100 shadow-1" style={{ boxShadow: "0 24px 60px rgba(41, 41, 41, 0.16)" }}>
                  <Link href="/templates" className="d-flex align-items-center gap-3 mb-4">
                    <i className={`${feature.icon} text-dark fs-2 flex-shrink-0`} />
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
              <span className="content-top btn-text text-white">EDITOR READY</span>
              <h2 className="mt-3 mb-5 text-primary position-relative">
                Special
                <span className="text-white">
                  {" "}template <br />
                  screenshot system
                </span>
                <span className="text-secondary"> and </span> <br />
                <span className="text-white">ready</span>
                <span className="stroke-primary text-dark">exports</span>
              </h2>
              <ul className="list-unstyled mb-8">
                {["Text frames align with device slots", "Users can set text left, center, or right", "Seeded projects include seven screens"].map(
                  (item) => (
                    <li key={item} className="d-flex align-items-center mb-3 gap-3">
                      <i className="bi bi-check-circle-fill text-primary" />
                      <p className="mb-0 text-white">{item}</p>
                    </li>
                  ),
                )}
              </ul>
              <Link href="/app" className="btn btn-primary text-dark fw-bold">
                open workspace
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
              <span className="content-top btn-text text-white">app plans</span>
              <h2 className="my-3 text-primary">
                Unleash
                <span className="text-white">
                  {" "}your <br />
                  screenshot
                </span>
                <span className="text-secondary"> system </span>
                <span className="text-white">potential</span>
              </h2>
            </div>
          </div>
          <div className="row g-5 mt-80">
            {plans.map((plan) => (
              <div key={plan.name} className="col-lg-4">
                <div className={`card-pricing rounded-4 p-md-6 p-4 position-relative ${plan.highlight ? "bg-primary" : "border border-white border-opacity-10"}`}>
                  <span className={`btn-text ${plan.highlight ? "text-dark opacity-75" : "text-white opacity-50"}`}>{plan.name}</span>
                  <h1 className={`mb-3 ${plan.highlight ? "text-dark" : ""}`}>{plan.price}</h1>
                  <p className={`fs-7 ${plan.highlight ? "text-dark" : "text-white opacity-75"}`}>{plan.text}</p>
                  <Link href="/pricing" className={`mt-3 hover-up btn w-100 mb-6 ${plan.highlight ? "btn-dark text-primary border-dark" : "btn-outline-dark"}`}>
                    view pricing
                  </Link>
                  <span className={`btn-text ${plan.highlight ? "text-dark" : "text-white"}`}>What is included:</span>
                  <ul className="list-unstyled mt-3 mb-0">
                    {["Published templates", "Project editor", "Local uploads", "Bulk exports"].map((item) => (
                      <li key={item} className={`d-flex align-items-center justify-content-between border-top py-3 ${plan.highlight ? "border-secondary" : "border-white border-opacity-10"}`}>
                        <p className={`fs-7 mb-0 ${plan.highlight ? "text-dark" : "text-white opacity-75"}`}>{item}</p>
                        <img className="filter-invert" src="/assets/imgs/template/icons/check.svg" alt="" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
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
                AppShot turns templates into <br />
                launch-ready screenshot sets
              </h2>
              <p className="text-dark py-3">Start from seeded templates or create your own.</p>
              <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
                <Link href="/templates" className="btn btn-dark text-primary">
                  browse templates
                </Link>
                <Link href="/sign-up" className="btn btn-dark text-primary">
                  create account
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
              <span className="content-top btn-text text-white">faq &amp; a.</span>
              <h2 className="my-3 text-primary position-relative">
                Get
                <span className="text-white">
                  {" "}every answer <br className="d-block" />
                  from
                </span>
                <span className="text-secondary"> here </span>
                <span className="stroke-primary text-dark">asap.</span>
              </h2>
            </div>
            <div className="col-lg-7 mt-lg-0 mt-8">
              <AstraxFaq items={faqs} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
