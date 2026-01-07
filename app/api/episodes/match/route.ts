import { NextRequest, NextResponse } from "next/server";
import { findBestEpisodeMatch } from "@/lib/fuzzy-match";
import { SpotifyEpisode } from "@/types/spotify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { episodes, searchQuery } = body;

    if (!episodes || !searchQuery) {
      return NextResponse.json(
        { error: "Missing episodes or searchQuery" },
        { status: 400 }
      );
    }

    const { bestMatch, topMatches } = findBestEpisodeMatch(
      episodes as SpotifyEpisode[],
      searchQuery
    );

    return NextResponse.json({
      bestMatch,
      topMatches,
      confidence: bestMatch ? topMatches[0]?.score || 0 : 0,
    });
  } catch (error) {
    console.error("Episode matching error:", error);
    return NextResponse.json(
      { error: "Failed to match episodes" },
      { status: 500 }
    );
  }
}
