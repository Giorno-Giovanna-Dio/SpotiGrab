import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { ZipArchive } from "archiver";
import { createWriteStream } from "fs";
import type { TrackWithMatch } from "./types";
import { resolveFfmpegPath, resolveYtDlpPath } from "./yt-dlp";
import {
  buildYtDlpArgs,
  formatYtDlp403Help,
  getPlayerClientStrategies,
  isRetryableYtDlpError,
} from "./yt-dlp-args";

const DOWNLOADS_DIR = path.join(process.cwd(), "downloads");

export async function ensureDownloadsDir(): Promise<void> {
  await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
}

export function getJobDir(jobId: string): string {
  return path.join(DOWNLOADS_DIR, jobId);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").slice(0, 200);
}

async function listMp3Files(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith(".mp3"));
}

function runYtDlp(args: string[]): Promise<{ code: number; stderr: string }> {
  const ytDlpPath = resolveYtDlpPath();

  return new Promise((resolve, reject) => {
    const proc = spawn(/* turbopackIgnore: true */ ytDlpPath, args);
    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => resolve({ code: code ?? 1, stderr }));
    proc.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        reject(
          new Error(
            "無法執行 yt-dlp。請確認已安裝並在 .env.local 設定 YT_DLP_PATH"
          )
        );
      } else {
        reject(err);
      }
    });
  });
}

async function attemptDownload(
  track: TrackWithMatch,
  outputDir: string,
  playerClient: string
): Promise<string> {
  const youtubeUrl = track.youtube!.url;
  const ffmpegPath = resolveFfmpegPath();
  const filename = sanitizeFilename(
    `${track.artists.map((a) => a.name).join(", ")} - ${track.name}`
  );
  const outputTemplate = path.join(outputDir, `${filename}.%(ext)s`);
  const existingMp3 = new Set(await listMp3Files(outputDir));

  const args = buildYtDlpArgs({
    ffmpegPath,
    outputTemplate,
    playerClient,
    url: youtubeUrl,
  });

  const { code, stderr } = await runYtDlp(args);

  if (code !== 0) {
    const detail = stderr.trim().split("\n").slice(-4).join(" ").slice(-500);
    throw new Error(detail || `yt-dlp 退出碼 ${code}`);
  }

  const mp3Files = await listMp3Files(outputDir);
  const newFile = mp3Files.find((f) => !existingMp3.has(f));
  const matchedFile =
    newFile ?? mp3Files.find((f) => f.startsWith(filename)) ?? mp3Files.at(-1);

  if (!matchedFile) {
    throw new Error("下載完成但找不到 MP3 輸出檔");
  }

  return path.join(outputDir, matchedFile);
}

export async function downloadTrack(
  track: TrackWithMatch,
  outputDir: string
): Promise<string> {
  const youtubeUrl = track.youtube?.url;
  if (!youtubeUrl) {
    throw new Error("找不到 YouTube 對應影片");
  }

  await fs.mkdir(outputDir, { recursive: true });

  const strategies = getPlayerClientStrategies();
  let lastError: Error | null = null;

  for (const playerClient of strategies) {
    try {
      return await attemptDownload(track, outputDir, playerClient);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("下載失敗");
      lastError = error;

      if (!isRetryableYtDlpError(error.message)) {
        break;
      }
    }
  }

  const message = lastError?.message ?? "下載失敗";
  if (isRetryableYtDlpError(message) && !process.env.YT_DLP_COOKIES_FROM_BROWSER) {
    throw new Error(`${message} · ${formatYtDlp403Help()}`);
  }

  throw lastError ?? new Error("下載失敗");
}

export async function createZip(sourceDir: string, zipPath: string): Promise<void> {
  const files = await fs.readdir(sourceDir);
  const mp3Files = files.filter((f) => f.endsWith(".mp3"));

  if (mp3Files.length === 0) {
    throw new Error("沒有可打包的音檔");
  }

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 5 } });

    output.on("close", () => resolve());
    archive.on("error", reject);

    archive.pipe(output);

    for (const file of mp3Files) {
      archive.file(path.join(sourceDir, file), { name: file });
    }

    archive.finalize();
  });
}

export async function cleanupJob(jobId: string): Promise<void> {
  const jobDir = getJobDir(jobId);
  try {
    await fs.rm(jobDir, { recursive: true, force: true });
  } catch {
    // 忽略清理失敗
  }
}
