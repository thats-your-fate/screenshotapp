/* eslint-disable @next/next/no-css-tags */
import Link from "next/link";

function AstraxLogo({ dark = false }: { dark?: boolean }) {
  return (
    <Link className="navbar-brand py-5" href="/">
      <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 40 40" fill="none">
        <path className="fill-primary" d="M24.5043 9.79724L22.7082 18.3981L35.2929 17.1948L37.1117 7.00605L24.5043 9.79724Z" />
        <path className="fill-primary" d="M31.9171 17.6837L23.2697 20.6189L30.6333 30.3865L40.723 26.6545L31.9171 17.6837Z" />
        <path className="fill-primary" d="M28.4204 27.86L21.4605 22.2312L16.332 33.3249L24.7296 39.7347L28.4204 27.86Z" />
        <path className="fill-primary" d="M17.5913 29.998L19.1912 21.3633L6.63465 22.8288L5.04812 33.0511L17.5913 29.998Z" />
        <path className="fill-primary" d="M10.2917 22.1777L18.8717 19.0632L11.2859 9.45346L1.28177 13.3945L10.2917 22.1777Z" />
        <path className="fill-primary" d="M13.7243 12.2243L20.8121 17.7054L25.6875 6.50938L17.1442 0.277556L13.7243 12.2243Z" />
      </svg>
      <h5 className={`mb-0 ${dark ? "text-dark" : "text-white"}`}>AppShot</h5>
    </Link>
  );
}

function Header() {
  return (
    <header>
      <div className="position-absolute top-0 start-0 w-100">
        <nav className="navbar navbar-expand-lg navbar-transparent z-5 p-0 shadow-none">
          <div className="container">
            <AstraxLogo />
            <div className="d-none d-lg-flex align-self-stretch z-35 position-relative">
              <ul className="navbar-nav mx-auto gap-4 align-items-lg-center">
                <li className="nav-item">
                  <Link className="nav-link text-uppercase" href="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-uppercase" href="/templates">
                    Templates
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-uppercase" href="/pricing">
                    Pricing
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-uppercase" href="/sign-in">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div className="d-flex align-items-center gap-4 align-self-stretch">
              <Link href="/sign-up" className="btn btn-dashed d-none d-md-flex">
                start free
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
                  <path d="M15.8167 7.55759C15.8165 7.5574 15.8163 7.55719 15.8161 7.557L12.5504 4.307C12.3057 4.06353 11.91 4.06444 11.6665 4.30912C11.423 4.55378 11.4239 4.9495 11.6686 5.193L13.8612 7.375H0.625C0.279813 7.375 0 7.65481 0 8C0 8.34519 0.279813 8.625 0.625 8.625H13.8612L11.6686 10.807C11.4239 11.0505 11.423 11.4462 11.6665 11.6909C11.91 11.9356 12.3058 11.9364 12.5504 11.693L15.8162 8.443C15.8163 8.44281 15.8165 8.44259 15.8167 8.4424C16.0615 8.19809 16.0607 7.80109 15.8167 7.55759Z" fill="#B1E346" />
                </svg>
              </Link>
              <Link className="burger-icon burger-icon-white border rounded-3 top-0 end-0 d-lg-none" href="/sign-in" aria-label="Sign in">
                <span className="burger-icon-top" />
                <span className="burger-icon-mid" />
                <span className="burger-icon-bottom" />
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="section-footer-18 position-relative overflow-hidden">
        <div className="container-fluid">
          <div className="container position-relative z-2">
            <div className="row align-items-center py-120">
              <div className="col-lg-5 col-md-10 col-11">
                <span className="content-top btn-text text-white">ready to launch</span>
                <h2 className="my-3 text-primary position-relative">
                  Start
                  <span className="text-white"> your screenshot </span>
                  <span className="stroke-primary text-dark">workflow</span>
                </h2>
              </div>
              <div className="col-lg-7 ps-lg-10">
                <form className="input-group position-relative gap-2">
                  <input type="text" className="form-control email-3 rounded-4" name="email" placeholder="Business email" />
                  <div className="border border-0 rounded-end-4 bg-dark">
                    <Link className="btn btn-primary text-dark h-100 fw-bold" href="/sign-up">
                      <span className="text-dark">join with us</span>
                      <i className="bi bi-arrow-right text-dark" />
                    </Link>
                  </div>
                </form>
              </div>
            </div>
            <div className="d-flex flex-column flex-lg-row gap-3 align-items-center justify-content-between py-4 border-top border-bottom border-opacity-25 border-white">
              <AstraxLogo />
              <div className="d-flex align-items-center justify-content-center flex-wrap gap-md-5 gap-3">
                <Link href="/templates">
                  <span className="btn-text text-white">Templates</span>
                </Link>
                <Link href="/pricing">
                  <span className="btn-text text-white">Pricing</span>
                </Link>
                <Link href="/app">
                  <span className="btn-text text-white">Workspace</span>
                </Link>
                <Link href="/admin">
                  <span className="btn-text text-white">Admin</span>
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column flex-lg-row gap-3 align-items-center py-4 justify-content-between">
              <p className="text-white opacity-50 mb-0">AppShot Studio frontend adapted from AstraX fintech app template.</p>
              <p className="text-white opacity-50 mb-0">Demo admin: admin@appshots.local</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
