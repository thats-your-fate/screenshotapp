import { requireUser } from "@/features/auth/server";
import { listUserExports } from "@/features/projects/service";

export default async function ExportsPage() {
  const user = await requireUser();
  const exportsList = await listUserExports(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">Export History</h1>
      <div className="space-y-3">
        {exportsList.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg text-slate-900">{item.project.name}</h2>
                <p className="text-sm text-slate-600">{item.format} • scale {item.scale}</p>
              </div>
              <a href={item.outputUrl} target="_blank" className="rounded-md border border-slate-200 px-3 py-2 text-sm" rel="noreferrer">
                Open file
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
