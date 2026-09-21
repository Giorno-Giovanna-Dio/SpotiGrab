"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import PlanCard from "@/components/PlanCard";
import {
  FEATURED_PLAN_ID,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLAN_IDS,
  formatAmount,
  getPayPerTrackTotal,
} from "@/lib/pricing";

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
  /** 已選取的歌曲數，為 0 時單曲付費改為導回首頁選曲 */
  trackCount?: number;
  /** 價格頁會列出免費方案，付款彈窗則不需要 */
  showFreePlan?: boolean;
}

const primaryButtonClass =
  "flex h-11 w-full items-center justify-center rounded-xl bg-emerald-400 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass =
  "flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40";

export default function PricingPlans({
  onSelectPlan,
  loading = false,
  trackCount = 0,
  showFreePlan = false,
}: PricingPlansProps) {
  const t = useTranslations("pricing");
  const hasSelectedTracks = trackCount > 0;

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-6 md:grid-cols-2 ${
          showFreePlan ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {showFreePlan && (
          <PlanCard
            planId="free"
            action={
              <Link href="/" className={secondaryButtonClass}>
                {t("plans.free.cta")}
              </Link>
            }
          />
        )}

        {SUBSCRIPTION_PLAN_IDS.map((planId) => (
          <PlanCard
            key={planId}
            planId={planId}
            featured={planId === FEATURED_PLAN_ID}
            action={
              <button
                type="button"
                onClick={() => onSelectPlan(planId)}
                disabled={loading}
                className={planId === FEATURED_PLAN_ID ? primaryButtonClass : secondaryButtonClass}
              >
                {loading ? t("processing") : t(`plans.${planId}.cta`)}
              </button>
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span aria-hidden="true" className="h-px flex-1 bg-white/[0.06]" />
        {t("orPayOnce")}
        <span aria-hidden="true" className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#111411] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">{t("plans.payPerTrack.name")}</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {hasSelectedTracks
                ? t("payPerTrack.selectedTracks", { count: trackCount })
                : t("plans.payPerTrack.tagline")}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              {hasSelectedTracks && (
                <div className="text-2xl font-semibold text-emerald-300">
                  NT$ {formatAmount(getPayPerTrackTotal(trackCount))}
                </div>
              )}
              <p className="text-xs text-zinc-500">
                {t("payPerTrack.unitPrice", {
                  price: formatAmount(SUBSCRIPTION_PLANS.payPerTrack.price),
                })}
              </p>
            </div>

            {hasSelectedTracks ? (
              <button
                type="button"
                onClick={() => onSelectPlan("payPerTrack")}
                disabled={loading}
                className="flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? t("processing") : t("plans.payPerTrack.cta")}
              </button>
            ) : (
              <Link
                href="/"
                className="flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                {t("payPerTrack.selectTracks")}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-zinc-500">
        <p>{t("paymentMethods")}</p>
        <p className="mt-1">{t("noContract")}</p>
      </div>
    </div>
  );
}
