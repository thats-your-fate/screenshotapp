import { Card } from "@/components/ui/card";
import { listAssetsForAdmin } from "@/features/assets/service";
import { listAdminTemplates } from "@/features/templates/service";

export default async function AdminDashboardPage() {
  const [assets, templates] = await Promise.all([listAssetsForAdmin(), listAdminTemplates()]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><p className="text-sm text-slate-600">Assets</p><p className="text-3xl font-semibold">{assets.length}</p></Card>
        <Card><p className="text-sm text-slate-600">Templates</p><p className="text-3xl font-semibold">{templates.length}</p></Card>
      </div>
    </div>
  );
}
