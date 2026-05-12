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
import { getAppCopy } from "@/lib/i18n/app";

type DeviceFilter = "all" | "iphone" | "android";

function normalizeDeviceFilter(value?: string): DeviceFilter {
  return value === "iphone" || value === "android" ? value : "all";
}

function deviceLabel(deviceType: "iphone" | "android" | null, fallback: string) {
  if (deviceType === "android") return "Android";
  if (deviceType === "iphone") return "iPhone";
  return fallback;
}

export default async function UserTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ device?: string }>;
}) {
  const user = await requireUser();
  const { device } = await searchParams;
  const activeDeviceFilter = normalizeDeviceFilter(device);
  const isAdmin = user.role === "ADMIN";
  const templates = isAdmin ? await listAdminTemplates() : await listPublishedTemplates();
  const { copy } = await getAppCopy();
  const filteredTemplates =
    activeDeviceFilter === "all"
      ? templates
      : templates.filter((template) => template.deviceType === activeDeviceFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl text-slate-900">{copy.templates.title}</h1>
        {isAdmin ? (
          <Link
            href="/app/templates/new"
            className="rounded-md !bg-slate-900 px-3 py-2 text-sm font-semibold !text-white hover:!bg-slate-700"
          >
            {copy.templates.createTemplate}
          </Link>
        ) : null}
      </div>
      <form className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{copy.templates.deviceType}</p>
          <p className="text-xs text-slate-500">{copy.templates.deviceHelp}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            name="device"
            defaultValue={activeDeviceFilter}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="all">{copy.templates.allDevices}</option>
            <option value="iphone">iPhone</option>
            <option value="android">Android</option>
          </select>
          <button type="submit" className="rounded-md !bg-slate-900 px-3 py-2 text-sm font-semibold !text-white hover:!bg-slate-700">
            {copy.templates.apply}
          </button>
        </div>
      </form>
      <div className="space-y-5">
        {filteredTemplates.map((template) => (
            <article key={template.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <TemplateListPreview screens={template.editorScreens} />
              <div className="flex items-center justify-between gap-3">
                <h2 className="mt-3 text-xl text-slate-900">{template.name}</h2>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {deviceLabel(template.deviceType, copy.templates.device)}
                  </span>
                  <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {template.status}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{template.description || copy.templates.noDescription}</p>
              <p className="mt-3 text-xs text-slate-500">{template.canvasWidth} x {template.canvasHeight}</p>
              <div className="mx-auto mt-4 w-full space-y-2 md:w-1/2">
                {template.status !== "ARCHIVED" ? (
                  <form action={createProjectFromTemplateAction}>
                    <input type="hidden" name="templateId" value={template.id} />
                    <button
                      type="submit"
                      className="w-full rounded-md !bg-slate-900 px-3 py-2 text-sm font-semibold !text-white hover:!bg-slate-700"
                      disabled={template.status === "DRAFT"}
                      title={template.status === "DRAFT" ? copy.templates.publishFirst : undefined}
                    >
                      {copy.templates.createProject}
                    </button>
                  </form>
                ) : null}

                {isAdmin ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/app/templates/${template.id}/edit`}
                      className="rounded-md border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-800"
                    >
                      {copy.templates.editMeta}
                    </Link>
                    <Link
                      href={`/app/templates/${template.id}/editor`}
                      className="rounded-md border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-800"
                    >
                      {copy.templates.openEditor}
                    </Link>
                    {template.status !== "PUBLISHED" ? (
                      <form action={publishTemplateAction.bind(null, template.id)} className="col-span-2">
                        <button type="submit" className="w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                          {copy.templates.publishTemplate}
                        </button>
                      </form>
                    ) : (
                      <form action={unpublishTemplateAction.bind(null, template.id)} className="col-span-2">
                        <button type="submit" className="w-full rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white">
                          {copy.templates.moveToDraft}
                        </button>
                      </form>
                    )}
                    <form action={archiveTemplateAction.bind(null, template.id)} className="col-span-2">
                      <button type="submit" className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                        {copy.templates.archive}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </article>
        ))}
        {filteredTemplates.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            {copy.templates.empty}
          </div>
        ) : null}
      </div>
    </div>
  );
}
