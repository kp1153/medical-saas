import { db } from "@/lib/db";
import { prescriptions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const result = await db.select().from(prescriptions).where(eq(prescriptions.id, parseInt(id))).limit(1);
  if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}