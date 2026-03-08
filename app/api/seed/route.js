import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.insert(users).values({
      name: "Admin",
      phone: "9996865069",
      password: "Maqbool2@",
      role: "admin",
    });
    return NextResponse.json({ success: true, message: "User created" });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

