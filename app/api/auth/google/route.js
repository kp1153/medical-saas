import { googleClient } from "@/lib/auth";
import { generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = googleClient.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return Response.redirect(url.toString());
}