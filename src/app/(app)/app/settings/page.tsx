import { requireUser } from "@/features/auth/server";
import { getAppCopy } from "@/lib/i18n/app";

export default async function SettingsPage() {
  const user = await requireUser();
  const { copy } = await getAppCopy();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl text-slate-900">{copy.settings.title}</h1>
      <p className="mt-2 text-slate-600">{copy.settings.intro}</p>
      <dl className="mt-6 grid gap-2 text-sm">
        <div><dt className="font-semibold text-slate-700">{copy.settings.name}</dt><dd>{user.name}</dd></div>
        <div><dt className="font-semibold text-slate-700">{copy.settings.email}</dt><dd>{user.email}</dd></div>
        <div><dt className="font-semibold text-slate-700">{copy.settings.role}</dt><dd>{user.role}</dd></div>
      </dl>
    </div>
  );
}
