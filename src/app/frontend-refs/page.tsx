/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const refs = [
  {
    href: "/frontend-refs/home-1",
    name: "Home 1",
    label: "Mobile app launch",
    image: "/sassio-ref/img/home-1/masthead/phones.png",
    note: "Closest to the AppShot screenshot product idea.",
  },
  {
    href: "/frontend-refs/home-2",
    name: "Home 2",
    label: "Centered SaaS hero",
    image: "/sassio-ref/img/home-2/masthead/image.png",
    note: "Big dashboard hero with dark blue opening section.",
  },
  {
    href: "/frontend-refs/home-3",
    name: "Home 3",
    label: "Automation platform",
    image: "/sassio-ref/img/home-3/masthead/image.png",
    note: "More enterprise, deep-blue product landing page.",
  },
  {
    href: "/frontend-refs/home-4",
    name: "Home 4",
    label: "Marketing suite",
    image: "/sassio-ref/img/home-4/header/image.png",
    note: "Cleaner white/green SaaS layout with softer visuals.",
  },
];

export default function FrontendRefsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f7f9fc", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "center", marginBottom: 32 }}>
          <div>
            <p style={{ color: "#ff5a3d", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Sassio frontend refs</p>
            <h1 style={{ marginTop: 8, fontSize: 52, lineHeight: 1.05, fontWeight: 800, color: "#111827" }}>
              Pick a landing direction.
            </h1>
            <p style={{ marginTop: 16, maxWidth: 680, color: "#64748b", fontSize: 18, lineHeight: 1.7 }}>
              These are reference ports using Sassio CSS/assets much closer to the original template. They are isolated under this route
              so the editor/admin UI stays untouched.
            </p>
          </div>
          <Link href="/" className="button -md -dark text-white">
            Back to app home
          </Link>
        </div>
        <div className="row x-gap-32 y-gap-32">
          {refs.map((ref) => (
            <div key={ref.href} className="col-lg-3 col-md-6">
              <Link href={ref.href} style={{ display: "block", height: "100%" }}>
                <article
                  style={{
                    height: "100%",
                    overflow: "hidden",
                    borderRadius: 24,
                    background: "#fff",
                    boxShadow: "0 24px 70px rgba(17, 24, 39, 0.09)",
                  }}
                >
                  <div style={{ height: 230, display: "grid", placeItems: "center", background: "#edf2ff", padding: 22 }}>
                    <img src={ref.image} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ padding: 22 }}>
                    <p style={{ color: "#ff5a3d", fontWeight: 800 }}>{ref.name}</p>
                    <h2 style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: "#111827" }}>{ref.label}</h2>
                    <p style={{ marginTop: 10, color: "#64748b", lineHeight: 1.6 }}>{ref.note}</p>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
