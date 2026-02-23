import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import { bad, ok, serverError } from '../../_utils/http';

export const runtime = 'nodejs';

const Body = z.object({
  companyCode: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = Body.parse(json);

    const companies = await q<{ id: number }>('select id from companies where code=$1', [body.companyCode]);
    if (!companies[0]) return bad('Company not found', 404);
    const companyId = companies[0].id;

    const users = await q<{
      id: number;
      username: string;
      password_hash: string;
      role: 'HR_ADMIN' | 'TEAM_LEADER' | 'TECHNICIAN';
      full_name: string;
      is_active: boolean | null;
    }>(
      'select id, username, password_hash, role, full_name, is_active from users where company_id=$1 and username=$2 limit 1',
      [companyId, body.username]
    );

    const u = users[0];
    if (!u) return bad('Invalid credentials', 401);
    if (u.is_active === false) return bad('User is inactive', 403);

    const ph = u.password_hash || '';
    let okPass = false;
    if (ph.startsWith('$2')) {
      okPass = await bcrypt.compare(body.password, ph);
    } else {
      okPass = body.password === ph;
    }

    if (!okPass) return bad('Invalid credentials', 401);

    const token = signToken({
      uid: u.id,
      companyId,
      role: u.role,
      username: u.username,
      fullName: u.full_name,
    });

    setAuthCookie(token);
    return ok({
      user: { id: u.id, role: u.role, username: u.username, fullName: u.full_name, companyId },
    });
  } catch (e) {
    if (e instanceof z.ZodError) return bad('Invalid payload', 422);
    return serverError(e);
  }
}
