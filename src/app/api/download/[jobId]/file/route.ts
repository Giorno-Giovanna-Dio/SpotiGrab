import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import fs from "fs/promises";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "找不到下載任務" }, { status: 404 });
  }

  if (job.status !== "completed" || !job.zipPath) {
    return NextResponse.json({ error: "下載尚未完成" }, { status: 400 });
  }

  try {
    const fileBuffer = await fs.readFile(job.zipPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="playlist-${jobId.slice(0, 8)}.zip"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "讀取 ZIP 檔案失敗" }, { status: 500 });
  }
}
