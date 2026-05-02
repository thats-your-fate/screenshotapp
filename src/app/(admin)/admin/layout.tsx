import Link from "next/link";

import { SignOutButton } from "@/components/app/sign-out-button";
import { requireAdmin } from "@/features/auth/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">Admin Area</p>
            <p className="font-semibold text-slate-900">{admin.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Public site</Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <Link href="/admin" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">Dashboard</Link>
          <Link href="/admin/assets" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">Asset Manager</Link>
          <Link href="/admin/templates" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">Templates</Link>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
