"use client";

import { useState } from "react";
import { parseTimestamp } from "@/lib/timestamp-parser";

interface PodcastSearchFormProps {
  onSearch: (podcastName: string, timestampMs: number) => void;
  isLoading: boolean;
}

export function PodcastSearchForm({ onSearch, isLoading }: PodcastSearchFormProps) {
  const [podcastName, setPodcastName] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [timestampError, setTimestampError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!podcastName.trim()) {
      return;
    }

    const parsed = parseTimestamp(timestamp);

    if (!parsed.isValid) {
      setTimestampError(parsed.error || "Invalid timestamp");
      return;
    }

    setTimestampError(null);
    onSearch(podcastName.trim(), parsed.milliseconds);
  };

  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    setTimestampError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div>
        <label htmlFor="podcast-name" className="block text-sm font-medium mb-2">
          Podcast Episode Name
        </label>
        <input
          id="podcast-name"
          type="text"
          value={podcastName}
          onChange={(e) => setPodcastName(e.target.value)}
          placeholder="e.g., The Daily Jan 15"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-spotify-green focus:outline-none"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the podcast show and episode name to search
        </p>
      </div>

      <div>
        <label htmlFor="timestamp" className="block text-sm font-medium mb-2">
          Timestamp
        </label>
        <input
          id="timestamp"
          type="text"
          value={timestamp}
          onChange={(e) => handleTimestampChange(e.target.value)}
          placeholder="MM:SS or HH:MM:SS (e.g., 12:30 or 1:23:45)"
          className={`w-full px-4 py-3 rounded-lg bg-gray-800 border ${
            timestampError ? "border-red-500" : "border-gray-700"
          } focus:border-spotify-green focus:outline-none`}
          required
          disabled={isLoading}
        />
        {timestampError && (
          <p className="text-xs text-red-500 mt-1">{timestampError}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Format: MM:SS (e.g., 12:30) or HH:MM:SS (e.g., 1:23:45)
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !podcastName.trim() || !timestamp.trim()}
        className="w-full bg-spotify-green hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
      >
        {isLoading ? "Searching..." : "Search & Play"}
      </button>
    </form>
  );
}
