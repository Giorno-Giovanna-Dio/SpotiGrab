declare module "yt-search" {
  interface VideoResult {
    videoId: string;
    title: string;
    url: string;
    thumbnail?: string;
    seconds: number;
    duration?: { seconds?: number } | string;
  }

  interface SearchResult {
    videos: VideoResult[];
  }

  function yts(query: string): Promise<SearchResult>;
  export = yts;
}
