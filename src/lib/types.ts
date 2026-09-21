export interface SpotifyArtist {
  name: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: string;
  durationMs: number;
}

export interface YouTubeMatch {
  videoId: string;
  title: string;
  url: string;
  duration: string;
  thumbnail?: string;
}

export interface TrackWithMatch extends SpotifyTrack {
  youtube: YouTubeMatch | null;
  selected: boolean;
}

export interface PlaylistResponse {
  playlistName: string;
  playlistImage?: string;
  tracks: TrackWithMatch[];
}
