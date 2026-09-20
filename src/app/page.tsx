"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
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
        throw new Error(data.error ?? t("errors.analysisFailed"));
      }

      setPlaylist(data);
      setTracks(data.tracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unknownError"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, selected: !track.selected } : track
      )
    );
  };

  const handleToggleAll = (selected: boolean) => {
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        selected: track.youtube ? selected : false,
      }))
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
          setJobError(t("errors.statusFailed"));
        }
      }, 1500);
    },
    [stopPolling, t]
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
        throw new Error(data.error ?? t("errors.downloadFailed"));
      }

      setJobId(data.jobId);
      setJobTotal(data.total);
      pollJobStatus(data.jobId);
    } catch (err) {
      setDownloading(false);
      setError(err instanceof Error ? err.message : t("errors.downloadFailed"));
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

  const selectedCount = tracks.filter((track) => track.selected).length;
  const heroFeatures = [
    t("home.featureNoLogin"),
    t("home.featureBatchMatch"),
    t("home.featureFreeSelect"),
  ];
  const steps = [
    ["01", t("home.step1Title"), t("home.step1Desc")],
    ["02", t("home.step2Title"), t("home.step2Desc")],
    ["03", t("home.step3Title"), t("home.step3Desc")],
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070908] text-zinc-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-28rem] h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#" className="flex items-center gap-2.5" aria-label={t("home.homeAriaLabel")}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/15">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 8.5a11 11 0 0 1 12 0M7.5 12a8 8 0 0 1 9 0M9 15.5a5 5 0 0 1 6 0" />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight">
              Spoti<span className="text-emerald-400">Grab</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {t("home.serviceStatus")}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m13 2-9 11h7l-1 9 9-12h-7l1-8Z" />
              </svg>
              {t("home.heroBadge")}
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
              {t("home.heroTitle")}
              <span className="mt-1 block bg-gradient-to-r from-emerald-300 to-teal-500 bg-clip-text text-transparent">
                {t("home.heroTitleAccent")}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              {t("home.heroDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-400">
              {heroFeatures.map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 10 3 3 7-7" />
                    </svg>
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-emerald-400/[0.04] blur-2xl" />
            <div className="relative rounded-2xl border border-white/10 bg-[#111411]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                    {t("home.importLabel")}
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
                    {t("home.importTitle")}
                  </h2>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-400">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
                  </svg>
                </span>
              </div>
              <PlaylistInput
                url={url}
                onUrlChange={setUrl}
                onAnalyze={handleAnalyze}
                loading={loading}
              />
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-6xl divide-y divide-white/[0.06] px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
            {steps.map(([number, title, description]) => (
              <div key={number} className="flex gap-4 py-6 md:px-7 md:first:pl-0 md:last:pr-0">
                <span className="font-mono text-xs font-medium text-emerald-400">{number}</span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`mx-auto max-w-5xl px-5 sm:px-8 ${loading || error || playlist ? "py-14 md:py-20" : ""}`}>
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3.5 text-sm text-red-200">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 8v5m0 3h.01" />
              </svg>
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center rounded-2xl border border-white/8 bg-[#111411] px-6 py-14 text-center shadow-2xl shadow-black/20">
              <div className="relative mb-5 flex h-12 w-12 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/8 border-t-emerald-400" />
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 8.5a11 11 0 0 1 12 0M7.5 12a8 8 0 0 1 9 0M9 15.5a5 5 0 0 1 6 0" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-200">{t("loading.analyzing")}</p>
              <p className="mt-2 text-xs text-zinc-500">{t("loading.hint")}</p>
            </div>
          )}

          {playlist && !loading && (
            <div className="space-y-5">
              <div className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-[#111411] p-5 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:p-6">
                {playlist.playlistImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={playlist.playlistImage}
                    alt={playlist.playlistName}
                    className="h-20 w-20 rounded-xl object-cover shadow-xl shadow-black/30"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                    {t("playlist.label")}
                  </p>
                  <h2 className="mt-1.5 truncate text-xl font-semibold tracking-tight text-white">
                    {playlist.playlistName}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{t("playlist.totalTracks", { count: playlist.stats.total })}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="text-emerald-300">
                      {t("playlist.matchedCount", { count: playlist.stats.matched })}
                    </span>
                    {playlist.stats.unmatched > 0 && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        <span className="text-amber-300">
                          {t("playlist.unmatchedCount", { count: playlist.stats.unmatched })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex h-11 min-w-24 items-center justify-center rounded-xl border border-white/8 bg-black/20 px-4 text-sm font-medium tabular-nums text-zinc-300">
                  {t("playlist.matchPercent", {
                    percent: Math.round((playlist.stats.matched / playlist.stats.total) * 100),
                  })}
                </div>
              </div>

              <TrackList tracks={tracks} onToggle={handleToggle} onToggleAll={handleToggleAll} />

              {!jobId && (
                <button
                  onClick={handleDownload}
                  disabled={downloading || selectedCount === 0}
                  className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 text-sm font-semibold text-emerald-950 shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-300 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {downloading
                    ? t("download.downloading")
                    : t("download.downloadSelectedCount", { count: selectedCount })}
                  {!downloading && (
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" />
                    </svg>
                  )}
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
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs text-zinc-600 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SpotiGrab</p>
          <p>{t("home.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
