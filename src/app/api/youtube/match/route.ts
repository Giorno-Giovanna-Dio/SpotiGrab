import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeBatch } from "@/lib/youtube";
import type { SpotifyTrack } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { tracks?: SpotifyTrack[] };

    if (!body.tracks?.length) {
      return NextResponse.json({ error: "請提供曲目" }, { status: 400 });
    }

    if (body.tracks.length > 20) {
      return NextResponse.json({ error: "單次最多配對 20 首，請分批請求" }, { status: 400 });
    }

    const matches = await searchYouTubeBatch(body.tracks, {
      concurrency: 5,
      delayMs: 0,
    });

    const results = body.tracks.map((track) => ({
      trackId: track.id,
      youtube: matches.get(track.id) ?? null,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "YouTube 配對失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
