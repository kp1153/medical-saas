import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const result = await db.select().from(patients).where(eq(patients.id, parseInt(id))).limit(1);
  return NextResponse.json(result[0] || null);
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  await db.update(patients)
    .set({
      name:      body.name,
      phone:     body.phone,
      address:   body.address,
      age:       body.age ? parseInt(body.age) : null,
      gender:    body.gender,
      complaint: body.complaint,
    })
    .where(eq(patients.id, parseInt(id)));
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  await db.delete(patients).where(eq(patients.id, parseInt(id)));
  return NextResponse.json({ success: true });
}