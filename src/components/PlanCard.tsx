"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  FREE_DAILY_DOWNLOAD_LIMIT,
  SUBSCRIPTION_PLANS,
  formatAmount,
  getPlanPricing,
  isSubscriptionPlanId,
  type PlanId,
} from "@/lib/pricing";

interface PlanCardProps {
  planId: PlanId;
  featured?: boolean;
  /** CTA 由呼叫端提供，價格頁用連結、付款彈窗用按鈕 */
  action: ReactNode;
}

export default function PlanCard({ planId, featured = false, action }: PlanCardProps) {
  const t = useTranslations("pricing");
  const plan = SUBSCRIPTION_PLANS[planId];
  const pricing = isSubscriptionPlanId(planId) ? getPlanPricing(planId) : null;
  const showPeriod = planId !== "free";

  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border p-6 ${
        featured
          ? "border-emerald-400/60 bg-emerald-400/[0.04] shadow-lg shadow-emerald-500/5"
          : "border-white/8 bg-[#111411]"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-bold text-emerald-950">
          {t("bestValue")}
        </span>
      )}

      <h3 className="text-lg font-semibold text-white">{t(`plans.${planId}.name`)}</h3>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className={`text-4xl font-semibold tracking-tight ${
            featured ? "text-emerald-300" : "text-white"
          }`}
        >
          NT$ {formatAmount(plan.price)}
        </span>
        {showPeriod && (
          <span className="text-sm text-zinc-500">{t(`period.${planId}`)}</span>
        )}
      </div>

      {pricing && pricing.savings > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-sm font-medium text-emerald-300">
            {t("savings", {
              amount: formatAmount(pricing.savings),
              percent: pricing.savingsPercent,
              listPrice: formatAmount(pricing.listPrice),
            })}
          </p>
          <p className="text-xs text-zinc-500">
            {t("monthlyAverage", { price: formatAmount(pricing.monthlyAverage) })}
          </p>
        </div>
      )}

      <p className="mt-4 text-sm leading-6 text-zinc-400">{t(`plans.${planId}.tagline`)}</p>

      <ul className="mt-5 mb-6 space-y-3">
        {plan.featureKeys.map((featureKey) => (
          <li key={featureKey} className="flex items-start gap-2 text-sm text-zinc-300">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[10px] text-emerald-300">
              ✓
            </span>
            {t(`features.${featureKey}`, { count: FREE_DAILY_DOWNLOAD_LIMIT })}
          </li>
        ))}
      </ul>

      <div className="mt-auto">{action}</div>
    </div>
  );
}
