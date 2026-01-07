"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { LoginButton } from "@/components/LoginButton";
import { PodcastSearchForm } from "@/components/PodcastSearchForm";
import { EpisodeSelector } from "@/components/EpisodeSelector";
import { PodcastPlayer } from "@/components/PodcastPlayer";
import { useState, useEffect } from "react";
import { SpotifyEpisode, SpotifyShow, EpisodeMatch } from "@/types/spotify";

type AppState =
  | { type: "search" }
  | { type: "selecting"; matches: EpisodeMatch[] }
  | { type: "playing"; episode: SpotifyEpisode; timestampMs: number };

export default function Home() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const { deviceId, isReady } = useSpotifyPlayer(accessToken);

  const [appState, setAppState] = useState<AppState>({ type: "search" });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [targetTimestampMs, setTargetTimestampMs] = useState<number>(0);

  const handleSearch = async (podcastName: string, timestampMs: number) => {
    setIsSearching(true);
    setError(null);
    setSearchQuery(podcastName);
    setTargetTimestampMs(timestampMs);

    try {
      // Step 1: Extract show name from podcast name (first part before episode identifier)
      const showName = podcastName.split(/\b(episode|ep|#|\d{1,2}\/\d{1,2})/i)[0].trim();

      // Step 2: Search for the show
      const searchResponse = await fetch(
        `/api/search/show?q=${encodeURIComponent(showName)}`
      );

      if (!searchResponse.ok) {
        throw new Error("Failed to search for podcast show");
      }

      const searchData = await searchResponse.json();

      if (!searchData.shows?.items || searchData.shows.items.length === 0) {
        setError(`No podcast shows found for "${showName}"`);
        setIsSearching(false);
        return;
      }

      const show: SpotifyShow = searchData.shows.items[0];

      // Step 3: Get episodes from the show
      const episodesResponse = await fetch(`/api/show/${show.id}/episodes`);

      if (!episodesResponse.ok) {
        throw new Error("Failed to fetch episodes");
      }

      const episodesData = await episodesResponse.json();

      if (!episodesData.items || episodesData.items.length === 0) {
        setError(`No episodes found for "${show.name}"`);
        setIsSearching(false);
        return;
      }

      // Step 4: Fuzzy match episodes
      const matchResponse = await fetch("/api/episodes/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodes: episodesData.items,
          searchQuery: podcastName,
        }),
      });

      if (!matchResponse.ok) {
        throw new Error("Failed to match episodes");
      }

      const matchData = await matchResponse.json();

      if (matchData.bestMatch) {
        // High confidence match - auto-play
        await playEpisode(matchData.bestMatch, timestampMs);
      } else if (matchData.topMatches && matchData.topMatches.length > 0) {
        // Low confidence - show selector
        setAppState({ type: "selecting", matches: matchData.topMatches });
      } else {
        setError(`No matching episodes found for "${podcastName}"`);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during search");
    } finally {
      setIsSearching(false);
    }
  };

  const playEpisode = async (episode: SpotifyEpisode, timestampMs: number) => {
    setAppState({ type: "playing", episode, timestampMs });
  };

  const handleEpisodeSelect = async (episode: SpotifyEpisode) => {
    setIsSearching(true);
    await playEpisode(episode, targetTimestampMs);
    setIsSearching(false);
  };

  const handleCancelSelection = () => {
    setAppState({ type: "search" });
  };

  const handlePlayComplete = () => {
    setAppState({ type: "search" });
  };

  // Initiate playback when episode is selected and player is ready
  useEffect(() => {
    if (appState.type === "playing" && isReady && deviceId) {
      const { episode, timestampMs } = appState;

      const startPlayback = async () => {
        try {
          // Start playback at beginning
          await fetch("/api/playback/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId,
              episodeUri: episode.uri,
              positionMs: 0,
            }),
          });

          // Wait for playback to start
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Seek to target timestamp
          await fetch("/api/playback/seek", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              positionMs: timestampMs,
            }),
          });
        } catch (err) {
          console.error("Playback error:", err);
          setError("Failed to start playback");
        }
      };

      startPlayback();
    }
  }, [appState, isReady, deviceId]);

  if (authLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main>
        <LoginButton />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Spotify Podcast Player</h1>
          <p className="text-gray-400">
            Search for a podcast episode and play it at a specific timestamp
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          {appState.type === "search" && (
            <PodcastSearchForm onSearch={handleSearch} isLoading={isSearching} />
          )}

          {appState.type === "selecting" && (
            <EpisodeSelector
              episodes={appState.matches}
              onSelect={handleEpisodeSelect}
              onCancel={handleCancelSelection}
            />
          )}

          {appState.type === "playing" && accessToken && (
            <PodcastPlayer
              episode={appState.episode}
              accessToken={accessToken}
              onPlayComplete={handlePlayComplete}
            />
          )}
        </div>

        {!isReady && isAuthenticated && (
          <div className="max-w-2xl mx-auto mt-6 bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              Initializing Spotify player... This may take a few seconds.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
