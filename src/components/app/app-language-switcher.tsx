"use client";

import { useRouter } from "next/navigation";

import appCopy from "@/lib/i18n/app-copy.json";
import type { AppLocale } from "@/lib/i18n/app";

export function AppLanguageSwitcher({ activeLocale, label }: { activeLocale: AppLocale; label: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="sr-only">{label}</span>
      <select
        value={activeLocale}
        aria-label={label}
        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
        onChange={(event) => {
          document.cookie = `app_locale=${event.target.value}; Path=/; Max-Age=31536000; SameSite=Lax`;
          router.refresh();
        }}
      >
        {Object.entries(appCopy).map(([locale, item]) => (
          <option key={locale} value={locale}>
            {item.flag} {item.shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
