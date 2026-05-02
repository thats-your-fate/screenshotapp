import Link from "next/link";

import {
  archiveTemplateAction,
  deleteTemplateAction,
  publishTemplateAction,
  unpublishTemplateAction,
} from "@/features/templates/actions";
import { listAdminTemplates } from "@/features/templates/service";

export default async function AdminTemplatesPage() {
  const templates = await listAdminTemplates();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-slate-900">Templates</h1>
        <Link href="/admin/templates/new" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Create template</Link>
      </div>
      <div className="space-y-2">
        {templates.map((template) => (
          <article key={template.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{template.name}</h2>
                <p className="text-xs text-slate-600">{template.status} • {template.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/templates/${template.id}/edit`} className="rounded-md border border-slate-200 px-2 py-1 text-xs">Edit Meta</Link>
                <Link href={`/admin/templates/${template.id}/editor`} className="rounded-md border border-slate-200 px-2 py-1 text-xs">Open Editor</Link>
                {template.status !== "PUBLISHED" ? (
                  <form action={publishTemplateAction.bind(null, template.id)}>
                    <button className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white">Publish</button>
                  </form>
                ) : (
                  <form action={unpublishTemplateAction.bind(null, template.id)}>
                    <button className="rounded-md bg-amber-600 px-2 py-1 text-xs text-white">Unpublish</button>
                  </form>
                )}
                <form action={archiveTemplateAction.bind(null, template.id)}>
                  <button className="rounded-md border border-slate-300 px-2 py-1 text-xs">Archive</button>
                </form>
                <form action={deleteTemplateAction.bind(null, template.id)}>
                  <button className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white">Delete</button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
