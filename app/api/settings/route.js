import { db } from "@/lib/db";
import { clinicSettings } from "@/lib/schema";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await db.select().from(clinicSettings).limit(1);
  if (all.length === 0) {
    await db.insert(clinicSettings).values({ clinicName: "My Clinic" });
    const fresh = await db.select().from(clinicSettings).limit(1);
    return NextResponse.json(fresh[0]);
  }
  return NextResponse.json(all[0]);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const existing = await db.select().from(clinicSettings).limit(1);

  if (existing.length === 0) {
    await db.insert(clinicSettings).values({
      clinicName: body.clinicName || "My Clinic",
      ownerName: body.ownerName || null,
      address: body.address || null,
      phone: body.phone || null,
      email: body.email || null,
      gstin: body.gstin || null,
      dlNo: body.dlNo || null,
      city: body.city || null,
      state: body.state || null,
      pincode: body.pincode || null,
      tagline: body.tagline || null,
    });
  } else {
    await db
      .update(clinicSettings)
      .set({
        clinicName: body.clinicName,
        ownerName: body.ownerName,
        address: body.address,
        phone: body.phone,
        email: body.email,
        gstin: body.gstin,
        dlNo: body.dlNo,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        tagline: body.tagline,
        updatedAt: new Date().toISOString(),
      });
  }
  return NextResponse.json({ success: true });
}