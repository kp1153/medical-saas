import { googleClient } from "@/lib/auth";
import { decodeIdToken } from "arctic";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { googleUsers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createSessionCookie } from "@/lib/session";

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

  let existing = await db
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

  await createSessionCookie({ userId, email, name, picture });

  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_code_verifier");

  return Response.redirect(new URL("/dashboard", request.url).toString());
}