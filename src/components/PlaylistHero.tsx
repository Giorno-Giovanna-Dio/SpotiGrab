"use client";

import { SpinnerIcon } from "./icons";

interface PlaylistHeroProps {
  name: string;
  image?: string;
  total: number;
  matched: number;
  unmatched: number;
  matching: boolean;
  matchProgress: number;
  matchTotal: number;
}

export default function PlaylistHero({
  name,
  image,
  total,
  matched,
  unmatched,
  matching,
  matchProgress,
  matchTotal,
}: PlaylistHeroProps) {
  const matchPercent = matchTotal > 0 ? Math.round((matchProgress / matchTotal) * 100) : 0;

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative shrink-0 self-center sm:self-auto">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-28 w-28 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 sm:h-32 sm:w-32"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-zinc-800 sm:h-32 sm:w-32">
              <span className="text-3xl">🎵</span>
            </div>
          )}
          {matching && (
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 shadow-lg">
              <SpinnerIcon className="h-4 w-4 text-emerald-400" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="truncate text-xl font-bold text-zinc-50 sm:text-2xl">{name}</h2>
          <p className="mt-1 text-sm text-zinc-500">{total} 首歌曲</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <StatBadge label="已配對" value={matched} tone="success" />
            <StatBadge label="未找到" value={unmatched} tone={unmatched > 0 ? "warn" : "muted"} />
            {matching && (
              <StatBadge label="配對進度" value={`${matchPercent}%`} tone="active" />
            )}
          </div>

          {matching && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>YouTube 配對中</span>
                <span>
                  {matchProgress} / {matchTotal}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out"
                  style={{ width: `${matchPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "success" | "warn" | "muted" | "active";
}) {
  const styles = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    warn: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    muted: "border-zinc-700/50 bg-zinc-800/50 text-zinc-500",
    active: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  };

  return (
    <div className={`rounded-lg border px-3 py-1.5 text-xs ${styles[tone]}`}>
      <span className="text-zinc-500">{label} </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
