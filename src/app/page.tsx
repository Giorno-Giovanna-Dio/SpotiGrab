"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import PlaylistInput from "@/components/PlaylistInput";
import TrackList from "@/components/TrackList";
import DownloadProgress from "@/components/DownloadProgress";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { TrackWithMatch } from "@/lib/types";

interface PlaylistData {
  playlistName: string;
  playlistImage?: string;
  tracks: TrackWithMatch[];
  stats: { total: number; matched: number; unmatched: number };
}

export default function Home() {
  const t = useTranslations();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleAnalyze = async () => {
    setLoading(true);
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
        throw new Error(data.error ?? t('errors.analysisFailed'));
      }

      setPlaylist(data);
      setTracks(data.tracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknownError'));
    } finally {
      setLoading(false);
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
          setJobError(t('errors.statusFailed'));
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
        throw new Error(data.error ?? t('errors.downloadFailed'));
      }

      setJobId(data.jobId);
      setJobTotal(data.total);
      pollJobStatus(data.jobId);
    } catch (err) {
      setDownloading(false);
      setError(err instanceof Error ? err.message : t('errors.downloadFailed'));
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
        <div className="absolute right-6 top-6">
          <LanguageSwitcher />
        </div>
        
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {t('home.badge')}
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Spoti<span className="text-emerald-400">Grab</span>
          </h1>
          <p className="mx-auto max-w-lg text-zinc-400">
            {t('home.subtitle')}
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
              <p className="text-sm text-zinc-400">{t('loading.analyzing')}</p>
              <p className="text-xs text-zinc-600">{t('loading.hint')}</p>
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
                    {playlist.stats.matched}/{playlist.stats.total} {t('playlist.matched')}
                    {playlist.stats.unmatched > 0 && (
                      <span className="text-amber-500/80">
                        {" "}
                        · {playlist.stats.unmatched} {t('playlist.unmatched')}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <TrackList tracks={tracks} onToggle={handleToggle} onToggleAll={handleToggleAll} />

              {!jobId && (
                <button
                  onClick={handleDownload}
                  disabled={downloading || selectedCount === 0}
                  className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {downloading
                    ? t('download.downloading')
                    : `${t('download.downloadSelected')} ${selectedCount} ${t('download.songsMp3')}`}
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
          <p>{t('home.footer')}</p>
        </footer>
      </main>
    </div>
  );
}
