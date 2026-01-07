import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SpotifyClient } from "@/lib/spotify-client";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { deviceId, episodeUri, positionMs = 0 } = body;

    if (!deviceId || !episodeUri) {
      return NextResponse.json(
        { error: "Missing deviceId or episodeUri" },
        { status: 400 }
      );
    }

    const client = new SpotifyClient(accessToken);
    await client.startPlayback(deviceId, episodeUri, positionMs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Playback error:", error);
    return NextResponse.json(
      { error: "Failed to start playback" },
      { status: 500 }
    );
  }
}
