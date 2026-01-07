"use client";

import { SpotifyEpisode } from "@/types/spotify";
import { useState } from "react";

interface EpisodeSelectorProps {
  episodes: Array<{ episode: SpotifyEpisode; score: number }>;
  onSelect: (episode: SpotifyEpisode) => void;
  onCancel: () => void;
}

export function EpisodeSelector({ episodes, onSelect, onCancel }: EpisodeSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>("");

  const handleSubmit = () => {
    const selected = episodes.find((e) => e.episode.id === selectedId);
    if (selected) {
      onSelect(selected.episode);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="bg-gray-900 rounded-lg p-4 border border-yellow-600">
        <h3 className="text-lg font-semibold mb-2">Multiple Matches Found</h3>
        <p className="text-sm text-gray-400">
          We found {episodes.length} episodes that might match your search. Please select the
          correct one:
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {episodes.map(({ episode, score }) => (
          <div
            key={episode.id}
            onClick={() => setSelectedId(episode.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedId === episode.id
                ? "border-spotify-green bg-gray-800"
                : "border-gray-700 bg-gray-900 hover:border-gray-600"
            }`}
          >
            <div className="flex items-start gap-4">
              {episode.images && episode.images[0] && (
                <img
                  src={episode.images[0].url}
                  alt={episode.name}
                  className="w-16 h-16 rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{episode.name}</h4>
                <p className="text-sm text-gray-400">
                  {new Date(episode.release_date).toLocaleDateString()} •{" "}
                  {formatDuration(episode.duration_ms)}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {episode.description}
                </p>
                <p className="text-xs text-spotify-green mt-1">
                  Match confidence: {Math.round(score * 100)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedId}
          className="flex-1 bg-spotify-green hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
        >
          Play Selected Episode
        </button>
      </div>
    </div>
  );
}
