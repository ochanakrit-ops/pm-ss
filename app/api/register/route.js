import { getPool } from "../../../lib/db";
import { registerSchema } from "../../../lib/validators";

export async function POST(request) {
  const body = await request.json().catch(()=> ({}));
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "INVALID_INPUT" }, { status: 400 });

  const d = parsed.data;
  try {
    const pool = getPool();
    const r = await pool.query(
      `INSERT INTO public.registration_requests(company_id, full_name, phone, email, desired_role, team_name, salary_monthly, status)
       VALUES($1,$2,$3,$4,$5,$6,$7,'PENDING')
       RETURNING id, status, created_at`,
      [d.companyId, d.fullName, d.phone, d.email || null, d.desiredRole, d.teamName || null, d.salaryMonthly || 0]
    );
    return Response.json(r.rows[0], { status: 200 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
