import Link from "next/link";

import { AppLanguageSwitcher } from "@/components/app/app-language-switcher";
import { SignOutButton } from "@/components/app/sign-out-button";
import { requireUser } from "@/features/auth/server";
import { getAppCopy, getMarketingPathForLocale } from "@/lib/i18n/app";

export default async function UserAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { locale, copy } = await getAppCopy();
  const navLinks = [
    { href: "/app", label: copy.shell.nav.dashboard },
    { href: "/app/templates", label: copy.shell.nav.templates },
    { href: "/app/projects", label: copy.shell.nav.projects },
    { href: "/app/exports", label: copy.shell.nav.exports },
    { href: "/app/settings", label: copy.shell.nav.settings },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">{copy.shell.userArea}</p>
            <p className="font-semibold text-slate-900">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <AppLanguageSwitcher activeLocale={locale} label={copy.shell.language} />
            <Link href={getMarketingPathForLocale(locale)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
              {copy.shell.publicSite}
            </Link>
            <SignOutButton label={copy.shell.signOut} />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">
              {link.label}
            </Link>
          ))}
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
