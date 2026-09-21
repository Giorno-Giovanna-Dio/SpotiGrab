import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { getCountryFromHeaders, resolveLocale } from "@/lib/locale";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const locale = resolveLocale({
    cookieLocale: cookieStore.get("locale")?.value,
    country: getCountryFromHeaders(headerStore),
    acceptLanguage: headerStore.get("accept-language"),
  });

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
