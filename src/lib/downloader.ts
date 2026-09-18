import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { ZipArchive } from "archiver";
import { createWriteStream } from "fs";
import type { TrackWithMatch } from "./types";
import { resolveFfmpegPath, resolveYtDlpPath } from "./yt-dlp";

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

export async function downloadTrack(
  track: TrackWithMatch,
  outputDir: string
): Promise<string> {
  const youtubeUrl = track.youtube?.url;
  if (!youtubeUrl) {
    throw new Error("找不到 YouTube 對應影片");
  }

  await fs.mkdir(outputDir, { recursive: true });

  const ytDlpPath = resolveYtDlpPath();
  const ffmpegPath = resolveFfmpegPath();

  const filename = sanitizeFilename(
    `${track.artists.map((a) => a.name).join(", ")} - ${track.name}`
  );
  const outputTemplate = path.join(outputDir, `${filename}.%(ext)s`);
  const existingMp3 = new Set(await listMp3Files(outputDir));

  return new Promise((resolve, reject) => {
    const args = [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--no-playlist",
      "--ffmpeg-location",
      path.dirname(ffmpegPath),
      "-o",
      outputTemplate,
      youtubeUrl,
    ];

    const proc = spawn(/* turbopackIgnore: true */ ytDlpPath, args);
    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", async (code) => {
      if (code !== 0) {
        const detail = stderr.trim().split("\n").slice(-3).join(" ").slice(-400);
        reject(new Error(detail || `yt-dlp 退出碼 ${code}`));
        return;
      }

      try {
        const mp3Files = await listMp3Files(outputDir);
        const newFile = mp3Files.find((f) => !existingMp3.has(f));
        const matchedFile =
          newFile ??
          mp3Files.find((f) => f.startsWith(filename)) ??
          mp3Files.at(-1);

        if (matchedFile) {
          resolve(path.join(outputDir, matchedFile));
        } else {
          reject(new Error("下載完成但找不到 MP3 輸出檔"));
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error("讀取下載結果失敗"));
      }
    });

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
