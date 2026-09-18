"use client";

interface PlaylistInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function PlaylistInput({ url, onUrlChange, onAnalyze, loading }: PlaylistInputProps) {
  return (
    <div className="w-full">
      <label htmlFor="playlist-url" className="mb-2.5 block text-sm font-medium text-zinc-200">
        Spotify 播放清單網址
      </label>
      <div className="relative flex flex-col gap-3 sm:block">
        <div className="pointer-events-none absolute left-4 top-[17px] z-10 text-zinc-500 sm:top-1/2 sm:-translate-y-1/2">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 13.4a4.5 4.5 0 0 0 6.36 0l2.12-2.12a4.5 4.5 0 0 0-6.36-6.36L11.5 6.14m1.9 4.46a4.5 4.5 0 0 0-6.36 0l-2.12 2.12a4.5 4.5 0 0 0 6.36 6.36l1.22-1.22" />
          </svg>
        </div>
        <input
          id="playlist-url"
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
          className="h-14 w-full rounded-xl border border-white/10 bg-black/30 pl-12 pr-4 text-sm text-zinc-100 shadow-inner shadow-black/10 transition placeholder:text-zinc-600 hover:border-white/15 focus:border-emerald-400/60 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 sm:pr-36"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && !loading && onAnalyze()}
        />
        <button
          onClick={onAnalyze}
          disabled={loading || !url.trim()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:absolute sm:right-1 sm:top-1 sm:h-12"
        >
          {!loading && (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
            </svg>
          )}
          {loading ? "解析中..." : "解析清單"}
        </button>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01M9.1 9a3 3 0 1 1 4.83 2.38c-1.08.81-1.93 1.42-1.93 2.62" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        支援公開播放清單，無需登入 Spotify。
      </p>
    </div>
  );
}
