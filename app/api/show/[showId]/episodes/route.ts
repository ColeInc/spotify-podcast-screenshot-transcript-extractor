import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SpotifyClient } from "@/lib/spotify-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ showId: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { showId } = await params;

  try {
    const client = new SpotifyClient(accessToken);
    const episodes = await client.getShowEpisodes(showId);

    return NextResponse.json(episodes);
  } catch (error) {
    console.error("Get episodes error:", error);
    return NextResponse.json(
      { error: "Failed to get episodes" },
      { status: 500 }
    );
  }
}
