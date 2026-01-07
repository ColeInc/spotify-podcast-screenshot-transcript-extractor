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
    const { positionMs } = body;

    if (positionMs === undefined) {
      return NextResponse.json(
        { error: "Missing positionMs" },
        { status: 400 }
      );
    }

    const client = new SpotifyClient(accessToken);
    await client.seekToPosition(positionMs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Seek error:", error);
    return NextResponse.json(
      { error: "Failed to seek" },
      { status: 500 }
    );
  }
}
