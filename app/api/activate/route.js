import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();
    const { email, name, months, secret } = body;

    const secretValid =
      authHeader === `Bearer ${process.env.HUB_SECRET}` ||
      secret === process.env.HUB_SECRET;

    if (!secretValid) {
      return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
    }

    if (!email) {
      return Response.json({ success: false, error: "email required" }, { status: 400 });
    }

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (months || 12));
    const expiryISO = expiry.toISOString();

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
        message: "pre-activated",
        email,
      });
    }

    await db.execute({
      sql: "UPDATE users SET status = 'active', expiry_date = ?, reminder_sent = 0 WHERE email = ?",
      args: [expiryISO, email],
    });

    return Response.json({
      success: true,
      message: "activated",
      email,
      expiryDate: expiryISO,
    });
  } catch (e) {
    console.error("Activate error:", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}