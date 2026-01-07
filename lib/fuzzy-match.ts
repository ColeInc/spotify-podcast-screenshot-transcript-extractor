import Fuse from "fuse.js";
import { SpotifyEpisode, EpisodeMatch } from "@/types/spotify";

const CONFIDENCE_THRESHOLD = 0.3; // Lower score = better match
const CONFIDENCE_THRESHOLD_2 = 0.6; // Lower score = better match

export function findBestEpisodeMatch(
  episodes: SpotifyEpisode[],
  searchQuery: string
): { bestMatch: SpotifyEpisode | null; topMatches: EpisodeMatch[] } {
  const fuse = new Fuse(episodes, {
    keys: ["name", "description"],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 3,
    distance: 100,
  });

  const results = fuse.search(searchQuery);

  if (results.length === 0) {
    return {
      bestMatch: null,
      topMatches: [],
    };
  }

  const topMatches: EpisodeMatch[] = results.slice(0, 5).map((result) => ({
    episode: result.item,
    score: 1 - (result.score || 0), // Convert to confidence score (0-1)
  }));

  const bestResult = results[0];
  const bestConfidence = 1 - (bestResult.score || 0);

  if (bestConfidence >= 0.7) {
    // High confidence threshold (70%)
    return {
      bestMatch: bestResult.item,
      topMatches,
    };
  }

  return {
    bestMatch: null,
    topMatches,
  };
}
