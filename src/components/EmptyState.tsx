import { DownloadIcon, LinkIcon, SpotifyIcon, YoutubeIcon } from "./icons";

const STEPS = [
  {
    icon: LinkIcon,
    title: "貼上播放清單",
    desc: "複製 Spotify 公開播放清單連結",
  },
  {
    icon: YoutubeIcon,
    title: "自動配對",
    desc: "系統在 YouTube 搜尋對應曲目",
  },
  {
    icon: DownloadIcon,
    title: "一鍵下載",
    desc: "打包成 MP3 ZIP 存到本地",
  },
];

export default function EmptyState() {
  return (
    <div className="animate-fade-in rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1DB954]/15 text-[#1DB954]">
          <SpotifyIcon />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">開始使用</h2>
          <p className="text-sm text-zinc-500">三步驟，告別手動搜尋 YouTube</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="group rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/50"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400">
                  {i + 1}
                </span>
                <Icon className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400/80" />
              </div>
              <h3 className="mb-1 text-sm font-medium text-zinc-200">{step.title}</h3>
              <p className="text-xs leading-relaxed text-zinc-500">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
