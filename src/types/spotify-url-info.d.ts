declare module "spotify-url-info" {
  interface SpotifyPreview {
    title?: string;
    image?: string;
    type?: string;
  }

  interface SpotifyUrlInfo {
    getPreview(url: string): Promise<SpotifyPreview>;
    getTracks(url: string): Promise<unknown[]>;
    getData(url: string): Promise<unknown>;
    getDetails(url: string): Promise<unknown>;
  }

  function spotifyUrlInfo(fetchFn: typeof fetch): SpotifyUrlInfo;
  export = spotifyUrlInfo;
}
