import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  const body = await request.json();
  const { email, name, months, HUB_SECRET } = body;

  if (HUB_SECRET !== process.env.HUB_SECRET) {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  if (!email) {
    return Response.json({ success: false, error: "email required" }, { status: 400 });
  }

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (months || 12));

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email],
  });

  if (existing.rows.length === 0) {
    // user अभी login नहीं किया — pre_activations में रखो
    await db.execute({
      sql: "INSERT INTO pre_activations (email) VALUES (?) ON CONFLICT(email) DO NOTHING",
      args: [email],
    });
    return Response.json({
      success: true,
      pending: true,
      email,
      message: "Payment recorded. Activation will complete on first login.",
    });
  }

  // user पहले से login — सीधा activate
  await db.execute({
    sql: "UPDATE users SET status = 'active', expiry_date = ?, reminder_sent = 0 WHERE email = ?",
    args: [expiry.toISOString(), email],
  });

  return Response.json({
    success: true,
    email,
    expiryDate: expiry.toISOString(),
  });
}