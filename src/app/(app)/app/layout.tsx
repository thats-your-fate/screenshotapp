import Link from "next/link";

import { SignOutButton } from "@/components/app/sign-out-button";
import { requireUser } from "@/features/auth/server";

export default async function UserAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">User Area</p>
            <p className="font-semibold text-slate-900">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Public site</Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <Link href="/app" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">Dashboard</Link>
          <Link href="/app/templates" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">Templates</Link>
          <Link href="/app/projects" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">My Projects</Link>
          <Link href="/app/exports" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">Exports</Link>
          <Link href="/app/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">Settings</Link>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
