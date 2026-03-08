import { db } from "@/lib/db";
import { suppliers } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(suppliers);
  return NextResponse.json(all);
}

export async function POST(req) {
  const body = await req.json();
  await db.insert(suppliers).values({
    name: body.name,
    phone: body.phone || null,
    address: body.address || null,
    gstNo: body.gstNo || null,
  });
  return NextResponse.json({ success: true });
}

