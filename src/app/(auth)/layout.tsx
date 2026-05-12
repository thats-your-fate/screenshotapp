import Link from "next/link";

import { getAppCopy, getMarketingPathForLocale } from "@/lib/i18n/app";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale, copy } = await getAppCopy();

  return (
    <div className="flex min-h-screen items-start justify-center px-6 py-12 lg:pt-28">
      <div className="w-full max-w-md">
        <Link href={getMarketingPathForLocale(locale)} className="mb-6 inline-block text-sm font-semibold text-slate-600">
          {copy.auth.backToSite}
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
