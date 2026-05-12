import { cookies } from "next/headers";

import appCopy from "@/lib/i18n/app-copy.json";

export type AppLocale = keyof typeof appCopy;

const defaultLocale: AppLocale = "en";

export function getMarketingPathForLocale(locale: AppLocale) {
  return locale === "en" ? "/" : `/${locale}/`;
}

export function isAppLocale(value: string | undefined): value is AppLocale {
  return value === "en" || value === "de" || value === "pt-br" || value === "es";
}

export async function getAppLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("app_locale")?.value;
  return isAppLocale(locale) ? locale : defaultLocale;
}

export async function getAppCopy() {
  const locale = await getAppLocale();
  return { locale, copy: appCopy[locale], allCopy: appCopy };
}
