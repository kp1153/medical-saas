import { googleClient } from "@/lib/auth";
import { generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = googleClient.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const cookieStore = await cookies();

  cookieStore.set("google_state", state, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
    sameSite: "lax",
    secure: true,
  });

  cookieStore.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
    sameSite: "lax",
    secure: true,
  });

  return NextResponse.redirect(url);
}