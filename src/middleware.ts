import { NextRequest, NextResponse } from "next/server";
import {
  getCountryFromHeaders,
  isValidLocale,
  resolveLocale,
} from "@/lib/locale";

export function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get("locale")?.value;
  const locale = resolveLocale({
    cookieLocale,
    country: getCountryFromHeaders(request.headers),
    acceptLanguage: request.headers.get("accept-language"),
  });

  const response = NextResponse.next();

  if (!isValidLocale(cookieLocale)) {
    response.cookies.set("locale", locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
