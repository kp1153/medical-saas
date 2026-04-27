import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false });

  if (session.email === DEVELOPER_EMAIL) {
    return NextResponse.json({ ok: true, user: session });
  }

  const userRow = await db.select().from(users).where(eq(users.email, session.email)).limit(1);
  const u = userRow[0];
  if (!u) return NextResponse.json({ ok: false });

  const now = new Date();
  const expiry = u.expiryDate ? new Date(u.expiryDate) : null;
  const isActive = u.status === "active" && expiry && expiry > now;
  const isTrial = u.status === "trial" && expiry && expiry > now;

  if (!isActive && !isTrial) return NextResponse.json({ ok: false });

  return NextResponse.json({ ok: true, user: session });
}