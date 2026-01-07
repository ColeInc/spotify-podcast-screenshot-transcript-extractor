"use client";

import { SpotifyEpisode } from "@/types/spotify";
import { formatTimestamp } from "@/lib/timestamp-parser";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";

interface PodcastPlayerProps {
  episode: SpotifyEpisode;
  accessToken: string;
  onPlayComplete: () => void;
}

export function PodcastPlayer({ episode, accessToken, onPlayComplete }: PodcastPlayerProps) {
  const { isReady, isPlaying, currentPosition, error, togglePlay } =
    useSpotifyPlayer(accessToken);

  if (error) {
    return (
      <div className="w-full max-w-2xl p-6 bg-red-900/20 border border-red-500 rounded-lg">
        <h3 className="text-lg font-semibold text-red-500 mb-2">Playback Error</h3>
        <p className="text-sm text-gray-300">{error}</p>
        <button
          onClick={onPlayComplete}
          className="mt-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start gap-4">
          {episode.images && episode.images[0] && (
            <img
              src={episode.images[0].url}
              alt={episode.name}
              className="w-24 h-24 rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{episode.name}</h3>
            <p className="text-sm text-gray-400 mt-1">
              Released: {new Date(episode.release_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-400">
              Duration: {formatTimestamp(episode.duration_ms)}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Player Status:</span>
            <span
              className={`font-semibold ${
                isReady ? "text-spotify-green" : "text-yellow-500"
              }`}
            >
              {isReady ? "Ready" : "Initializing..."}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Playback:</span>
            <span className="font-semibold">
              {isPlaying ? "Playing" : "Paused"} • {formatTimestamp(currentPosition)}
            </span>
          </div>

          <button
            onClick={togglePlay}
            disabled={!isReady}
            className="w-full bg-spotify-green hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={onPlayComplete}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors"
          >
            Search Another Episode
          </button>
        </div>
      </div>

      {!isReady && (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            Initializing Spotify Web Playback SDK... This may take a few seconds.
          </p>
        </div>
      )}
    </div>
  );
}
