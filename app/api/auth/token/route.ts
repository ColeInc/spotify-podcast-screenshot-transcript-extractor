import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshAccessToken } from "@/lib/spotify-auth";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;
  const refreshToken = cookieStore.get("spotify_refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // If access token exists and is valid, return it
  if (accessToken) {
    return NextResponse.json({ access_token: accessToken });
  }

  // If only refresh token exists, try to refresh the access token
  if (refreshToken) {
    try {
      const tokenResponse = await refreshAccessToken(refreshToken);

      cookieStore.set("spotify_access_token", tokenResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokenResponse.expires_in,
      });

      return NextResponse.json({ access_token: tokenResponse.access_token });
    } catch (error) {
      console.error("Token refresh error:", error);
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 }
      );
    }
  }

  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("spotify_access_token");
  cookieStore.delete("spotify_refresh_token");

  return NextResponse.json({ success: true });
}
