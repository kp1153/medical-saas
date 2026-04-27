import { googleClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, googleUsers } from "@/lib/schema";
import { createSession, SESSION_COOKIE } from "@/lib/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";
const TRIAL_DAYS = 7;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// KEY FIX: cookieStore.set() is the Next.js 15/16 recommended way.
// response.cookies.set() on a redirect is unreliable behind reverse proxies.
async function setSessionAndRedirect(cookieStore, token, path) {
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  // KEY FIX: BASE_URL ensures correct public domain, not internal localhost URL
  return NextResponse.redirect(new URL(path, BASE_URL));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  // Separate error messages for easier debugging
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", BASE_URL));
  }
  if (!savedState || !codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=no_state_cookie", BASE_URL));
  }
  if (state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=state_mismatch", BASE_URL));
  }

  try {
    const tokens = await googleClient.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const googleUser = await userRes.json();

    const gu = await db
      .select()
      .from(googleUsers)
      .where(eq(googleUsers.googleId, googleUser.id))
      .limit(1);

    if (gu.length === 0) {
      await db.insert(googleUsers).values({
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      });
    }

    let userRow = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    if (userRow.length === 0) {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS);
      await db.insert(users).values({
        email: googleUser.email,
        name: googleUser.name,
        status: "trial",
        expiryDate: trialEnds.toISOString(),
        reminderSent: 0,
      });
      userRow = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email))
        .limit(1);
    }

    const u = userRow[0];

    const token = await createSession({
      email: u.email,
      name: u.name,
      picture: googleUser.picture,
      status: u.status,
      expiry_date: u.expiryDate,
    });

    if (u.email === DEVELOPER_EMAIL) {
      return setSessionAndRedirect(cookieStore, token, "/dashboard");
    }

    const now = new Date();
    const expiryDate = u.expiryDate ? new Date(u.expiryDate) : null;
    const isActive = u.status === "active" && expiryDate && now < expiryDate;
    const isTrial = u.status === "trial" && expiryDate && now < expiryDate;

    if (isActive || isTrial) {
      return setSessionAndRedirect(cookieStore, token, "/dashboard");
    }

    return setSessionAndRedirect(cookieStore, token, "/expired");
  } catch (e) {
    console.error("Callback error:", e);
    return NextResponse.redirect(new URL("/login?error=failed", BASE_URL));
  }
}