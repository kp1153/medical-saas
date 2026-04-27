import { googleClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, googleUsers } from "@/lib/schema";
import { createSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";

function redirectWithCookie(request, path, token) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  if (!code || !state || state !== savedState || !codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  try {
    const tokens = await googleClient.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const googleUser = await userRes.json();

    let gu = await db
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
      trialEnds.setDate(trialEnds.getDate() + 7);
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
      return redirectWithCookie(request, "/dashboard", token);
    }

    const now = new Date();
    const expiryDate = u.expiryDate ? new Date(u.expiryDate) : null;
    const isActive = u.status === "active" && expiryDate && now < expiryDate;
    const isTrial = u.status === "trial" && expiryDate && now < expiryDate;

    if (isActive || isTrial) {
      return redirectWithCookie(request, "/dashboard", token);
    }

    return redirectWithCookie(request, "/expired", token);
  } catch (e) {
    console.error("Callback error:", e);
    return NextResponse.redirect(new URL("/login?error=failed", request.url));
  }
}