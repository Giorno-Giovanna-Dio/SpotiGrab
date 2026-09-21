"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const switchLanguage = async (newLocale: string) => {
    if (newLocale === locale || isSwitching) return;

    setIsSwitching(true);
    setIsOpen(false);

    try {
      const res = await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        throw new Error("Failed to switch language");
      }

      window.location.reload();
    } catch {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-500/30 hover:bg-zinc-800"
        disabled={isSwitching}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{locale === "zh" ? "🇹🇼" : "🇺🇸"}</span>
        <span>{locale === "zh" ? "繁體中文" : "English"}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            role="listbox"
            className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl"
          >
            <button
              role="option"
              aria-selected={locale === "zh"}
              onClick={() => switchLanguage("zh")}
              disabled={isSwitching}
              className={`w-full px-4 py-3 text-left text-sm transition hover:bg-zinc-800 ${
                locale === "zh" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-300"
              }`}
            >
              <span className="mr-2">🇹🇼</span>
              繁體中文
            </button>
            <button
              role="option"
              aria-selected={locale === "en"}
              onClick={() => switchLanguage("en")}
              disabled={isSwitching}
              className={`w-full px-4 py-3 text-left text-sm transition hover:bg-zinc-800 ${
                locale === "en" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-300"
              }`}
            >
              <span className="mr-2">🇺🇸</span>
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}
