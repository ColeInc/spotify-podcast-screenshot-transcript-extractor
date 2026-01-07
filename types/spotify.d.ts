export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyShow {
  id: string;
  name: string;
  publisher: string;
  images: Array<{ url: string; height: number; width: number }>;
  description: string;
}

export interface SpotifyEpisode {
  id: string;
  name: string;
  description: string;
  duration_ms: number;
  release_date: string;
  uri: string;
  images: Array<{ url: string; height: number; width: number }>;
}

export interface SpotifySearchResponse {
  shows: {
    items: SpotifyShow[];
  };
}

export interface SpotifyEpisodesResponse {
  items: SpotifyEpisode[];
  next: string | null;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
  } | null;
}

export interface EpisodeMatch {
  episode: SpotifyEpisode;
  score: number;
}
