import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  const { phone, password } = await req.json();

  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

  if (!result.length || result[0].password !== password) {
    return NextResponse.json({ success: false, message: "Invalid credentials" });
  }

  const cookieStore = await cookies();
  cookieStore.set("user_id", String(result[0].id), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true });
}

