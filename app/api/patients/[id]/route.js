import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const result = await db.select().from(patients).where(eq(patients.id, parseInt(id))).limit(1);
  return NextResponse.json(result[0] || null);
}