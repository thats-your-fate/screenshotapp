import { listPublishedTemplates } from "@/features/templates/service";

export default async function MarketingTemplatesPage() {
  const templates = await listPublishedTemplates();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <h1 className="text-4xl text-slate-900">Template Showcase</h1>
      <p className="mt-2 text-slate-600">Published templates users can start from.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <article key={template.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-xl text-slate-900">{template.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{template.description || "No description yet."}</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">{template.canvasWidth} x {template.canvasHeight}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
