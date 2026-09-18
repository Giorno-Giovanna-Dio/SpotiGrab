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
  options?: { concurrency?: number; delayMs?: number }
): Promise<Map<string, YouTubeMatch | null>> {
  const concurrency = options?.concurrency ?? 5;
  const delayMs = options?.delayMs ?? 80;
  const results = new Map<string, YouTubeMatch | null>();

  for (let i = 0; i < tracks.length; i += concurrency) {
    const chunk = tracks.slice(i, i + concurrency);

    const chunkResults = await Promise.all(
      chunk.map(async (track) => {
        try {
          const match = await searchYouTube(track);
          return [track.id, match] as const;
        } catch {
          return [track.id, null] as const;
        }
      })
    );

    for (const [id, match] of chunkResults) {
      results.set(id, match);
    }

    if (i + concurrency < tracks.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
