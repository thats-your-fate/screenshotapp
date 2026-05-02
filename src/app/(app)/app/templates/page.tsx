import Link from "next/link";

import { TemplateListPreview } from "@/components/editor/template-list-preview";
import { requireUser } from "@/features/auth/server";
import { createProjectFromTemplateAction } from "@/features/projects/actions";
import {
  archiveTemplateAction,
  publishTemplateAction,
  unpublishTemplateAction,
} from "@/features/templates/actions";
import { listAdminTemplates, listPublishedTemplates } from "@/features/templates/service";

export default async function UserTemplatesPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const templates = isAdmin ? await listAdminTemplates() : await listPublishedTemplates();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl text-slate-900">Templates Gallery</h1>
        {isAdmin ? (
          <Link
            href="/app/templates/new"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Create Template
          </Link>
        ) : null}
      </div>
      <div className="space-y-5">
        {templates.map((template) => (
            <article key={template.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <TemplateListPreview screens={template.editorScreens} />
              <div className="flex items-center justify-between gap-3">
                <h2 className="mt-3 text-xl text-slate-900">{template.name}</h2>
                <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {template.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{template.description || "No description yet."}</p>
              <p className="mt-3 text-xs text-slate-500">{template.canvasWidth} x {template.canvasHeight}</p>
              <div className="mx-auto mt-4 w-full space-y-2 md:w-1/2">
                {template.status !== "ARCHIVED" ? (
                  <form action={createProjectFromTemplateAction}>
                    <input type="hidden" name="templateId" value={template.id} />
                    <button
                      type="submit"
                      className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      disabled={template.status === "DRAFT"}
                      title={template.status === "DRAFT" ? "Publish template first." : undefined}
                    >
                      Create Project
                    </button>
                  </form>
                ) : null}

                {isAdmin ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/app/templates/${template.id}/edit`}
                      className="rounded-md border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-800"
                    >
                      Edit Meta
                    </Link>
                    <Link
                      href={`/app/templates/${template.id}/editor`}
                      className="rounded-md border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-800"
                    >
                      Open Editor
                    </Link>
                    {template.status !== "PUBLISHED" ? (
                      <form action={publishTemplateAction.bind(null, template.id)} className="col-span-2">
                        <button type="submit" className="w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                          Publish Template
                        </button>
                      </form>
                    ) : (
                      <form action={unpublishTemplateAction.bind(null, template.id)} className="col-span-2">
                        <button type="submit" className="w-full rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white">
                          Move To Draft
                        </button>
                      </form>
                    )}
                    <form action={archiveTemplateAction.bind(null, template.id)} className="col-span-2">
                      <button type="submit" className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                        Archive
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </article>
        ))}
      </div>
    </div>
  );
}
