import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const home = os.homedir();
const ytDlpCandidates = [
  process.env.YT_DLP_PATH,
  path.join(home, ".local/bin/yt-dlp"),
  "yt-dlp",
  "/opt/homebrew/bin/yt-dlp",
  "/usr/local/bin/yt-dlp",
].filter(Boolean);

function checkExecutable(label, candidates) {
  for (const candidate of candidates) {
    try {
      if (candidate.includes("/")) {
        if (fs.existsSync(candidate)) {
          const version = execSync(`"${candidate}" --version`, { encoding: "utf8" }).trim();
          console.log(`✓ ${label}: ${candidate} (${version.split("\n")[0]})`);
          return true;
        }
      } else {
        const resolved = execSync(`command -v ${candidate}`, { encoding: "utf8" }).trim();
        const version = execSync(`"${resolved}" --version`, { encoding: "utf8" }).trim();
        console.log(`✓ ${label}: ${resolved} (${version.split("\n")[0]})`);
        return true;
      }
    } catch {
      // try next
    }
  }

  console.log(`✗ ${label}: 找不到`);
  return false;
}

console.log("SpotiGrab 下載工具檢查\n");

const ytDlpOk = checkExecutable("yt-dlp", ytDlpCandidates);
const ffmpegOk = checkExecutable("ffmpeg", [
  process.env.FFMPEG_PATH,
  "ffmpeg",
  "/opt/homebrew/bin/ffmpeg",
  "/usr/local/bin/ffmpeg",
  "/usr/bin/ffmpeg",
].filter(Boolean));

console.log("");
if (!ytDlpOk) {
  console.log("安裝 yt-dlp:");
  console.log("  Linux: pip install yt-dlp && export PATH=\"$HOME/.local/bin:$PATH\"");
  console.log("  macOS: brew install yt-dlp");
}
if (!ffmpegOk) {
  console.log("安裝 ffmpeg:");
  console.log("  Linux: sudo apt install ffmpeg");
  console.log("  macOS: brew install ffmpeg");
}

process.exit(ytDlpOk && ffmpegOk ? 0 : 1);
