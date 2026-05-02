const tiers = [
  { name: "Starter", price: "$19", note: "Solo creators and small apps" },
  { name: "Growth", price: "$79", note: "Marketing teams shipping frequently" },
  { name: "Enterprise", price: "Custom", note: "SSO, governance, and white-labeling" },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <h1 className="text-4xl text-slate-900">Pricing</h1>
      <p className="mt-2 text-slate-600">Placeholder tiers to extend with billing later.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl text-slate-900">{tier.name}</h2>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{tier.price}</p>
            <p className="mt-2 text-sm text-slate-600">{tier.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
