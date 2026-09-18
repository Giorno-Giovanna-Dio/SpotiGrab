"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import PlaylistInput from "@/components/PlaylistInput";
import TrackList from "@/components/TrackList";
import DownloadProgress from "@/components/DownloadProgress";
import type { SpotifyTrack, TrackWithMatch } from "@/lib/types";

const MATCH_BATCH_SIZE = 10;

interface PlaylistData {
  playlistName: string;
  playlistImage?: string;
  tracks: TrackWithMatch[];
  note?: string;
  stats: { total: number; matched: number; unmatched: number };
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);
  const [matchTotal, setMatchTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [tracks, setTracks] = useState<TrackWithMatch[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("");
  const [jobProgress, setJobProgress] = useState(0);
  const [jobTotal, setJobTotal] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [jobError, setJobError] = useState<string | undefined>();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const matchYouTubeTracks = async (trackList: TrackWithMatch[]) => {
    setMatching(true);
    setMatchProgress(0);
    setMatchTotal(trackList.length);

    const updated = [...trackList];

    for (let i = 0; i < updated.length; i += MATCH_BATCH_SIZE) {
      const batch = updated.slice(i, i + MATCH_BATCH_SIZE);
      const spotifyTracks: SpotifyTrack[] = batch.map(({ id, name, artists, album, durationMs }) => ({
        id,
        name,
        artists,
        album,
        durationMs,
      }));

      try {
        const res = await fetch("/api/youtube/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracks: spotifyTracks }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "YouTube 配對失敗");
        }

        for (const result of data.results as { trackId: string; youtube: TrackWithMatch["youtube"] }[]) {
          const index = updated.findIndex((t) => t.id === result.trackId);
          if (index === -1) continue;
          updated[index] = {
            ...updated[index],
            youtube: result.youtube,
            selected: result.youtube !== null,
          };
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "YouTube 配對失敗");
        break;
      }

      const completed = Math.min(i + MATCH_BATCH_SIZE, updated.length);
      setMatchProgress(completed);
      setTracks([...updated]);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              tracks: [...updated],
              stats: {
                total: updated.length,
                matched: updated.filter((t) => t.youtube).length,
                unmatched: updated.filter((t) => !t.youtube).length,
              },
            }
          : prev
      );
    }

    setMatching(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setMatching(false);
    setMatchProgress(0);
    setMatchTotal(0);
    setError(null);
    setPlaylist(null);
    setTracks([]);
    stopPolling();
    setJobId(null);
    setDownloadReady(false);

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "解析失敗");
      }

      setPlaylist(data);
      setTracks(data.tracks);
      setLoading(false);

      await matchYouTubeTracks(data.tracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
      setLoading(false);
      setMatching(false);
    }
  };

  const handleToggle = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleToggleAll = (selected: boolean) => {
    setTracks((prev) =>
      prev.map((t) => ({ ...t, selected: t.youtube ? selected : false }))
    );
  };

  const pollJobStatus = useCallback(
    (id: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/download/${id}`);
          const data = await res.json();

          setJobStatus(data.status);
          setJobProgress(data.progress);
          setJobTotal(data.total);
          setDownloadReady(data.downloadReady);
          setJobError(data.error);

          if (data.status === "completed" || data.status === "failed") {
            stopPolling();
            setDownloading(false);
          }
        } catch {
          stopPolling();
          setDownloading(false);
          setJobError("無法取得下載狀態");
        }
      }, 1500);
    },
    [stopPolling]
  );

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    setDownloadReady(false);
    setJobError(undefined);
    setJobStatus("pending");
    setJobProgress(0);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "下載失敗");
      }

      setJobId(data.jobId);
      setJobTotal(data.total);
      pollJobStatus(data.jobId);
    } catch (err) {
      setDownloading(false);
      setError(err instanceof Error ? err.message : "下載失敗");
    }
  };

  const handleReset = () => {
    stopPolling();
    setJobId(null);
    setJobStatus("");
    setJobProgress(0);
    setJobTotal(0);
    setDownloadReady(false);
    setJobError(undefined);
    setDownloading(false);
  };

  const selectedCount = tracks.filter((t) => t.selected).length;

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-600/5 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Spotify → YouTube → MP3
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Spoti<span className="text-emerald-400">Grab</span>
          </h1>
          <p className="mx-auto max-w-lg text-zinc-400">
            貼上 Spotify 播放清單，自動在 YouTube 找到對應曲目並下載到本地端。
            再也不用手動一首首搜尋了。
          </p>
        </header>

        <div className="space-y-8">
          <PlaylistInput
            url={url}
            onUrlChange={setUrl}
            onAnalyze={handleAnalyze}
            loading={loading}
          />

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-zinc-400">正在讀取 Spotify 播放清單...</p>
              <p className="text-xs text-zinc-600">通常只需幾秒鐘</p>
            </div>
          )}

          {playlist && !loading && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {playlist.playlistImage && (
                  <img
                    src={playlist.playlistImage}
                    alt={playlist.playlistName}
                    className="h-16 w-16 rounded-lg object-cover shadow-lg"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{playlist.playlistName}</h2>
                  <p className="text-sm text-zinc-500">
                    {playlist.stats.matched}/{playlist.stats.total} 首找到 YouTube 對應
                    {playlist.stats.unmatched > 0 && (
                      <span className="text-amber-500/80">
                        {" "}
                        · {playlist.stats.unmatched} 首未找到
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {playlist.note && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
                  {playlist.note}
                </div>
              )}

              {matching && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">YouTube 配對中...</span>
                    <span className="text-zinc-500">
                      {matchProgress} / {matchTotal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${matchTotal > 0 ? Math.round((matchProgress / matchTotal) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    曲目列表已顯示，配對完成後即可下載。請稍候，不會再整頁卡住。
                  </p>
                </div>
              )}

              <TrackList
                tracks={tracks}
                matching={matching}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
              />

              {!jobId && (
                <button
                  onClick={handleDownload}
                  disabled={downloading || matching || selectedCount === 0}
                  className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {matching
                    ? `YouTube 配對中 (${matchProgress}/${matchTotal})...`
                    : downloading
                      ? "下載中..."
                      : `下載所選 ${selectedCount} 首歌曲 (MP3)`}
                </button>
              )}

              {jobId && (
                <DownloadProgress
                  status={jobStatus}
                  progress={jobProgress}
                  total={jobTotal}
                  downloadReady={downloadReady}
                  jobId={jobId}
                  error={jobError}
                  onReset={handleReset}
                />
              )}
            </div>
          )}
        </div>

        <footer className="mt-16 border-t border-zinc-800/60 pt-8 text-center text-xs text-zinc-600">
          <p>僅供個人備份使用。請尊重音樂創作者版權，支持正版音樂平台。</p>
        </footer>
      </main>
    </div>
  );
}
