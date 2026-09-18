"use client";

interface DownloadProgressProps {
  status: string;
  progress: number;
  total: number;
  downloadReady: boolean;
  jobId: string | null;
  error?: string;
  onReset: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "準備中...",
  downloading: "下載中...",
  zipping: "打包 ZIP 中...",
  completed: "下載完成！",
  failed: "下載失敗",
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
  const isComplete = status === "completed";
  const isFailed = status === "failed";

  return (
    <div className="w-full rounded-2xl border border-white/8 bg-[#111411] p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isFailed ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"
        }`}>
          {isComplete ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 ${!isFailed ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                下載工作
              </p>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                {STATUS_LABELS[status] ?? status}
              </h3>
            </div>
            <span className="text-sm font-medium tabular-nums text-zinc-400">
              {percent}%
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFailed ? "bg-red-400" : "bg-emerald-400"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs tabular-nums text-zinc-500">
            已處理 {progress} / {total} 首曲目
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row">
        {downloadReady && jobId && (
          <a
            href={`/api/download/${jobId}/file`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" />
            </svg>
            下載 ZIP 檔案
          </a>
        )}
        {(status === "completed" || status === "failed") && (
          <button
            onClick={onReset}
            className="h-11 rounded-lg border border-white/10 px-5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/5"
          >
            重新開始
          </button>
        )}
      </div>
    </div>
  );
}
