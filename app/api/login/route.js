import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();

  if (password !== process.env.SHOP_PASSWORD) {
    return NextResponse.json({ success: false, message: "Wrong password" });
  }

  return NextResponse.json({ success: true, token: "authenticated" });
}