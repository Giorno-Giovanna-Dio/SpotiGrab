export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh";

/** 使用繁體中文的國家/地區（依 IP 判斷） */
const ZH_COUNTRIES = new Set(["TW", "HK", "MO"]);

export function isValidLocale(value: string | null | undefined): value is Locale {
  return value === "zh" || value === "en";
}

export function detectLocaleFromCountry(
  country: string | null | undefined
): Locale | null {
  if (!country) return null;
  return ZH_COUNTRIES.has(country.toUpperCase()) ? "zh" : "en";
}

export function detectLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  for (const part of acceptLanguage.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    if (tag.startsWith("zh")) return "zh";
    if (tag.startsWith("en")) return "en";
  }

  return "en";
}

export function resolveLocale(options: {
  cookieLocale?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  const { cookieLocale, country, acceptLanguage } = options;

  if (isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  const fromCountry = detectLocaleFromCountry(country);
  if (fromCountry) return fromCountry;

  return detectLocaleFromAcceptLanguage(acceptLanguage);
}

export function getCountryFromHeaders(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code")
  );
}
