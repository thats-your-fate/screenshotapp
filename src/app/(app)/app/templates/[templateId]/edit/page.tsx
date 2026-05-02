import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server";
import { updateTemplateMetaAction } from "@/features/templates/actions";
import { getTemplateForAdmin } from "@/features/templates/service";

export default async function AppEditTemplateMetaPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/app/templates");
  }

  const { templateId } = await params;
  const template = await getTemplateForAdmin(templateId);

  if (!template) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl text-slate-900">Edit Template Metadata</h1>
      <form action={updateTemplateMetaAction.bind(null, templateId)} className="grid gap-3">
        <input name="name" defaultValue={template.name} required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="slug" defaultValue={template.slug} required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="description" defaultValue={template.description || ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="category" defaultValue={template.category || ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="canvasWidth"
            type="number"
            defaultValue={template.canvasWidth}
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="canvasHeight"
            type="number"
            defaultValue={template.canvasHeight}
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <input name="backgroundColor" type="color" defaultValue={template.backgroundColor} className="h-10 rounded-md border border-slate-300 px-3 py-1 text-sm" />
        <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Save metadata</button>
      </form>
    </div>
  );
}
