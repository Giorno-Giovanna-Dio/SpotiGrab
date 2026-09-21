"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/pricing", labelKey: "nav.pricing" },
] as const;

export default function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className="relative z-10 border-b border-white/[0.06]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label={t("home.homeAriaLabel")}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/15">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 8.5a11 11 0 0 1 12 0M7.5 12a8 8 0 0 1 9 0M9 15.5a5 5 0 0 1 6 0" />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight">
              Spoti<span className="text-emerald-400">Grab</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`transition hover:text-white ${
                  pathname === item.href ? "text-white" : "text-zinc-400"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {t("home.serviceStatus")}
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
