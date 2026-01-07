import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SpotifyClient } from "@/lib/spotify-client";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const client = new SpotifyClient(accessToken);
    const state = await client.getPlaybackState();

    return NextResponse.json(state);
  } catch (error) {
    console.error("Get playback state error:", error);
    return NextResponse.json(
      { error: "Failed to get playback state" },
      { status: 500 }
    );
  }
}
