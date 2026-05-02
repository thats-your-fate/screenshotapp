import Link from "next/link";

import { requireUser } from "@/features/auth/server";
import { listUserProjects } from "@/features/projects/service";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listUserProjects(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">My Projects</h1>
      <div className="space-y-3">
        {projects.map((project) => (
          <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg text-slate-900">{project.name}</h2>
                <p className="text-sm text-slate-600">Template: {project.template.name}</p>
              </div>
              <Link href={`/app/projects/${project.id}/editor`} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                Open Editor
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
