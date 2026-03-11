import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();

  if (password !== process.env.SHOP_PASSWORD) {
    return NextResponse.json({ success: false, message: "Wrong password" });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth", "1", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}