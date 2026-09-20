"use client";

import { SUBSCRIPTION_PLANS } from "@/lib/subscription";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    onSelectPlan(planId, trackCount);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 overflow-y-auto">
      <div className="max-w-5xl w-full my-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">選擇您的方案</h2>
              <p className="text-zinc-400">選擇最適合您的下載方案</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-zinc-400 hover:text-white transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">
                  {SUBSCRIPTION_PLANS.monthly.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">
                    NT$ {SUBSCRIPTION_PLANS.monthly.price}
                  </span>
                  <span className="text-zinc-400">/ 月</span>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  完美的入門方案，隨時可取消
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                {SUBSCRIPTION_PLANS.monthly.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan("monthly")}
                disabled={loading}
                className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-40"
              >
                選擇月費方案
              </button>
            </div>

            <div className="rounded-xl border-2 border-emerald-500 bg-zinc-950/50 p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  最超值 🔥
                </span>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">
                  {SUBSCRIPTION_PLANS.quarterly.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-emerald-400">
                    NT$ {SUBSCRIPTION_PLANS.quarterly.price}
                  </span>
                  <span className="text-zinc-400">/ 季</span>
                </div>
                <p className="text-sm text-emerald-400 font-semibold mb-2">
                  省 NT$ 48（相當於 83 折）
                </p>
                <p className="text-sm text-zinc-400 mb-4">
                  三個月無限下載，最划算選擇
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                {SUBSCRIPTION_PLANS.quarterly.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan("quarterly")}
                disabled={loading}
                className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-40"
              >
                選擇季度方案
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">
                  {SUBSCRIPTION_PLANS.yearly.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">
                    NT$ {SUBSCRIPTION_PLANS.yearly.price}
                  </span>
                  <span className="text-zinc-400">/ 年</span>
                </div>
                <p className="text-sm text-emerald-400 font-semibold mb-2">
                  省 NT$ 289（相當於 75 折）
                </p>
                <p className="text-sm text-zinc-400 mb-4">
                  長期使用者的最佳選擇
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                {SUBSCRIPTION_PLANS.yearly.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan("yearly")}
                disabled={loading}
                className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-40"
              >
                選擇年度方案
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-zinc-900 px-4 text-zinc-500">或選擇單次付費</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">單曲付費</h3>
                <p className="text-sm text-zinc-400">
                  只下載這次選的 {trackCount} 首歌曲
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  NT$ {trackCount * SUBSCRIPTION_PLANS.payPerTrack.price}
                </div>
                <p className="text-xs text-zinc-500">
                  NT$ {SUBSCRIPTION_PLANS.payPerTrack.price} / 首
                </p>
              </div>
              <button
                onClick={() => handleSelectPlan("payPerTrack", trackCount)}
                disabled={loading}
                className="rounded-lg bg-zinc-800 px-6 py-3 text-sm font-semibold transition hover:bg-zinc-700 disabled:opacity-40 ml-6"
              >
                單次付款
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-500">
            <p>所有方案皆支援信用卡、ATM、超商付款</p>
            <p className="mt-1">訂閱可隨時取消，不綁約</p>
          </div>
        </div>
      </div>
    </div>
  );
}
