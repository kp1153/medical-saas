import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  const { password } = await req.json();

  if (password !== process.env.SHOP_PASSWORD) {
    return NextResponse.json({ success: false, message: "Wrong password" });
  }

  const cookieStore = await cookies();
  cookieStore.set("auth", "1", {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true });
}
