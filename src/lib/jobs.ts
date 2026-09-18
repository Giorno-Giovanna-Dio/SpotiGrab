import { v4 as uuidv4 } from "uuid";
import type { DownloadJob, TrackWithMatch } from "./types";
import { downloadTrack, createZip, getJobDir, ensureDownloadsDir } from "./downloader";
import path from "path";

const jobs = new Map<string, DownloadJob>();

export function createJob(tracks: TrackWithMatch[]): DownloadJob {
  const selectedTracks = tracks.filter((t) => t.selected && t.youtube);

  const job: DownloadJob = {
    id: uuidv4(),
    status: "pending",
    progress: 0,
    total: selectedTracks.length,
    tracks: selectedTracks.map((t) => ({
      trackId: t.id,
      name: `${t.artists.map((a) => a.name).join(", ")} - ${t.name}`,
      status: "pending",
    })),
    createdAt: Date.now(),
  };

  jobs.set(job.id, job);
  return job;
}

export function getJob(jobId: string): DownloadJob | undefined {
  return jobs.get(jobId);
}

export async function runDownloadJob(jobId: string, tracks: TrackWithMatch[]): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  const selectedTracks = tracks.filter((t) => t.selected && t.youtube);
  job.status = "downloading";
  job.total = selectedTracks.length;

  await ensureDownloadsDir();
  const outputDir = getJobDir(jobId);
  const downloadedFiles: string[] = [];

  for (let i = 0; i < selectedTracks.length; i++) {
    const track = selectedTracks[i];
    const trackStatus = job.tracks.find((t) => t.trackId === track.id);

    if (trackStatus) {
      trackStatus.status = "downloading";
    }

    try {
      const filePath = await downloadTrack(track, outputDir);
      downloadedFiles.push(filePath);
      if (trackStatus) trackStatus.status = "completed";
    } catch (err) {
      if (trackStatus) {
        trackStatus.status = "failed";
        trackStatus.error = err instanceof Error ? err.message : "下載失敗";
      }
    }

    job.progress = i + 1;
  }

  const successCount = job.tracks.filter((t) => t.status === "completed").length;

  if (successCount === 0) {
    job.status = "failed";
    const firstError = job.tracks.find((t) => t.error)?.error;
    job.error = firstError
      ? `所有曲目下載均失敗：${firstError}`
      : "所有曲目下載均失敗。請確認已安裝 yt-dlp 與 ffmpeg";
    return;
  }

  job.status = "zipping";

  try {
    const zipPath = path.join(outputDir, "playlist.zip");
    await createZip(outputDir, zipPath);
    job.zipPath = zipPath;
    job.status = "completed";
  } catch (err) {
    job.status = "failed";
    job.error = err instanceof Error ? err.message : "打包 ZIP 失敗";
  }
}

// 定期清理超過 1 小時的 job
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of jobs) {
    if (job.createdAt < oneHourAgo) {
      jobs.delete(id);
    }
  }
}, 30 * 60 * 1000);
