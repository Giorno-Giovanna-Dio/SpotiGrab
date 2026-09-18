"use client";

import { useMemo, useState } from "react";
import type { TrackWithMatch } from "@/lib/types";
import { CheckIcon, SearchIcon, SpinnerIcon } from "./icons";

interface TrackListProps {
  tracks: TrackWithMatch[];
  matching?: boolean;
  onToggle: (trackId: string) => void;
  onToggleAll: (selected: boolean) => void;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type FilterMode = "all" | "matched" | "unmatched" | "selected";

export default function TrackList({
  tracks,
  matching = false,
  onToggle,
  onToggleAll,
}: TrackListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const matchedCount = tracks.filter((t) => t.youtube).length;
  const selectedCount = tracks.filter((t) => t.selected).length;

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tracks.filter((track) => {
      if (filter === "matched" && !track.youtube) return false;
      if (filter === "unmatched" && track.youtube) return false;
      if (filter === "selected" && !track.selected) return false;
      if (!q) return true;
      const haystack = `${track.name} ${track.artists.map((a) => a.name).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [tracks, query, filter]);

  return (
    <div className="animate-fade-in w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋歌曲或藝人..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-2.5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`全部 ${tracks.length}`} />
          <FilterChip active={filter === "matched"} onClick={() => setFilter("matched")} label={`已配對 ${matchedCount}`} />
          <FilterChip active={filter === "selected"} onClick={() => setFilter("selected")} label={`已選 ${selectedCount}`} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          顯示 {filteredTracks.length} 首
          {query && ` · 搜尋「${query}」`}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleAll(true)}
            className="rounded-lg px-2.5 py-1 text-emerald-400 transition hover:bg-emerald-500/10"
          >
            全選
          </button>
          <span className="text-zinc-700">|</span>
          <button
            onClick={() => onToggleAll(false)}
            className="rounded-lg px-2.5 py-1 text-zinc-400 transition hover:bg-zinc-800"
          >
            清除
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
        <div className="max-h-[min(480px,60vh)] overflow-y-auto">
          {filteredTracks.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">沒有符合條件的歌曲</div>
          ) : (
            filteredTracks.map((track) => {
              const status = track.youtube ? "matched" : matching ? "pending" : "failed";
              const originalIndex = tracks.findIndex((t) => t.id === track.id);

              return (
                <div
                  key={track.id}
                  className={`group flex items-center gap-3 border-b border-zinc-800/50 px-3 py-3 transition last:border-b-0 sm:px-4 ${
                    track.selected ? "bg-emerald-500/[0.03]" : "hover:bg-zinc-800/20"
                  }`}
                >
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={track.selected}
                      disabled={!track.youtube}
                      onChange={() => onToggle(track.id)}
                      className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    />
                  </label>

                  <span className="w-5 shrink-0 text-center text-xs tabular-nums text-zinc-600">
                    {originalIndex + 1}
                  </span>

                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    {track.youtube?.thumbnail ? (
                      <img
                        src={track.youtube.thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-600">
                        {status === "pending" ? (
                          <SpinnerIcon className="h-4 w-4" />
                        ) : (
                          <span className="text-sm">♪</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">{track.name}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {track.artists.map((a) => a.name).join(", ")} · {formatDuration(track.durationMs)}
                    </p>
                  </div>

                  <StatusBadge status={status} title={track.youtube?.title} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
          : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
  title,
}: {
  status: "matched" | "pending" | "failed";
  title?: string;
}) {
  if (status === "matched") {
    return (
      <div
        className="hidden max-w-[140px] items-center gap-1 sm:flex"
        title={title}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckIcon className="h-3 w-3" />
        </span>
        <span className="truncate text-xs text-emerald-400/90">已配對</span>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="hidden items-center gap-1.5 sm:flex">
        <SpinnerIcon className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-500">配對中</span>
      </div>
    );
  }

  return (
    <span className="hidden text-xs text-red-400/70 sm:inline">未找到</span>
  );
}
