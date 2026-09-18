import spotifyUrlInfo from "spotify-url-info";
import type { SpotifyTrack } from "./types";

const { getPreview, getTracks } = spotifyUrlInfo(fetch);

function trackIdFromUri(uri: string): string {
  const match = uri.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (!match) {
    throw new Error("無法解析曲目 URI");
  }
  return match[1];
}

function parseArtists(artist: string): { name: string }[] {
  return artist
    .split(/,\s*| & | feat\. | ft\. /i)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

interface EmbedTrack {
  name: string;
  artist: string;
  duration: number;
  uri: string;
}

export async function fetchPlaylistFromEmbed(playlistUrl: string): Promise<{
  name: string;
  image?: string;
  tracks: SpotifyTrack[];
  source: "embed";
  note?: string;
}> {
  const [preview, rawTracks] = await Promise.all([
    getPreview(playlistUrl),
    getTracks(playlistUrl),
  ]);

  const tracks: SpotifyTrack[] = (rawTracks as EmbedTrack[]).map((track) => ({
    id: trackIdFromUri(track.uri),
    name: track.name,
    artists: parseArtists(track.artist),
    album: "",
    durationMs: track.duration,
  }));

  if (tracks.length === 0) {
    throw new Error("此播放清單沒有曲目，或無法從 Spotify 讀取。");
  }

  return {
    name: preview.title ?? "Spotify Playlist",
    image: preview.image,
    tracks,
    source: "embed",
    note:
      tracks.length >= 100
        ? "透過 Spotify 公開頁面解析，目前最多顯示前 100 首。若清單更長，請在 Spotify 中分段或使用較短的清單。"
        : undefined,
  };
}
