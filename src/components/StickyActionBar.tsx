"use client";

import { DownloadIcon, SpinnerIcon } from "./icons";

interface StickyActionBarProps {
  selectedCount: number;
  matching: boolean;
  matchProgress: number;
  matchTotal: number;
  downloading: boolean;
  disabled: boolean;
  onDownload: () => void;
}

export default function StickyActionBar({
  selectedCount,
  matching,
  matchProgress,
  matchTotal,
  downloading,
  disabled,
  onDownload,
}: StickyActionBarProps) {
  return (
    <div className="sticky bottom-0 -mx-6 mt-2 border-t border-zinc-800/80 bg-zinc-950/90 px-6 py-4 backdrop-blur-xl sm:-mx-0 sm:rounded-2xl sm:border sm:mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-zinc-400">
          {matching ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon className="h-4 w-4 text-emerald-400" />
              YouTube 配對中 {matchProgress}/{matchTotal}，完成後可下載
            </span>
          ) : (
            <>
              已選 <span className="font-semibold text-emerald-400">{selectedCount}</span> 首
              {selectedCount > 0 && (
                <span className="text-zinc-600"> · 將打包為 MP3 ZIP</span>
              )}
            </>
          )}
        </div>

        <button
          onClick={onDownload}
          disabled={disabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 sm:w-auto"
        >
          {downloading ? (
            <>
              <SpinnerIcon className="h-4 w-4" />
              下載中...
            </>
          ) : matching ? (
            <>
              <SpinnerIcon className="h-4 w-4" />
              配對中 ({matchProgress}/{matchTotal})
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4" />
              下載 {selectedCount} 首 MP3
            </>
          )}
        </button>
      </div>
    </div>
  );
}
