import { requireAuth, requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";

export async function GET(request) {
  const a = requireAuth(request);
  if (!a.ok) return Response.json({ error: a.error }, { status: a.status });
  const rr = requireRole(a.user, ["HR_ADMIN"]);
  if (!rr.ok) return Response.json({ error: rr.error }, { status: rr.status });

  try {
    const pool = getPool();
    const r = await pool.query(
      `SELECT id, full_name, desired_role, team_name, salary_monthly, status, created_at
       FROM public.registration_requests
       WHERE company_id=$1 AND status='PENDING'
       ORDER BY created_at DESC
       LIMIT 200`,
      [a.user.companyId]
    );
    return Response.json(r.rows);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
