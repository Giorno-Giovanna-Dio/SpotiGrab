"use client";

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
  const matchedCount = tracks.filter((t) => t.youtube).length;
  const selectedCount = tracks.filter((t) => t.selected).length;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          共 {tracks.length} 首 · 找到 YouTube 對應 {matchedCount} 首 · 已選 {selectedCount} 首
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleAll(true)}
            className="rounded-lg px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10"
          >
            全選
          </button>
          <button
            onClick={() => onToggleAll(false)}
            className="rounded-lg px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
          >
            取消全選
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={`flex items-center gap-3 border-b border-zinc-800/60 px-4 py-3 last:border-b-0 ${
              !track.youtube ? "opacity-50" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={track.selected}
              disabled={!track.youtube}
              onChange={() => onToggle(track.id)}
              className="h-4 w-4 rounded accent-emerald-500"
            />
            <span className="w-6 text-xs text-zinc-600">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-100">{track.name}</p>
              <p className="truncate text-xs text-zinc-500">
                {track.artists.map((a) => a.name).join(", ")} · {formatDuration(track.durationMs)}
              </p>
            </div>
            <div className="hidden max-w-[200px] sm:block">
              {track.youtube ? (
                <p className="truncate text-xs text-emerald-500/80" title={track.youtube.title}>
                  ✓ {track.youtube.title}
                </p>
              ) : (
                <p className="text-xs text-red-400/80">✗ 找不到對應</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
