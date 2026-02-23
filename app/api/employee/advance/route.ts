import { z } from 'zod';
import { q } from '@/lib/db';
import { requireRole } from '../../_utils/guard';
import { bad, ok, serverError } from '../../_utils/http';

export const runtime = 'nodejs';

const Body = z.object({ amount: z.number().int().positive(), reason: z.string().min(3).max(500) });

export async function POST(req: Request) {
  const r = requireRole(['TECHNICIAN', 'TEAM_LEADER']);
  if ('res' in r) return r.res;
  try {
    const body = Body.parse(await req.json());
    const u = await q<{ team_id: number | null }>('select team_id from users where id=$1 and company_id=$2', [
      r.user.uid,
      r.user.companyId,
    ]);
    const teamId = u[0]?.team_id;
    if (!teamId) return bad('User has no team', 400);

    const rows = await q(
      `insert into advance_requests(company_id, employee_id, team_id, amount, reason, status)
       values($1,$2,$3,$4,$5,'WAIT_TL')
       returning id`,
      [r.user.companyId, r.user.uid, teamId, body.amount, body.reason]
    );

    return ok({ ok: true, id: (rows[0] as any).id });
  } catch (e) {
    if (e instanceof z.ZodError) return bad('Invalid payload', 422);
    return serverError(e);
  }
}
