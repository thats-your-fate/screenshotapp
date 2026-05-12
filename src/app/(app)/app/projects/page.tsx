import Link from "next/link";

import { requireUser } from "@/features/auth/server";
import { listUserProjects } from "@/features/projects/service";
import { getAppCopy } from "@/lib/i18n/app";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listUserProjects(user.id);
  const { copy } = await getAppCopy();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">{copy.projects.title}</h1>
      <div className="space-y-3">
        {projects.map((project) => (
          <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg text-slate-900">{project.name}</h2>
                <p className="text-sm text-slate-600">{copy.projects.template}: {project.template.name}</p>
              </div>
              <Link href={`/app/projects/${project.id}/editor`} className="rounded-md !bg-slate-900 px-3 py-2 text-sm font-semibold !text-white hover:!bg-slate-700">
                {copy.projects.openEditor}
              </Link>
            </div>
          </article>
        ))}
        {projects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            {copy.projects.empty}
          </div>
        ) : null}
      </div>
    </div>
  );
}
