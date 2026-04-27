import { googleClient } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { googleUsers, users, preActivations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";
const TRIAL_DAYS = 7;
const COOKIE = "clinic_session";
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

async function makeToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

function redirectWithCookie(targetPath, token) {
  const url = new URL(targetPath, process.env.NEXT_PUBLIC_BASE_URL);
  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  if (!code || !state || state !== savedState || !codeVerifier) {
    return new Response("Invalid request", { status: 400 });
  }

  const tokens = await googleClient.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const googleUser = await googleRes.json();

  // 1. google_users upsert
  const existing = await db
    .select()
    .from(googleUsers)
    .where(eq(googleUsers.googleId, googleUser.id))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(googleUsers).values({
      googleId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });
  } else {
    await db
      .update(googleUsers)
      .set({ name: googleUser.name, picture: googleUser.picture })
      .where(eq(googleUsers.googleId, googleUser.id));
  }

  // 2. pre_activations check (payment-first flow)
  const preActive = await db
    .select()
    .from(preActivations)
    .where(eq(preActivations.email, googleUser.email))
    .limit(1);

  // 3. users row का status decide करो
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, googleUser.email))
    .limit(1);

  if (existingUser.length === 0) {
    if (preActive.length > 0) {
      // payment पहले हुआ था — सीधा active 1 साल
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      await db.insert(users).values({
        email: googleUser.email,
        name: googleUser.name,
        status: "active",
        expiryDate: expiry.toISOString(),
        reminderSent: 0,
      });
      await db
        .delete(preActivations)
        .where(eq(preActivations.email, googleUser.email));
    } else {
      // नया user — 7 दिन trial
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS);
      await db.insert(users).values({
        email: googleUser.email,
        name: googleUser.name,
        status: "trial",
        expiryDate: trialEnds.toISOString(),
        reminderSent: 0,
      });
    }
  } else if (preActive.length > 0) {
    // user पहले से था (expired/trial), payment अभी हुआ
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    await db
      .update(users)
      .set({
        status: "active",
        expiryDate: expiry.toISOString(),
        reminderSent: 0,
      })
      .where(eq(users.email, googleUser.email));
    await db
      .delete(preActivations)
      .where(eq(preActivations.email, googleUser.email));
  }

  // 4. session token create करो (हर redirect पर cookie attach होगी)
  const token = await makeToken({
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
  });

  // 5. final user state से decide करो redirect कहाँ
  const userRow = await db
    .select()
    .from(users)
    .where(eq(users.email, googleUser.email))
    .limit(1);
  const u = userRow[0];

  const isDeveloper = googleUser.email === DEVELOPER_EMAIL;
  const expiryDate = u?.expiryDate ? new Date(u.expiryDate) : null;
  const isActive = u?.status === "active" && expiryDate && expiryDate > new Date();
  const isTrial = u?.status === "trial" && expiryDate && expiryDate > new Date();

  if (isDeveloper || isActive || isTrial) {
    return redirectWithCookie("/dashboard", token);
  }

  return redirectWithCookie("/expired", token);
}