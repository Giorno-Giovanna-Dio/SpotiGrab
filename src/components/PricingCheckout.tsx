"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PricingPlans from "@/components/PricingPlans";
import { startCheckout } from "@/lib/checkout";

export default function PricingCheckout() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    setError(null);

    try {
      const failure = await startCheckout({ planId });

      if (failure?.reason === "popup") {
        setError(t("errors.popupBlocked"));
      } else if (failure) {
        setError(failure.message ?? t("errors.paymentFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.paymentFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3.5 text-sm text-red-200"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 8v5m0 3h.01" />
          </svg>
          {error}
        </div>
      )}

      <PricingPlans onSelectPlan={handleSelectPlan} loading={loading} showFreePlan />
    </div>
  );
}
