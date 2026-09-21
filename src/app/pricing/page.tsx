import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import PricingCheckout from "@/components/PricingCheckout";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  FREE_DAILY_DOWNLOAD_LIMIT,
  SUBSCRIPTION_PLANS,
  formatAmount,
  getPlanPricing,
} from "@/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

const FAQ_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  const quarterly = getPlanPricing("quarterly");
  const yearly = getPlanPricing("yearly");

  const comparisonRows = [
    {
      planId: "free" as const,
      price: `NT$ ${formatAmount(SUBSCRIPTION_PLANS.free.price)}`,
      monthlyAverage: `NT$ ${formatAmount(SUBSCRIPTION_PLANS.free.price)}`,
      dailyLimit: t("compare.tracksPerDay", { count: FREE_DAILY_DOWNLOAD_LIMIT }),
      quality: t("compare.standardQuality"),
      savings: t("compare.none"),
    },
    {
      planId: "monthly" as const,
      price: `NT$ ${formatAmount(SUBSCRIPTION_PLANS.monthly.price)} ${t("period.monthly")}`,
      monthlyAverage: `NT$ ${formatAmount(SUBSCRIPTION_PLANS.monthly.price)}`,
      dailyLimit: t("compare.unlimited"),
      quality: t("compare.highQuality"),
      savings: t("compare.none"),
    },
    {
      planId: "quarterly" as const,
      price: `NT$ ${formatAmount(SUBSCRIPTION_PLANS.quarterly.price)} ${t("period.quarterly")}`,
      monthlyAverage: `NT$ ${formatAmount(quarterly.monthlyAverage)}`,
      dailyLimit: t("compare.unlimited"),
      quality: t("compare.highQuality"),
      savings: t("compare.savingsValue", { percent: quarterly.savingsPercent }),
    },
    {
      planId: "yearly" as const,
      price: `NT$ ${formatAmount(SUBSCRIPTION_PLANS.yearly.price)} ${t("period.yearly")}`,
      monthlyAverage: `NT$ ${formatAmount(yearly.monthlyAverage)}`,
      dailyLimit: t("compare.unlimited"),
      quality: t("compare.highQuality"),
      savings: t("compare.savingsValue", { percent: yearly.savingsPercent }),
    },
    {
      planId: "payPerTrack" as const,
      price: `NT$ ${formatAmount(SUBSCRIPTION_PLANS.payPerTrack.price)} ${t("period.payPerTrack")}`,
      monthlyAverage: t("compare.none"),
      dailyLimit: t("compare.onDemand"),
      quality: t("compare.highQuality"),
      savings: t("compare.none"),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070908] text-zinc-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-28rem] h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <SiteHeader />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 text-center sm:px-8 md:pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m13 2-9 11h7l-1 9 9-12h-7l1-8Z" />
            </svg>
            {t("badge")}
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            {t("description")}
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {t("subscriptionsTitle")}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">{t("subscriptionsDescription")}</p>
          </div>
          <PricingCheckout />
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
            <h2 className="mb-7 text-xl font-semibold tracking-tight text-white">
              {t("compare.title")}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#111411]">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-white/[0.06] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">{t("compare.planColumn")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("compare.priceColumn")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("compare.monthlyAverageColumn")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("compare.dailyLimitColumn")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("compare.qualityColumn")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("compare.savingsColumn")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {comparisonRows.map((row) => (
                    <tr key={row.planId}>
                      <th scope="row" className="px-5 py-4 font-medium text-white">
                        {t(`plans.${row.planId}.name`)}
                      </th>
                      <td className="px-5 py-4 tabular-nums text-zinc-300">{row.price}</td>
                      <td className="px-5 py-4 tabular-nums text-zinc-300">{row.monthlyAverage}</td>
                      <td className="px-5 py-4 text-zinc-300">{row.dailyLimit}</td>
                      <td className="px-5 py-4 text-zinc-300">{row.quality}</td>
                      <td className="px-5 py-4 font-medium text-emerald-300">{row.savings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <h2 className="mb-7 text-xl font-semibold tracking-tight text-white">
            {t("faq.title")}
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            {FAQ_KEYS.map((key) => (
              <div key={key} className="rounded-2xl border border-white/8 bg-[#111411] p-5">
                <dt className="text-sm font-semibold text-white">{t(`faq.q${key}`)}</dt>
                <dd className="mt-2 text-sm leading-6 text-zinc-400">{t(`faq.a${key}`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              {t("ctaDescription")}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-emerald-400 px-7 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
