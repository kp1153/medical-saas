import { db } from "@/lib/db";
import { labReports } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  await db.update(labReports).set({
    result: body.result,
    reportDate: body.reportDate || null,
  }).where(eq(labReports.id, parseInt(id)));
  return NextResponse.json({ success: true });
}