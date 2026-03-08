import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        diagnosis TEXT,
        notes TEXT,
        medicines TEXT NOT NULL,
        tests TEXT,
        sent_to_pharmacy INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS lab_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        prescription_id INTEGER,
        category TEXT NOT NULL,
        test_name TEXT NOT NULL,
        result TEXT,
        report_date TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await db.run(sql`ALTER TABLE patients ADD COLUMN complaint TEXT`).catch(() => null);
    await db.run(sql`ALTER TABLE prescriptions ADD COLUMN tests TEXT`).catch(() => null);
    return NextResponse.json({ success: true, message: "Tables ready" });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message });
  }
}