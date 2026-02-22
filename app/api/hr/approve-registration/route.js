import { requireAuth, requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { approveRegSchema } from "../../../../lib/validators";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const a = requireAuth(request);
  if (!a.ok) return Response.json({ error: a.error }, { status: a.status });
  const rr = requireRole(a.user, ["HR_ADMIN"]);
  if (!rr.ok) return Response.json({ error: rr.error }, { status: rr.status });

  const body = await request.json().catch(()=> ({}));
  const parsed = approveRegSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  const d = parsed.data;

  try {
    const pool = getPool();

    const reg = await pool.query(
      `SELECT * FROM public.registration_requests WHERE id=$1 AND company_id=$2 LIMIT 1`,
      [d.registrationId, a.user.companyId]
    );
    if (reg.rowCount === 0) return Response.json({ error: "REG_NOT_FOUND" }, { status: 404 });
    if (reg.rows[0].status !== "PENDING") return Response.json({ error: "REG_NOT_PENDING" }, { status: 409 });

    let teamId = d.teamId || null;
    if (!teamId && d.teamName) {
      const t = await pool.query(
        `INSERT INTO public.teams(company_id, name) VALUES($1,$2) RETURNING id`,
        [a.user.companyId, d.teamName]
      );
      teamId = t.rows[0].id;
    }

    const hash = await bcrypt.hash(d.password, 10);

    const u = await pool.query(
      `INSERT INTO public.users(company_id, team_id, username, password_hash, role, full_name, salary, is_active)
       VALUES($1,$2,$3,$4,$5,$6,$7,true)
       RETURNING id, username, role`,
      [a.user.companyId, teamId, d.username, hash, d.role, d.fullName, d.salary || 0]
    );

    await pool.query(
      `UPDATE public.registration_requests SET status='APPROVED', hr_note=$1 WHERE id=$2`,
      ["Approved", d.registrationId]
    );

    return Response.json({ ok: true, user: u.rows[0] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
