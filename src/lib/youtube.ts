import yts from "yt-search";
import type { SpotifyTrack, YouTubeMatch } from "./types";

function buildSearchQuery(track: SpotifyTrack): string {
  const artist = track.artists.map((a) => a.name).join(" ");
  return `${artist} ${track.name} official audio`;
}

function parseDuration(duration: { seconds?: number } | string | undefined): string {
  if (!duration) return "";
  if (typeof duration === "string") return duration;

  const totalSeconds = duration.seconds ?? 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function searchYouTube(track: SpotifyTrack): Promise<YouTubeMatch | null> {
  const query = buildSearchQuery(track);
  const results = await yts(query);

  const video = results.videos.find(
    (v) => v.videoId && !v.title.toLowerCase().includes("cover") && v.seconds > 30
  ) ?? results.videos[0];

  if (!video?.videoId) return null;

  return {
    videoId: video.videoId,
    title: video.title,
    url: video.url,
    duration: parseDuration(video.duration),
    thumbnail: video.thumbnail,
  };
}

export async function searchYouTubeBatch(
  tracks: SpotifyTrack[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, YouTubeMatch | null>> {
  const results = new Map<string, YouTubeMatch | null>();

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    try {
      const match = await searchYouTube(track);
      results.set(track.id, match);
    } catch {
      results.set(track.id, null);
    }

    onProgress?.(i + 1, tracks.length);

    // 避免 YouTube 搜尋請求過於頻繁
    if (i < tracks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return results;
}
