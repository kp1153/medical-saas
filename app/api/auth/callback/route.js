import { googleClient } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { googleUsers, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createSessionCookie } from "@/lib/session";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";
const TRIAL_DAYS = 7;

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
    await db.update(googleUsers)
      .set({ name: googleUser.name, picture: googleUser.picture })
      .where(eq(googleUsers.googleId, googleUser.id));
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, googleUser.email))
    .limit(1);

  if (existingUser.length === 0) {
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

  const userRow = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);
  const u = userRow[0];
  const isDeveloper = googleUser.email === DEVELOPER_EMAIL;
  const isActive = u?.status === "active" && u?.expiryDate && new Date(u.expiryDate) > new Date();
  const isTrial = u?.status === "trial" && u?.expiryDate && new Date(u.expiryDate) > new Date();

  await createSessionCookie({
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
  });

  if (isDeveloper || isActive || isTrial) {
    return Response.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_BASE_URL));
  }

  return Response.redirect(new URL("/expired", process.env.NEXT_PUBLIC_BASE_URL));
}