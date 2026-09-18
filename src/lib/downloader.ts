import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { ZipArchive } from "archiver";
import { createWriteStream } from "fs";
import type { TrackWithMatch } from "./types";

const YT_DLP_PATH = process.env.YT_DLP_PATH ?? "/home/ubuntu/.local/bin/yt-dlp";
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

export async function downloadTrack(
  track: TrackWithMatch,
  outputDir: string
): Promise<string> {
  const youtubeUrl = track.youtube?.url;
  if (!youtubeUrl) {
    throw new Error("找不到 YouTube 對應影片");
  }

  await fs.mkdir(outputDir, { recursive: true });

  const filename = sanitizeFilename(
    `${track.artists.map((a) => a.name).join(", ")} - ${track.name}`
  );
  const outputTemplate = path.join(outputDir, `${filename}.%(ext)s`);

  return new Promise((resolve, reject) => {
    const args = [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--no-playlist",
      "-o",
      outputTemplate,
      youtubeUrl,
    ];

    const proc = spawn(/* turbopackIgnore: true */ YT_DLP_PATH, args);
    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", async (code) => {
      if (code !== 0) {
        reject(new Error(stderr.slice(-500) || `yt-dlp 退出碼 ${code}`));
        return;
      }

      const files = await fs.readdir(outputDir);
      const match = files.find((f) => f.startsWith(filename) && f.endsWith(".mp3"));
      if (match) {
        resolve(path.join(outputDir, match));
      } else {
        reject(new Error("下載完成但找不到輸出檔案"));
      }
    });

    proc.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        reject(
          new Error(
            "找不到 yt-dlp。請安裝：pip install yt-dlp，或設定 YT_DLP_PATH 環境變數。"
          )
        );
      } else {
        reject(err);
      }
    });
  });
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
