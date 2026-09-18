"use client";

import { useState } from "react";
import { LinkIcon, SpinnerIcon } from "./icons";

interface PlaylistInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  disabled?: boolean;
}

export default function PlaylistInput({
  url,
  onUrlChange,
  onAnalyze,
  loading,
  disabled = false,
}: PlaylistInputProps) {
  const [focused, setFocused] = useState(false);
  const isValid = /open\.spotify\.com\/playlist\/|spotify:playlist:/.test(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) onUrlChange(text.trim());
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="w-full">
      <div
        className={`rounded-2xl border bg-zinc-900/40 p-4 transition-all duration-300 sm:p-5 ${
          focused
            ? "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]"
            : "border-zinc-800/80"
        }`}
      >
        <label htmlFor="playlist-url" className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
          <LinkIcon className="h-4 w-4 text-emerald-400/80" />
          Spotify 播放清單連結
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              id="playlist-url"
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="https://open.spotify.com/playlist/..."
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              disabled={loading || disabled}
              onKeyDown={(e) => e.key === "Enter" && !loading && !disabled && url.trim() && onAnalyze()}
            />
            {url && !isValid && (
              <p className="mt-1.5 text-xs text-amber-400/90">請貼上有效的 Spotify 播放清單連結</p>
            )}
          </div>

          <div className="flex gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={handlePaste}
              disabled={loading || disabled}
              className="rounded-xl border border-zinc-700 px-4 py-3.5 text-sm text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 disabled:opacity-40"
            >
              貼上
            </button>
            <button
              type="button"
              onClick={onAnalyze}
              disabled={loading || disabled || !url.trim()}
              className="flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <SpinnerIcon className="h-4 w-4" />
                  讀取中
                </>
              ) : (
                "解析清單"
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-600 sm:text-left">
        支援公開播放清單 · 無需 API 金鑰 · 自動配對 YouTube 並下載 MP3
      </p>
    </div>
  );
}
