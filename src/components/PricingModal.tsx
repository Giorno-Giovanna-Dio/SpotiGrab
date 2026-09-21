"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import PricingPlans from "@/components/PricingPlans";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string, trackCount?: number) => void;
  trackCount: number;
}

export default function PricingModal({
  isOpen,
  onClose,
  onSelectPlan,
  trackCount,
}: PricingModalProps) {
  const t = useTranslations("pricing");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("modalTitle")}
        className="mx-auto my-8 w-full max-w-5xl rounded-2xl border border-white/8 bg-[#0b0d0c] p-6 sm:p-8"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t("modalTitle")}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">{t("modalDescription")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("modalClose")}
            className="text-zinc-400 transition hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <PricingPlans
          onSelectPlan={(planId) => onSelectPlan(planId, trackCount)}
          trackCount={trackCount}
        />

        <div className="mt-6 text-center">
          <Link href="/pricing" className="text-xs text-emerald-300 transition hover:text-emerald-200">
            {t("modalFullPricing")}
          </Link>
        </div>
      </div>
    </div>
  );
}
