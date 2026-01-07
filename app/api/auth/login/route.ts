import { NextResponse } from "next/server";
import { generateAuthUrl, generateRandomState } from "@/lib/spotify-auth";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateRandomState();
  const authUrl = generateAuthUrl(state);

  // Store state in cookie for CSRF protection
  const cookieStore = await cookies();
  cookieStore.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  });

  return NextResponse.redirect(authUrl);
}
