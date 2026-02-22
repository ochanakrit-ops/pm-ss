import { requireAuth } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";

export async function GET(request) {
  const a = requireAuth(request);
  if (!a.ok) return Response.json({ error: a.error }, { status: a.status });

  try {
    const pool = getPool();
    const r = await pool.query(
      `SELECT u.id, u.username, u.role, u.full_name, c.code AS company_code
       FROM public.users u
       JOIN public.companies c ON c.id=u.company_id
       WHERE u.id=$1 LIMIT 1`,
      [a.user.sub]
    );
    if (r.rowCount === 0) return Response.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    const u = r.rows[0];
    return Response.json({ user: { id:u.id, username:u.username, role:u.role, fullName:u.full_name, companyCode:u.company_code } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
