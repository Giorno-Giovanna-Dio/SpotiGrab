"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('language');
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    startTransition(async () => {
      await fetch('/api/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale })
      });
      window.location.reload();
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:border-emerald-500/30"
        disabled={isPending}
      >
        <span className="text-lg">{locale === 'zh' ? '🇹🇼' : '🇺🇸'}</span>
        <span>{locale === 'zh' ? '繁體中文' : 'English'}</span>
        <svg 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
            <button
              onClick={() => switchLanguage('zh')}
              className={`w-full px-4 py-3 text-left text-sm transition hover:bg-zinc-800 ${
                locale === 'zh' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300'
              }`}
            >
              <span className="mr-2">🇹🇼</span>
              繁體中文
            </button>
            <button
              onClick={() => switchLanguage('en')}
              className={`w-full px-4 py-3 text-left text-sm transition hover:bg-zinc-800 ${
                locale === 'en' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300'
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
