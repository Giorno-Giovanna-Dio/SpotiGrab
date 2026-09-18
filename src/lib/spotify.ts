import type { SpotifyTrack } from "./types";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

function getCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "缺少 Spotify API 憑證。請在 .env.local 設定 SPOTIFY_CLIENT_ID 與 SPOTIFY_CLIENT_SECRET。"
    );
  }

  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const { clientId, clientSecret } = getCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Spotify 認證失敗：${response.status}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export function extractPlaylistId(url: string): string {
  const patterns = [
    /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /spotify:playlist:([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error("無法解析 Spotify 播放清單 URL。請貼上完整的 open.spotify.com/playlist/... 連結。");
}

interface SpotifyApiTrackItem {
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { name: string };
    duration_ms: number;
  } | null;
}

interface SpotifyPlaylistResponse {
  name: string;
  images: { url: string }[];
  tracks: {
    items: SpotifyApiTrackItem[];
    next: string | null;
  };
}

export async function fetchPlaylistTracks(playlistUrl: string): Promise<{
  name: string;
  image?: string;
  tracks: SpotifyTrack[];
}> {
  const playlistId = extractPlaylistId(playlistUrl);
  const token = await getAccessToken();

  const playlistResponse = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!playlistResponse.ok) {
    if (playlistResponse.status === 404) {
      throw new Error("找不到此播放清單，請確認 URL 是否正確且為公開清單。");
    }
    throw new Error(`無法取得播放清單：${playlistResponse.status}`);
  }

  const playlist = (await playlistResponse.json()) as SpotifyPlaylistResponse;
  const tracks: SpotifyTrack[] = [];

  let nextUrl: string | null = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=100`;

  while (nextUrl) {
    const tracksResponse = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!tracksResponse.ok) {
      throw new Error(`無法取得曲目列表：${tracksResponse.status}`);
    }

    const data = (await tracksResponse.json()) as {
      items: SpotifyApiTrackItem[];
      next: string | null;
    };

    for (const item of data.items) {
      if (!item.track?.id) continue;
      tracks.push({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((a) => ({ name: a.name })),
        album: item.track.album.name,
        durationMs: item.track.duration_ms,
      });
    }

    nextUrl = data.next;
  }

  return {
    name: playlist.name,
    image: playlist.images[0]?.url,
    tracks,
  };
}
