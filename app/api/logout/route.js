import { deleteSessionCookie } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  await deleteSessionCookie();
  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_BASE_URL).toString()
  );
}

export async function POST() {
  await deleteSessionCookie();
  return NextResponse.json({ success: true });
}