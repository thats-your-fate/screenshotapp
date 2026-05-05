/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const plans = [
  { name: "Starter", price: "$19", text: "For solo creators testing store visuals.", highlight: false },
  { name: "Growth", price: "$79", text: "For teams shipping screenshots regularly.", highlight: true },
  { name: "Studio", price: "$249", text: "For agencies managing many app brands.", highlight: false },
];

const included = ["Published templates", "Project editor", "Local uploads", "Bulk exports"];

export default function PricingPage() {
  return (
    <>
      <section
        className="fintech-app-home-section-1 position-relative overflow-hidden pt-250 pb-160 rounded-bottom-5 z-4"
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
        <div className="container position-relative z-2 pt-8 text-center overflow-hidden">
          <span className="content-top btn-text text-white">APP PLANS</span>
          <h1 className="title-stroke my-3 text-primary">
            Pricing
            <span className="text-white">
              {" "}for <br />
              screenshot
            </span>
            <span className="text-secondary"> teams </span>
          </h1>
          <p className="fs-5 text-white opacity-75 mb-0 mx-auto" style={{ maxWidth: 720 }}>
            Choose the workspace size that fits your launch rhythm. Billing is dummy content for now, ready for real plans later.
          </p>
        </div>
      </section>

      <section className="fintech-app-home-section-5 position-relative pt-120 pb-120 bg-dark rounded-bottom-5">
        <div className="container position-relative z-1 overflow-hidden">
          <div className="row">
            <div className="text-center">
              <span className="content-top btn-text text-white">simple pricing</span>
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
                <div className={`card-pricing rounded-4 p-md-6 p-4 position-relative h-100 ${plan.highlight ? "bg-primary" : "border border-white border-opacity-10"}`}>
                  <span className={`btn-text ${plan.highlight ? "text-dark opacity-75" : "text-white opacity-50"}`}>{plan.name}</span>
                  <h1 className={`mb-3 ${plan.highlight ? "text-dark" : ""}`}>{plan.price}</h1>
                  <p className={`fs-7 ${plan.highlight ? "text-dark" : "text-white opacity-75"}`}>{plan.text}</p>
                  <Link href="/sign-up" className={`mt-3 hover-up btn w-100 mb-6 ${plan.highlight ? "btn-dark text-primary border-dark" : "btn-outline-dark"}`}>
                    get started
                  </Link>
                  <span className={`btn-text ${plan.highlight ? "text-dark" : "text-white"}`}>What is included:</span>
                  <ul className="list-unstyled mt-3 mb-0">
                    {included.map((item) => (
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
    </>
  );
}
