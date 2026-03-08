import { db } from "@/lib/db";
import { medicines } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(medicines);
  return NextResponse.json(all);
}

export async function POST(req) {
  const body = await req.json();
  await db.insert(medicines).values({
    name: body.name,
    generic: body.generic || null,
    company: body.company || null,
    batch: body.batch || null,
    expiry: body.expiry || null,
    mrp: parseFloat(body.mrp),
    purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
    stock: parseInt(body.stock) || 0,
    unit: body.unit || "strip",
    rack: body.rack || null,
    hsn: body.hsn || null,
    gst: parseFloat(body.gst) || 12,
  });
  return NextResponse.json({ success: true });
}

