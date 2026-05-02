import { AdminAssetUploadForm } from "@/components/admin/asset-upload-form";
import { deleteAssetAction } from "@/features/assets/actions";
import { listAssetsForAdmin } from "@/features/assets/service";

export default async function AdminAssetsPage() {
  const assets = await listAssetsForAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">Asset Manager</h1>
      <AdminAssetUploadForm />
      <div className="space-y-2">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{asset.name}</h2>
                <p className="text-xs text-slate-600">{asset.type} • {asset.fileUrl} • by {asset.createdBy.email}</p>
              </div>
              <form action={deleteAssetAction.bind(null, asset.id)}>
                <button className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
