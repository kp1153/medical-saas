import { db } from "@/lib/db";
import { medicines } from "@/lib/schema";
import { MEDICINE_DATA } from "@/lib/medicineData";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 50;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const batchIndex = parseInt(searchParams.get("batch") || "0");
  const reset = searchParams.get("reset") === "true";

  try {
    if (reset && batchIndex === 0) {
      await db.delete(medicines);
    }

    const start = batchIndex * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    const batch = MEDICINE_DATA.slice(start, end);

    if (batch.length === 0) {
      return NextResponse.json({
        success: true,
        done: true,
        total: MEDICINE_DATA.length,
        message: `All ${MEDICINE_DATA.length} medicines seeded successfully`,
      });
    }

    await db.insert(medicines).values(
      batch.map((m) => ({
        name: m.name,
        generic: m.generic || null,
        company: m.company || null,
        mrp: m.mrp,
        purchasePrice: m.purchasePrice || null,
        unit: m.unit || "strip",
        gst: m.gst || 12,
        hsn: m.hsn || null,
        rack: m.rack || null,
        stock: 0,
        batch: null,
        expiry: null,
      }))
    ).onConflictDoNothing();

    return NextResponse.json({
      success: true,
      done: false,
      batchIndex,
      seeded: start + batch.length,
      total: MEDICINE_DATA.length,
      nextBatch: batchIndex + 1,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}