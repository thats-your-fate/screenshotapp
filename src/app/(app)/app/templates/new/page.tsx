import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server";
import { createTemplateAction } from "@/features/templates/actions";
import { getAppCopy } from "@/lib/i18n/app";

export default async function AppNewTemplatePage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/app/templates");
  }
  const { copy } = await getAppCopy();

  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl text-slate-900">{copy.templateForm.createTitle}</h1>
      <form action={createTemplateAction} className="grid gap-3">
        <input name="name" placeholder={copy.templateForm.name} required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="slug" placeholder={copy.templateForm.slug} required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="description" placeholder={copy.templateForm.description} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="category" placeholder={copy.templateForm.category} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="canvasWidth"
            type="number"
            defaultValue={1242}
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="canvasHeight"
            type="number"
            defaultValue={2688}
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <input name="backgroundColor" type="color" defaultValue="#ffffff" className="h-10 rounded-md border border-slate-300 px-3 py-1 text-sm" />
        <button type="submit" className="rounded-md !bg-slate-900 px-3 py-2 text-sm font-semibold !text-white hover:!bg-slate-700">{copy.templateForm.create}</button>
      </form>
    </div>
  );
}
