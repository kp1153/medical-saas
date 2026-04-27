import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await db.select().from(users);
  const now = new Date();
  const results = { trial: 0, renewal: 0, expired: 0, errors: [] };

  for (const u of allUsers) {
    if (!u.expiryDate) continue;
    const expiry = new Date(u.expiryDate);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    try {
      // 1. Trial — 6th day reminder (1 दिन बाकी)
      if (u.status === "trial" && daysLeft === 1) {
        await sendReminder({
          email: u.email,
          name: u.name || "",
          type: "trial",
          daysLeft,
          amount: 4999,
        });
        results.trial++;
      }

      // 2. Active — expiry से 7 दिन पहले से रोज, payment न आने तक
      if (u.status === "active" && daysLeft <= 7 && daysLeft >= 0) {
        await sendReminder({
          email: u.email,
          name: u.name || "",
          type: "renewal",
          daysLeft,
          amount: 1999,
        });
        results.renewal++;
      }

      // 3. Expire हो गए — status update
      if (daysLeft < 0 && u.status !== "expired") {
        await db
          .update(users)
          .set({ status: "expired" })
          .where(eq(users.email, u.email));
        results.expired++;
      }
    } catch (e) {
      results.errors.push({ email: u.email, error: e.message });
    }
  }

  return NextResponse.json({ ok: true, ...results });
}

async function sendReminder({ email, name, type, daysLeft, amount }) {
  const hubUrl = `https://nishantsoftwares.in/clinic?email=${encodeURIComponent(email)}`;

  // nishantsoftwares.in के central reminder API को call करो
  await fetch("https://nishantsoftwares.in/api/send-reminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      HUB_SECRET: process.env.HUB_SECRET,
      software: "clinic",
      softwareName: "ClinicOS",
      email,
      name,
      type,
      daysLeft,
      amount,
      paymentUrl: hubUrl,
    }),
  });
}