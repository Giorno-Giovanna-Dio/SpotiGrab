import { NextRequest, NextResponse } from "next/server";
import { createJob, runDownloadJob } from "@/lib/jobs";
import type { TrackWithMatch } from "@/lib/types";

export const maxDuration = 600;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { tracks?: TrackWithMatch[] };

    if (!body.tracks?.length) {
      return NextResponse.json({ error: "請提供要下載的曲目" }, { status: 400 });
    }

    const selectedCount = body.tracks.filter((t) => t.selected && t.youtube).length;

    if (selectedCount === 0) {
      return NextResponse.json({ error: "請至少選擇一首有 YouTube 對應的曲目" }, { status: 400 });
    }

    const job = createJob(body.tracks);

    // 非同步執行下載，立即回傳 job ID
    void runDownloadJob(job.id, body.tracks);

    return NextResponse.json({ jobId: job.id, total: selectedCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "建立下載任務失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
