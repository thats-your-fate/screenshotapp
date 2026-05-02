import Link from "next/link";

const features = [
  "Template-driven screenshot generation",
  "Role-based backoffice with admin/user spaces",
  "Editable constraints per element",
  "Local-first asset and export storage",
];

export default function MarketingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">SaaS Starter Boilerplate</p>
        <h1 className="mt-4 text-5xl leading-tight text-slate-900">Ship App Store creative tooling in weeks, not months.</h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-600">
          AppShot Studio is a template-based screenshot generation platform foundation built with modern Next.js App Router,
          Prisma, Auth.js, and server-first RBAC.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/sign-up" className="rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Create account
          </Link>
          <Link href="/templates" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
            Browse templates
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <article key={feature} className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl text-slate-900">{feature}</h2>
            <p className="mt-2 text-sm text-slate-600">Production-minded defaults with room for teams, billing, and localization.</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border border-slate-200 bg-amber-100/60 p-8">
        <h2 className="text-2xl text-slate-900">Ready to build your screenshot pipeline?</h2>
        <p className="mt-2 text-slate-700">Sign up and start from published templates immediately.</p>
        <Link href="/sign-up" className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Start free
        </Link>
      </section>
    </div>
  );
}
