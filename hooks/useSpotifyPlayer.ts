"use client";

import { useState, useEffect, useCallback } from "react";

export function useSpotifyPlayer(accessToken: string | null) {
  const [deviceId, setDeviceId] = useState<string>("");
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    // Load Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify!.Player({
        name: "Podcast Timestamp Player",
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      // Ready event
      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Player ready with device ID:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      // Not ready event
      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Player not ready:", device_id);
        setIsReady(false);
      });

      // Player state changed
      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        setIsPlaying(!state.paused);
        setCurrentPosition(state.position);
      });

      // Error handling
      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
        setError(message);
      });

      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("Authentication error:", message);
        setError(message);
      });

      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
        setError(message);
      });

      spotifyPlayer.addListener("playback_error", ({ message }) => {
        console.error("Playback error:", message);
        setError(message);
      });

      // Connect player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      player?.disconnect();
    };
  }, [accessToken]);

  const togglePlay = useCallback(async () => {
    if (!player) return;
    await player.togglePlay();
  }, [player]);

  const pause = useCallback(async () => {
    if (!player) return;
    await player.pause();
  }, [player]);

  const resume = useCallback(async () => {
    if (!player) return;
    await player.resume();
  }, [player]);

  return {
    deviceId,
    player,
    isReady,
    isPlaying,
    currentPosition,
    error,
    togglePlay,
    pause,
    resume,
  };
}
