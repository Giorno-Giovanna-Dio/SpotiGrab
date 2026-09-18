"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import PlaylistInput from "@/components/PlaylistInput";
import TrackList from "@/components/TrackList";
import DownloadProgress from "@/components/DownloadProgress";
import StepIndicator from "@/components/StepIndicator";
import EmptyState from "@/components/EmptyState";
import PlaylistHero from "@/components/PlaylistHero";
import StickyActionBar from "@/components/StickyActionBar";
import { SpotifyIcon } from "@/components/icons";
import type { SpotifyTrack, TrackWithMatch } from "@/lib/types";

const MATCH_BATCH_SIZE = 10;

interface PlaylistData {
  playlistName: string;
  playlistImage?: string;
  tracks: TrackWithMatch[];
  note?: string;
  stats: { total: number; matched: number; unmatched: number };
}

function getCurrentStep(
  playlist: PlaylistData | null,
  matching: boolean,
  jobId: string | null
): "input" | "match" | "download" {
  if (jobId) return "download";
  if (playlist && matching) return "match";
  if (playlist) return "download";
  return "input";
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
  const [jobTrackStatuses, setJobTrackStatuses] = useState<
    { trackId: string; name: string; status: string; error?: string }[]
  >([]);
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
          setJobTrackStatuses(data.tracks ?? []);

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
    setJobTrackStatuses([]);
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
    setJobTrackStatuses([]);
    setDownloading(false);
  };

  const selectedCount = tracks.filter((t) => t.selected).length;
  const currentStep = getCurrentStep(playlist, matching, jobId);
  const stats = playlist?.stats ?? { total: 0, matched: 0, unmatched: 0 };

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="animate-pulse-glow absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#1DB954]/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(161 161 170) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <main className="relative mx-auto max-w-2xl px-4 pb-28 pt-10 sm:px-6 sm:pt-14 lg:max-w-3xl">
        <header className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-medium text-zinc-400 backdrop-blur">
            <SpotifyIcon className="h-4 w-4 text-[#1DB954]" />
            <span>Spotify</span>
            <span className="text-zinc-700">→</span>
            <span className="text-red-400">YouTube</span>
            <span className="text-zinc-700">→</span>
            <span className="text-emerald-400">MP3</span>
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Spoti<span className="bg-gradient-to-r from-emerald-400 to-[#1DB954] bg-clip-text text-transparent">Grab</span>
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
            貼上播放清單，自動配對 YouTube，一鍵下載到本地。
            <br className="hidden sm:block" />
            再也不用手動一首首搜了。
          </p>
        </header>

        <div className="mb-8">
          <StepIndicator current={currentStep} />
        </div>

        <div className="space-y-6">
          <PlaylistInput
            url={url}
            onUrlChange={setUrl}
            onAnalyze={handleAnalyze}
            loading={loading}
            disabled={!!jobId && !downloadReady}
          />

          {error && (
            <div
              role="alert"
              className="animate-fade-in flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3.5 text-sm text-red-300"
            >
              <span className="mt-0.5 shrink-0 text-red-400">!</span>
              <div>
                <p className="font-medium">發生錯誤</p>
                <p className="mt-0.5 text-red-300/80">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="animate-fade-in flex flex-col items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 py-14">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
                <div className="absolute inset-2 rounded-full bg-zinc-900" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300">讀取 Spotify 播放清單</p>
                <p className="mt-1 text-xs text-zinc-600">通常只需幾秒鐘...</p>
              </div>
            </div>
          )}

          {!playlist && !loading && <EmptyState />}

          {playlist && !loading && (
            <div className="space-y-5">
              <PlaylistHero
                name={playlist.playlistName}
                image={playlist.playlistImage}
                total={stats.total}
                matched={stats.matched}
                unmatched={stats.unmatched}
                matching={matching}
                matchProgress={matchProgress}
                matchTotal={matchTotal}
              />

              {playlist.note && (
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/80">
                  {playlist.note}
                </div>
              )}

              <TrackList
                tracks={tracks}
                matching={matching}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
              />

              {jobId ? (
                <DownloadProgress
                  status={jobStatus}
                  progress={jobProgress}
                  total={jobTotal}
                  downloadReady={downloadReady}
                  jobId={jobId}
                  error={jobError}
                  trackStatuses={jobTrackStatuses}
                  onReset={handleReset}
                />
              ) : (
                <StickyActionBar
                  selectedCount={selectedCount}
                  matching={matching}
                  matchProgress={matchProgress}
                  matchTotal={matchTotal}
                  downloading={downloading}
                  disabled={downloading || matching || selectedCount === 0}
                  onDownload={handleDownload}
                />
              )}
            </div>
          )}
        </div>

        <footer className="mt-14 text-center text-[11px] leading-relaxed text-zinc-700">
          <p>僅供個人備份使用 · 請尊重音樂創作者版權</p>
        </footer>
      </main>
    </div>
  );
}
