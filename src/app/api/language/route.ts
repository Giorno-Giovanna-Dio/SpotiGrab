import { NextRequest, NextResponse } from "next/server";
import { isValidLocale } from "@/lib/locale";

export async function POST(request: NextRequest) {
  const { locale } = await request.json();

  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set("locale", locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
