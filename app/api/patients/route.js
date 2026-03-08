import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(patients);
  return NextResponse.json(all);
}

export async function POST(req) {
  const body = await req.json();
  const inserted = await db.insert(patients).values({
    name: body.name,
    phone: body.phone || null,
    address: body.address || null,
    age: body.age ? parseInt(body.age) : null,
    gender: body.gender || null,
    complaint: body.complaint || null,
  }).returning({ id: patients.id });
  return NextResponse.json({ success: true, id: inserted[0].id });
}