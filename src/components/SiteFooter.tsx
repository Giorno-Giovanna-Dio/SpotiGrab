"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs text-zinc-600 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <p>© {new Date().getFullYear()} SpotiGrab</p>
          <Link href="/pricing" className="transition hover:text-zinc-300">
            {t("nav.pricing")}
          </Link>
        </div>
        <p>{t("home.footer")}</p>
      </div>
    </footer>
  );
}
