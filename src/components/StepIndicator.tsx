"use client";

import { CheckIcon, DownloadIcon, LinkIcon, YoutubeIcon } from "./icons";

type Step = "input" | "match" | "download";

interface StepIndicatorProps {
  current: Step;
}

const STEPS = [
  { id: "input" as const, label: "貼上連結", icon: LinkIcon },
  { id: "match" as const, label: "YouTube 配對", icon: YoutubeIcon },
  { id: "download" as const, label: "下載 MP3", icon: DownloadIcon },
];

const ORDER: Step[] = ["input", "match", "download"];

export default function StepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = ORDER.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 sm:h-10 sm:w-10 ${
                  done
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                    : active
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                      : "border-zinc-700 bg-zinc-900/60 text-zinc-600"
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  active ? "text-emerald-300" : done ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mb-5 h-px w-8 transition-colors sm:mb-6 sm:w-12 ${
                  index < currentIndex ? "bg-emerald-500/40" : "bg-zinc-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
