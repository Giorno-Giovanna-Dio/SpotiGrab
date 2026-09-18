import { NextRequest, NextResponse } from "next/server";
import { extractPlaylistId } from "@/lib/spotify";
import { fetchPlaylistFromEmbed } from "@/lib/spotify-embed";
import type { TrackWithMatch } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url?.trim()) {
      return NextResponse.json({ error: "請提供 Spotify 播放清單 URL" }, { status: 400 });
    }

    const playlistUrl = body.url.trim();
    extractPlaylistId(playlistUrl);

    const playlist = await fetchPlaylistFromEmbed(playlistUrl);

    if (playlist.tracks.length === 0) {
      return NextResponse.json({ error: "此播放清單沒有曲目" }, { status: 400 });
    }

    const tracks: TrackWithMatch[] = playlist.tracks.map((track) => ({
      ...track,
      youtube: null,
      selected: true,
    }));

    return NextResponse.json({
      playlistName: playlist.name,
      playlistImage: playlist.image,
      tracks,
      note: playlist.note,
      stats: {
        total: tracks.length,
        matched: 0,
        unmatched: tracks.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "解析播放清單失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
