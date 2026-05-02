import { Card } from "@/components/ui/card";
import { requireUser } from "@/features/auth/server";
import { listUserProjects, listUserExports } from "@/features/projects/service";
import { listPublishedTemplates } from "@/features/templates/service";

export default async function AppDashboardPage() {
  const user = await requireUser();
  const [templates, projects, exports] = await Promise.all([
    listPublishedTemplates(),
    listUserProjects(user.id),
    listUserExports(user.id),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-slate-600">Published templates</p><p className="text-3xl font-semibold">{templates.length}</p></Card>
        <Card><p className="text-sm text-slate-600">My projects</p><p className="text-3xl font-semibold">{projects.length}</p></Card>
        <Card><p className="text-sm text-slate-600">Exports</p><p className="text-3xl font-semibold">{exports.length}</p></Card>
      </div>
    </div>
  );
}
