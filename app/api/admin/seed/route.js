import fs from "fs";
import path from "path";
import { getPool } from "../../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const token = request.headers.get("x-admin-token") || "";
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  try {
    const pool = getPool();
    const sqlPath = path.join(process.cwd(), "sql", "002_seed.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await pool.query(sql);

    const c = await pool.query(`SELECT id FROM public.companies WHERE code='SCP' LIMIT 1`);
    if (c.rowCount === 0) return Response.json({ error: "COMPANY_SCP_NOT_FOUND" }, { status: 400 });
    const companyId = c.rows[0].id;

    const exist = await pool.query(`SELECT id FROM public.users WHERE company_id=$1 AND username='hradmin' LIMIT 1`, [companyId]);
    if (exist.rowCount === 0) {
      const hash = await bcrypt.hash("Pmss@1234", 10);
      await pool.query(
        `INSERT INTO public.users(company_id, team_id, username, password_hash, role, full_name, salary, is_active)
         VALUES($1,NULL,'hradmin',$2,'HR_ADMIN','HR Admin',0,true)`,
        [companyId, hash]
      );
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
