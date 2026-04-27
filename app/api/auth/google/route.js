import { googleClient } from "@/lib/auth";
import { generateState, generateCodeVerifier } from "arctic";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = googleClient.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  // KEY FIX: Use BASE_URL so redirect never goes to internal localhost
  const response = NextResponse.redirect(url.toString());

  // KEY FIX: sameSite "none" + secure ensures cookies survive
  // the cross-site round-trip: your site → Google → your callback
  response.cookies.set("google_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 600,
    path: "/",
  });
  response.cookies.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 600,
    path: "/",
  });

  return response;
}