/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type RefVariant = "home-1" | "home-2" | "home-3" | "home-4";

const variantLinks: Array<{ href: string; label: string }> = [
  { href: "/frontend-refs/home-1", label: "Home 1" },
  { href: "/frontend-refs/home-2", label: "Home 2" },
  { href: "/frontend-refs/home-3", label: "Home 3" },
  { href: "/frontend-refs/home-4", label: "Home 4" },
];

function img(path: string) {
  return `/sassio-ref/img/${path}`;
}

function RefSwitcher({ active }: { active: RefVariant }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        zIndex: 1000,
        display: "flex",
        gap: 8,
        alignItems: "center",
        borderRadius: 999,
        background: "rgba(17, 24, 39, 0.88)",
        padding: 8,
        boxShadow: "0 20px 60px rgba(0,0,0,0.24)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Link href="/frontend-refs" style={{ color: "#fff", fontSize: 12, fontWeight: 800, padding: "8px 10px" }}>
        All
      </Link>
      {variantLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            borderRadius: 999,
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            padding: "8px 10px",
            background: item.href.endsWith(active) ? "#ff5a3d" : "transparent",
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function SassioHeader({ variant, dark = false }: { variant: RefVariant; dark?: boolean }) {
  return (
    <header className={`header ${variant === "home-4" ? "-container" : "-type-2 -sticky-dark"} js-header`}>
      <div className="header__bar js-header-bar">
        <div className={variant === "home-4" ? "container" : ""}>
          <div className="row justify-between items-center">
            <div className="col-auto">
              <Link href="/frontend-refs" className="d-flex items-center">
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: dark ? "rgba(255,255,255,0.18)" : "#ff5a3d",
                    color: "#fff",
                    fontWeight: 900,
                    marginRight: 12,
                  }}
                >
                  AS
                </span>
                <span className={dark ? "text-white fw-700 text-xl" : "text-dark-1 fw-700 text-xl"}>AppShot</span>
              </Link>
            </div>
            <div className="col-auto md:d-none">
              <nav className="menu js-navList">
                <ul className="menu__nav text-dark-1 -is-active">
                  {variantLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={dark ? "text-white" : ""}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="col-auto">
              <div className="header__right">
                <Link href="/sign-up" className={`button -sm rounded-8 ${dark ? "-white-20 text-white" : "-green text-white"}`}>
                  Use this style
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureCards({ accent = "accent" }: { accent?: "accent" | "green" | "dark" }) {
  const cards = [
    ["Template control", "Admins publish locked layouts while teams edit only approved copy and screenshots."],
    ["Device slots", "Drop screenshots into framed iPhone previews and keep every screen aligned."],
    ["Bulk export", "Generate all App Store screens from a single project workspace."],
  ];

  return (
    <section className="layout-pt-md layout-pb-md">
      <div className="container">
        <div className="row justify-center text-center">
          <div className="col-xl-7 col-lg-8">
            <div className="sectionHeading">
              <div className="sectionHeading__subtitle">
                <span>APPSTORE WORKFLOW</span>
              </div>
              <h2 className="sectionHeading__title">Everything needed to build screenshot sets</h2>
            </div>
          </div>
        </div>
        <div className="row x-gap-32 y-gap-32 layout-pt-sm">
          {cards.map(([title, text], index) => (
            <div key={title} className="col-lg-4 col-md-6">
              <div className="px-40 py-40 rounded-16 bg-white border-light h-100">
                <div className={`size-60 rounded-full d-flex items-center justify-center bg-${accent} text-white text-xl fw-700`}>
                  {index + 1}
                </div>
                <h3 className="text-2xl fw-700 mt-28">{title}</h3>
                <p className="mt-12">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="layout-pt-md layout-pb-md section-bg-color">
      <div className="section-bg-color__item -wide" />
      <div className="container">
        <div className="row justify-center text-center">
          <div className="col-xl-7">
            <div className="sectionHeading">
              <div className="sectionHeading__subtitle">
                <span>PLANS</span>
              </div>
              <h2 className="sectionHeading__title">Pricing placeholder</h2>
            </div>
          </div>
        </div>
        <div className="row x-gap-32 y-gap-32 layout-pt-sm">
          {["Starter", "Growth", "Studio"].map((tier, index) => (
            <div key={tier} className="col-lg-4 col-md-6">
              <div className={`relative rounded-16 pt-60 pb-50 px-40 text-center ${index === 1 ? "bg-light-4" : "bg-white border-light"}`}>
                {index === 1 ? <div className="badge absolute-x-center top-30 bg-accent text-white">Popular</div> : null}
                <div className="text-xl lh-1 fw-600">{tier}</div>
                <h3 className="text-3xl fw-700 mt-20">{index === 2 ? "$15" : index === 1 ? "$10" : "$5"}</h3>
                <p className="mt-20">Dummy billing tier for choosing the frontend direction.</p>
                <Link href="/sign-up" className={`button -md mt-32 ${index === 1 ? "-accent text-white" : "-outline-dark text-black"}`}>
                  Start now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SassioHomeOneRef() {
  return (
    <>
      <SassioHeader variant="home-1" />
      <section className="masthead -type-1">
        <div className="masthead__bg relative">
          <img src={img("home-1/masthead/bg.png")} alt="" />
          <img src={img("home-1/masthead/rect.svg")} alt="" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-lg-6">
              <div className="masthead__content relative z-2">
                <div className="masthead__subtitle">
                  <span>Screenshot generator for launches</span>
                </div>
                <h1 className="masthead__title">
                  Premium App Store
                  <br />
                  <span className="text-accent">Screenshot Studio</span>
                </h1>
                <p className="masthead__text">
                  A faithful Sassio-style landing page adapted to AppShot.
                  <br className="sm:d-none" />
                  Pick this if you want mobile-first product energy.
                </p>
                <div className="masthead__buttons row y-gap-10 pt-32 md:pt-20">
                  <div className="col-auto text-white">
                    <Link href="/sign-up" className="button -store bg-dark-2 text-white">
                      <div className="button__icon">
                        <img src={img("home-1/icons/apple.svg")} alt="" />
                      </div>
                      <div className="button__content">
                        <div>Start with</div>
                        <div>AppShot</div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-auto text-white">
                    <Link href="/templates" className="button -store bg-dark-2 text-white">
                      <div className="button__icon">
                        <img src={img("home-1/icons/google.svg")} alt="" />
                      </div>
                      <div className="button__content text-white">
                        <div>Browse</div>
                        <div>Templates</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-auto col-lg-6">
              <div className="masthead__image relative z-1">
                <img src={img("home-1/masthead/phones.png")} alt="Phone previews" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <FeatureCards />
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row items-center y-gap-48">
            <div className="col-lg-6">
              <div className="relative">
                <img src={img("home-1/features/back.png")} alt="" />
                <img className="absolute-center" src={img("home-1/features/front.png")} alt="" style={{ maxWidth: "82%" }} />
              </div>
            </div>
            <div className="col-lg-5 offset-lg-1">
              <div className="sectionHeading">
                <div className="sectionHeading__subtitle">
                  <span>EDITOR READY</span>
                </div>
                <h2 className="sectionHeading__title">Template packs with editable text and device screenshots.</h2>
                <p className="sectionHeading__text mt-20">Keep this variant if you want the landing page to mirror a polished mobile app tool.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PricingPreview />
      <RefSwitcher active="home-1" />
    </>
  );
}

export function SassioHomeTwoRef() {
  return (
    <>
      <SassioHeader variant="home-2" dark />
      <section className="masthead -type-2 relative">
        <div className="masthead__bg">
          <img className="initial-img object-fit-cover" src={img("home-2/masthead/bg.png")} alt="" />
        </div>
        <div className="container">
          <div className="row justify-center">
            <div className="col-12">
              <div className="masthead__content text-center">
                <h1 className="masthead__title text-white">Create every store screenshot from one dashboard</h1>
                <p className="masthead__text text-white mt-20">
                  A centered Sassio SaaS hero with the original dashboard visual language.
                  <br className="md:d-none" /> Good if you want the product to feel broad and platform-like.
                </p>
                <div className="masthead__form mt-30">
                  <div className="form-newsletter mx-auto">
                    <form action="#">
                      <div className="form-group">
                        <input type="email" placeholder="Enter your email address" />
                        <button className="button -md -green rounded-8 text-white" type="submit">
                          Get Started
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="masthead__image relative mt-48">
                  <div className="d-flex justify-center items-center">
                    <img className="initial-img relative z-1" src={img("home-2/masthead/shapes.png")} alt="" />
                  </div>
                  <div className="col-md-10 col-12 absolute-center z-2">
                    <img className="max-w-100" src={img("home-2/masthead/image.png")} alt="Dashboard preview" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FeatureCards accent="green" />
      <section className="layout-pt-md layout-pb-md bg-light-4">
        <div className="container">
          <div className="row items-center y-gap-48">
            <div className="col-lg-6">
              <img src={img("home-2/images/browser.png")} alt="Browser preview" />
            </div>
            <div className="col-lg-5 offset-lg-1">
              <div className="sectionHeading">
                <div className="sectionHeading__subtitle">
                  <span>API AND ASSETS</span>
                </div>
                <h2 className="sectionHeading__title">A more general SaaS landing shape.</h2>
                <p className="sectionHeading__text mt-20">This one is less mobile-specific, but feels mature for a software platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PricingPreview />
      <RefSwitcher active="home-2" />
    </>
  );
}

export function SassioHomeThreeRef() {
  return (
    <>
      <SassioHeader variant="home-3" dark />
      <section className="masthead -type-3">
        <div className="masthead__bg">
          <img src={img("home-3/masthead/bg.png")} alt="" />
        </div>
        <div className="container">
          <div className="row y-gap-64">
            <div className="col-xl-6 col-lg-6 col-md-10">
              <div className="masthead__content relative z-2">
                <h1 className="masthead__title text-white">
                  Automate all your
                  <br className="lg:d-none" /> screenshot production.
                </h1>
                <p className="masthead__text text-white pt-24">
                  A faithful deep-blue Sassio reference, adapted with AppShot copy. It reads more enterprise and automation-led.
                </p>
                <div className="masthead__buttons row y-gap-10 x-gap-16 pt-40 sm:pt-24">
                  <div className="col-auto">
                    <Link href="/sign-up" className="button -md -dark text-white">
                      Start Now
                    </Link>
                  </div>
                  <div className="col-auto">
                    <Link href="/templates" className="button -md -outline-white text-white">
                      View Templates
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="masthead__image relative z-1">
                <img src={img("home-3/masthead/image.png")} alt="Product preview" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="layout-pt-lg layout-pb-sm bg-light-4">
        <div className="container">
          <div className="row y-gap-32">
            {["Branded sets", "Launch workflows", "Export records", "Template locks", "Team roles", "Fast previews"].map((item, index) => (
              <div key={item} className="col-lg-4 col-md-6">
                <div className="bg-white rounded-16 px-32 py-32 h-100">
                  <img src={img(`home-3/icons/${(index % 6) + 1}.svg`)} alt="" style={{ width: 44, height: 44 }} />
                  <h3 className="text-xl fw-700 mt-24">{item}</h3>
                  <p className="mt-12">Dummy content for comparing the Sassio structure against AppShot needs.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PricingPreview />
      <RefSwitcher active="home-3" />
    </>
  );
}

export function SassioHomeFourRef() {
  return (
    <>
      <SassioHeader variant="home-4" />
      <section className="masthead -type-4">
        <div className="masthead__bg">
          <img src={img("home-4/header/bg.svg")} alt="" />
        </div>
        <div className="container">
          <div className="row items-center y-gap-64">
            <div className="col-xl-6 col-lg-6 col-md-10">
              <div className="masthead__content relative z-2">
                <h1 className="masthead__title">
                  Integrated
                  <br className="lg:d-none" /> screenshot marketing
                </h1>
                <p className="masthead__text pt-24 pr-64">
                  A softer Sassio marketing layout for AppShot. This one is lighter, calmer, and more classic SaaS.
                </p>
                <div className="masthead__buttons row y-gap-10 x-gap-16 pt-40 sm:pt-24">
                  <div className="col-auto">
                    <Link href="/sign-up" className="button -md -accent text-white">
                      Start Now
                    </Link>
                  </div>
                  <div className="col-auto">
                    <Link href="/templates" className="button -md -white text-dark-1">
                      Browse Templates
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="masthead__image relative z-1">
                <img src={img("home-4/header/image.png")} alt="Marketing dashboard" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <FeatureCards accent="green" />
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row x-gap-32 y-gap-32">
            {[1, 2, 3].map((item) => (
              <div key={item} className="col-lg-4 col-md-6">
                <div className="rounded-16 bg-light-4 px-32 py-32 text-center">
                  <img src={img(`home-4/images/${item}.png`)} alt="" />
                  <h3 className="text-xl fw-700 mt-24">Campaign section {item}</h3>
                  <p className="mt-12">Placeholder copy to preserve the reference layout while you compare it.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PricingPreview />
      <RefSwitcher active="home-4" />
    </>
  );
}
