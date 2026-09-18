import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

let cachedYtDlpPath: string | null = null;
let cachedFfmpegPath: string | null = null;

function expandHome(filepath: string): string {
  return filepath.startsWith("~") ? path.join(os.homedir(), filepath.slice(1)) : filepath;
}

function isExecutable(filepath: string): boolean {
  try {
    fs.accessSync(filepath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function findInPath(command: string): string | null {
  try {
    const result = execSync(`command -v ${command}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return result || null;
  } catch {
    return null;
  }
}

export function resolveYtDlpPath(): string {
  if (cachedYtDlpPath) return cachedYtDlpPath;

  const candidates = [
    process.env.YT_DLP_PATH,
    "yt-dlp",
    expandHome("~/.local/bin/yt-dlp"),
    "/opt/homebrew/bin/yt-dlp",
    "/usr/local/bin/yt-dlp",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (candidate.includes("/") || candidate.includes("\\")) {
      if (isExecutable(candidate)) {
        cachedYtDlpPath = candidate;
        return candidate;
      }
      continue;
    }

    const resolved = findInPath(candidate);
    if (resolved) {
      cachedYtDlpPath = resolved;
      return resolved;
    }
  }

  throw new Error(
    "找不到 yt-dlp。請安裝：pip install yt-dlp 或 brew install yt-dlp，也可在 .env.local 設定 YT_DLP_PATH"
  );
}

export function resolveFfmpegPath(): string {
  if (cachedFfmpegPath) return cachedFfmpegPath;

  const candidates = [
    process.env.FFMPEG_PATH,
    "ffmpeg",
    "/opt/homebrew/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (candidate.includes("/") || candidate.includes("\\")) {
      if (isExecutable(candidate)) {
        cachedFfmpegPath = candidate;
        return candidate;
      }
      continue;
    }

    const resolved = findInPath(candidate);
    if (resolved) {
      cachedFfmpegPath = resolved;
      return resolved;
    }
  }

  throw new Error(
    "找不到 ffmpeg。yt-dlp 需要 ffmpeg 才能轉 MP3。請安裝：brew install ffmpeg 或 apt install ffmpeg"
  );
}

export function verifyDownloadTools(): { ytDlp: string; ffmpeg: string } {
  return {
    ytDlp: resolveYtDlpPath(),
    ffmpeg: resolveFfmpegPath(),
  };
}
