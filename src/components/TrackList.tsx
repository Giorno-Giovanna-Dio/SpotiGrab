"use client";

import { useTranslations } from "next-intl";
import type { TrackWithMatch } from "@/lib/types";

interface TrackListProps {
  tracks: TrackWithMatch[];
  onToggle: (trackId: string) => void;
  onToggleAll: (selected: boolean) => void;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TrackList({ tracks, onToggle, onToggleAll }: TrackListProps) {
  const t = useTranslations("trackList");
  const matchedCount = tracks.filter((track) => track.youtube).length;
  const selectedCount = tracks.filter((track) => track.selected).length;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/8 bg-[#111411] shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-3 border-b border-white/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{t("title")}</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {t("summary", { matched: matchedCount, selected: selectedCount })}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-black/20 p-1">
          <button
            onClick={() => onToggleAll(true)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/10"
          >
            {t("selectAll")}
          </button>
          <span className="h-4 w-px bg-white/8" />
          <button
            onClick={() => onToggleAll(false)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
          >
            {t("unselectAll")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 sm:grid-cols-[2rem_2rem_1fr_14rem] sm:px-5">
        <span />
        <span className="hidden sm:block">#</span>
        <span>{t("trackColumn")}</span>
        <span className="text-right">{t("statusColumn")}</span>
      </div>

      <div className="max-h-[460px] overflow-y-auto">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={`group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-white/5 px-4 py-3.5 transition last:border-b-0 sm:grid-cols-[2rem_2rem_1fr_14rem] sm:px-5 ${
              track.youtube ? "hover:bg-white/[0.025]" : "opacity-55"
            }`}
          >
            <input
              aria-label={`${track.selected ? t("deselectTrack") : t("selectTrack")} ${track.name}`}
              type="checkbox"
              checked={track.selected}
              disabled={!track.youtube}
              onChange={() => onToggle(track.id)}
              className="h-4 w-4 cursor-pointer rounded border-zinc-600 bg-transparent accent-emerald-400 disabled:cursor-not-allowed"
            />
            <span className="hidden text-xs tabular-nums text-zinc-600 sm:block">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-100 transition group-hover:text-white">
                {track.name}
              </p>
              <p className="mt-1 truncate text-xs text-zinc-500">
                {track.artists.map((artist) => artist.name).join(", ")} · {formatDuration(track.durationMs)}
              </p>
            </div>
            <div className="max-w-24 sm:max-w-56 sm:text-right">
              {track.youtube ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/8 px-2 py-1 text-[10px] font-medium text-emerald-300 sm:hidden">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t("matchedBadge")}
                  </span>
                  <p className="hidden truncate text-xs text-zinc-400 sm:block" title={track.youtube.title}>
                    <span className="mr-1.5 text-emerald-400">●</span>
                    {track.youtube.title}
                  </p>
                </>
              ) : (
                <span className="inline-flex rounded-full border border-amber-400/15 bg-amber-400/8 px-2 py-1 text-[10px] font-medium text-amber-300">
                  {t("notFound")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
