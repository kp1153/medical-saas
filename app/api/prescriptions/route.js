import { db } from "@/lib/db";
import { prescriptions } from "@/lib/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET() {
  // ← fix: GET missing था, pharmacy page crash करती थी
  const all = await db.select().from(prescriptions).orderBy(desc(prescriptions.createdAt));
  return NextResponse.json(all);
}

export async function POST(req) {
  const body = await req.json();
  const inserted = await db.insert(prescriptions).values({
    patientId: body.patientId,
    diagnosis: body.diagnosis || null,
    notes:     body.notes     || null,
    medicines: JSON.stringify(body.medicines),
    tests:     body.tests ? JSON.stringify(body.tests) : null,
    sentToPharmacy: 1,
  }).returning({ id: prescriptions.id });
  return NextResponse.json({ success: true, id: inserted[0].id });
}
