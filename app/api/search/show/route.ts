import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SpotifyClient } from "@/lib/spotify-client";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const client = new SpotifyClient(accessToken);
    const results = await client.searchShows(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search shows" },
      { status: 500 }
    );
  }
}
