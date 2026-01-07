import {
  SpotifySearchResponse,
  SpotifyEpisodesResponse,
  SpotifyPlaybackState,
} from "@/types/spotify";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export class SpotifyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spotify API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async searchShows(query: string): Promise<SpotifySearchResponse> {
    const params = new URLSearchParams({
      q: query,
      type: "show",
      limit: "10",
    });

    return this.fetch(`/search?${params.toString()}`);
  }

  async getShowEpisodes(showId: string): Promise<SpotifyEpisodesResponse> {
    const params = new URLSearchParams({
      limit: "50",
    });

    return this.fetch(`/shows/${showId}/episodes?${params.toString()}`);
  }

  async startPlayback(deviceId: string, episodeUri: string, positionMs: number = 0) {
    const params = new URLSearchParams({ device_id: deviceId });

    return this.fetch(`/me/player/play?${params.toString()}`, {
      method: "PUT",
      body: JSON.stringify({
        uris: [episodeUri],
        position_ms: positionMs,
      }),
    });
  }

  async seekToPosition(positionMs: number) {
    const params = new URLSearchParams({
      position_ms: positionMs.toString(),
    });

    return this.fetch(`/me/player/seek?${params.toString()}`, {
      method: "PUT",
    });
  }

  async getPlaybackState(): Promise<SpotifyPlaybackState> {
    return this.fetch("/me/player");
  }

  async transferPlayback(deviceId: string, play: boolean = true) {
    return this.fetch("/me/player", {
      method: "PUT",
      body: JSON.stringify({
        device_ids: [deviceId],
        play,
      }),
    });
  }
}
