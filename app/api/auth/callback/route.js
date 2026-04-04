import { googleClient } from "@/lib/auth";
import { decodeIdToken } from "arctic";
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
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  let tokens;
  try {
    tokens = await googleClient.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return new Response("Failed to validate code", { status: 400 });
  }

  const claims = decodeIdToken(tokens.idToken());
  const googleId = claims.sub;
  const email = claims.email;
  const name = claims.name;
  const picture = claims.picture;

  // google_users table update
  const existing = await db
    .select()
    .from(googleUsers)
    .where(eq(googleUsers.googleId, googleId))
    .limit(1);

  let userId;
  if (existing.length === 0) {
    const inserted = await db
      .insert(googleUsers)
      .values({ googleId, email, name, picture })
      .returning({ id: googleUsers.id });
    userId = inserted[0].id;
  } else {
    userId = existing[0].id;
    await db
      .update(googleUsers)
      .set({ name, picture })
      .where(eq(googleUsers.googleId, googleId));
  }

  // users table — KP website इसी में activate करती है
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length === 0) {
    // नया user — trial शुरू
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS);
    await db.insert(users).values({
      email,
      name,
      status: "trial",
      expiryDate: trialEnds.toISOString(),
      reminderSent: 0,
    });
  }

  // access check
  const userRow = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const u = userRow[0];
  const isDeveloper = email === DEVELOPER_EMAIL;
  const isActive = u?.status === "active" && u?.expiryDate && new Date(u.expiryDate) > new Date();
  const isTrial = u?.status === "trial" && u?.expiryDate && new Date(u.expiryDate) > new Date();

  await createSessionCookie({ userId, email, name, picture });

  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_code_verifier");

  if (isDeveloper || isActive || isTrial) {
    return Response.redirect(new URL("/dashboard", request.url).toString());
  }

  return Response.redirect(new URL("/expired", request.url).toString());
}