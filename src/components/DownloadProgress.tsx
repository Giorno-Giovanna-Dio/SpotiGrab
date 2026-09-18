"use client";

import { CheckIcon, DownloadIcon, SpinnerIcon } from "./icons";

interface DownloadProgressProps {
  status: string;
  progress: number;
  total: number;
  downloadReady: boolean;
  jobId: string | null;
  error?: string;
  onReset: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; tone: "default" | "success" | "error" }
> = {
  pending: { label: "準備下載...", tone: "default" },
  downloading: { label: "正在下載 MP3...", tone: "default" },
  zipping: { label: "打包 ZIP 檔案中...", tone: "default" },
  completed: { label: "全部完成！", tone: "success" },
  failed: { label: "下載失敗", tone: "error" },
};

export default function DownloadProgress({
  status,
  progress,
  total,
  downloadReady,
  jobId,
  error,
  onReset,
}: DownloadProgressProps) {
  const percent = total > 0 ? Math.round((progress / total) * 100) : 0;
  const config = STATUS_CONFIG[status] ?? { label: status, tone: "default" as const };
  const isActive = !["completed", "failed"].includes(status);

  return (
    <div
      className={`animate-fade-in overflow-hidden rounded-2xl border p-5 sm:p-6 ${
        config.tone === "success"
          ? "border-emerald-500/30 bg-emerald-500/5"
          : config.tone === "error"
            ? "border-red-500/30 bg-red-500/5"
            : "border-zinc-800/80 bg-zinc-900/40"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            config.tone === "success"
              ? "bg-emerald-500/20 text-emerald-400"
              : config.tone === "error"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {config.tone === "success" ? (
            <CheckIcon className="h-5 w-5" />
          ) : isActive ? (
            <SpinnerIcon className="h-5 w-5" />
          ) : (
            <DownloadIcon className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-zinc-100">{config.label}</h3>
            <span className="shrink-0 text-sm tabular-nums text-zinc-500">
              {progress} / {total}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                config.tone === "error"
                  ? "bg-red-500"
                  : config.tone === "success"
                    ? "bg-emerald-400"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-400"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {isActive && (
            <p className="text-xs text-zinc-500">
              正在處理第 {Math.min(progress + 1, total)} 首，請保持此分頁開啟
            </p>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            {downloadReady && jobId && (
              <a
                href={`/api/download/${jobId}/file`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 active:scale-[0.98]"
              >
                <DownloadIcon className="h-4 w-4" />
                下載 ZIP 檔案
              </a>
            )}
            {(status === "completed" || status === "failed") && (
              <button
                onClick={onReset}
                className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                下載其他清單
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
