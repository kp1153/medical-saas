import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (session) return NextResponse.json({ ok: true, user: session });
  return NextResponse.json({ ok: false });
}