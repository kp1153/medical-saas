import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { NextResponse } from "next/server";
import { like, or, desc } from "drizzle-orm";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();

  let all;
  if (search) {
    all = await db.select().from(patients).where(
      or(
        like(patients.name, `%${search}%`),
        like(patients.phone, `%${search}%`)
      )
    ).orderBy(desc(patients.createdAt));
  } else {
    all = await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

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