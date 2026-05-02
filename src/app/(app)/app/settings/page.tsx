import { requireUser } from "@/features/auth/server";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl text-slate-900">Account Settings</h1>
      <p className="mt-2 text-slate-600">Placeholder for profile updates, team invites, and billing integration.</p>
      <dl className="mt-6 grid gap-2 text-sm">
        <div><dt className="font-semibold text-slate-700">Name</dt><dd>{user.name}</dd></div>
        <div><dt className="font-semibold text-slate-700">Email</dt><dd>{user.email}</dd></div>
        <div><dt className="font-semibold text-slate-700">Role</dt><dd>{user.role}</dd></div>
      </dl>
    </div>
  );
}
