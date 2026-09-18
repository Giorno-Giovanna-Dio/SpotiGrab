import { NextRequest, NextResponse } from "next/server";
import { fetchPlaylistTracks } from "@/lib/spotify";
import { searchYouTubeBatch } from "@/lib/youtube";
import type { TrackWithMatch } from "@/lib/types";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url?.trim()) {
      return NextResponse.json({ error: "請提供 Spotify 播放清單 URL" }, { status: 400 });
    }

    const playlist = await fetchPlaylistTracks(body.url.trim());

    if (playlist.tracks.length === 0) {
      return NextResponse.json({ error: "此播放清單沒有曲目" }, { status: 400 });
    }

    const youtubeMatches = await searchYouTubeBatch(playlist.tracks);

    const tracks: TrackWithMatch[] = playlist.tracks.map((track) => ({
      ...track,
      youtube: youtubeMatches.get(track.id) ?? null,
      selected: youtubeMatches.get(track.id) !== null,
    }));

    return NextResponse.json({
      playlistName: playlist.name,
      playlistImage: playlist.image,
      tracks,
      stats: {
        total: tracks.length,
        matched: tracks.filter((t) => t.youtube).length,
        unmatched: tracks.filter((t) => !t.youtube).length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "解析播放清單失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
