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

export type JobStatus = "pending" | "searching" | "downloading" | "zipping" | "completed" | "failed";

export interface TrackDownloadStatus {
  trackId: string;
  name: string;
  status: "pending" | "downloading" | "completed" | "failed" | "skipped";
  error?: string;
}

export interface DownloadJob {
  id: string;
  status: JobStatus;
  progress: number;
  total: number;
  tracks: TrackDownloadStatus[];
  zipPath?: string;
  error?: string;
  createdAt: number;
}

export interface PlaylistResponse {
  playlistName: string;
  playlistImage?: string;
  tracks: TrackWithMatch[];
}
