import { deleteSessionCookie } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request) {
  await deleteSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST() {
  await deleteSessionCookie();
  return NextResponse.json({ success: true });
}