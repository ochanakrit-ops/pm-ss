import fs from "fs";
import path from "path";
import { getPool } from "../../../../lib/db";

export async function POST(request) {
  const token = request.headers.get("x-admin-token") || "";
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  try {
    const pool = getPool();
    const sqlPath = path.join(process.cwd(), "sql", "001_mvp_tables.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
