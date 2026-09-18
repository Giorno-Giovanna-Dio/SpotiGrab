"use client";

import { useTranslations } from 'next-intl';

interface DownloadProgressProps {
  status: string;
  progress: number;
  total: number;
  downloadReady: boolean;
  jobId: string | null;
  error?: string;
  onReset: () => void;
}

export default function DownloadProgress({
  status,
  progress,
  total,
  downloadReady,
  jobId,
  error,
  onReset,
}: DownloadProgressProps) {
  const t = useTranslations('download');
  const percent = total > 0 ? Math.round((progress / total) * 100) : 0;

  const getStatusLabel = (status: string) => {
    const statusKey = `status.${status}` as const;
    return t(statusKey);
  };

  return (
    <div className="w-full space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">
          {getStatusLabel(status)}
        </h3>
        <span className="text-sm text-zinc-400">
          {progress} / {total}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === "failed" ? "bg-red-500" : "bg-emerald-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        {downloadReady && jobId && (
          <a
            href={`/api/download/${jobId}/file`}
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            {t('downloadZip')}
          </a>
        )}
        {(status === "completed" || status === "failed") && (
          <button
            onClick={onReset}
            className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            {t('reset')}
          </button>
        )}
      </div>
    </div>
  );
}
