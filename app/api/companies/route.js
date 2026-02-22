import { getPool } from "../../../lib/db";

export async function GET() {
  try {
    const pool = getPool();
    const r = await pool.query(`SELECT id, code, name, name_th, name_en FROM public.companies ORDER BY code`);
    return Response.json(r.rows);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
