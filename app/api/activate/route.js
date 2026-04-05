import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  const body = await request.json();
  const { email, name, months, secret } = body;

  if (secret !== process.env.ACTIVATION_SECRET) {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  if (!email) return Response.json({ success: false, error: "email required" }, { status: 400 });

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (months || 12));

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email],
  });

  if (existing.rows.length === 0) {
    await db.execute({
      sql: "INSERT INTO users (email, name, status, expiry_date, reminder_sent) VALUES (?, ?, 'active', ?, 0)",
      args: [email, name || "", expiry.toISOString()],
    });
  } else {
    await db.execute({
      sql: "UPDATE users SET status = 'active', expiry_date = ?, reminder_sent = 0 WHERE email = ?",
      args: [expiry.toISOString(), email],
    });
  }

  return Response.json({ success: true, email, expiryDate: expiry.toISOString() });
}