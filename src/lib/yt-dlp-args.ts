import path from "path";

const RETRYABLE_PATTERNS = [
  /403/i,
  /forbidden/i,
  /not a bot/i,
  /sign in to confirm/i,
  /requested format is not available/i,
  /unable to download video data/i,
];

export function isRetryableYtDlpError(message: string): boolean {
  return RETRYABLE_PATTERNS.some((pattern) => pattern.test(message));
}

export function getPlayerClientStrategies(): string[] {
  const custom = process.env.YT_DLP_PLAYER_CLIENT?.trim();
  if (custom) return [custom];

  return [
    "default,-tv_simply",
    "web_safari,web",
    "tv_embedded,web",
    "android,web",
  ];
}

export function buildYtDlpArgs(options: {
  ffmpegPath: string;
  outputTemplate: string;
  playerClient: string;
  url: string;
}): string[] {
  const args = [
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "--no-playlist",
    "--retries",
    "3",
    "--fragment-retries",
    "3",
    "--ffmpeg-location",
    path.dirname(options.ffmpegPath),
    "--extractor-args",
    `youtube:player_client=${options.playerClient}`,
    "-o",
    options.outputTemplate,
  ];

  const cookiesBrowser = process.env.YT_DLP_COOKIES_FROM_BROWSER?.trim();
  const cookiesFile = process.env.YT_DLP_COOKIES_FILE?.trim();

  if (cookiesBrowser) {
    args.push("--cookies-from-browser", cookiesBrowser);
  } else if (cookiesFile) {
    args.push("--cookies", cookiesFile);
  }

  const jsRuntime = process.env.YT_DLP_JS_RUNTIME?.trim();
  if (jsRuntime) {
    args.push("--js-runtimes", jsRuntime);
  } else {
    // Next.js / Node 環境通常有 Node，可協助 YouTube 解析
    args.push("--js-runtimes", `node:${path.dirname(process.execPath)}`);
  }

  args.push(options.url);
  return args;
}

export function formatYtDlp403Help(): string {
  return (
    "YouTube 403：請在 .env.local 加入 YT_DLP_COOKIES_FROM_BROWSER=safari（Mac）或 chrome，" +
    "並執行 brew upgrade yt-dlp 更新後重啟 npm run dev"
  );
}
