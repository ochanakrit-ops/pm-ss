import { getPool } from "../../../../lib/db";
import { loginSchema } from "../../../../lib/validators";
import { signToken, getCookieName } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const body = await request.json().catch(()=> ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "INVALID_INPUT" }, { status: 400 });

  const { companyId, username, password } = parsed.data;

  try {
    const pool = getPool();
    const r = await pool.query(
      `SELECT u.id, u.company_id, c.code AS company_code, u.username, u.password_hash, u.role, u.full_name, COALESCE(u.is_active,true) AS is_active
       FROM public.users u
       JOIN public.companies c ON c.id=u.company_id
       WHERE u.company_id=$1 AND u.username=$2
       LIMIT 1`,
      [companyId, username]
    );
    if (r.rowCount === 0) return Response.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    const u = r.rows[0];
    if (!u.is_active) return Response.json({ error: "USER_INACTIVE" }, { status: 403 });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return Response.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });

    const token = signToken({
      sub: u.id,
      companyId: u.company_id,
      companyCode: u.company_code,
      username: u.username,
      role: u.role,
      fullName: u.full_name,
    });

    const headers = new Headers();
    const cookieName = getCookieName();
    headers.append("Set-Cookie", `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*12}`);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
