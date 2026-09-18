"use client";

interface PlaylistInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function PlaylistInput({ url, onUrlChange, onAnalyze, loading }: PlaylistInputProps) {
  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="貼上 Spotify 播放清單連結，例如 https://open.spotify.com/playlist/..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 py-4 pr-32 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && !loading && onAnalyze()}
        />
        <button
          onClick={onAnalyze}
          disabled={loading || !url.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "解析中..." : "解析清單"}
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        支援公開的 Spotify 播放清單。系統會自動在 YouTube 搜尋對應曲目並下載為 MP3。
      </p>
    </div>
  );
}
