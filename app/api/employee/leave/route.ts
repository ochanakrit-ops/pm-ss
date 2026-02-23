import { z } from 'zod';
import { q } from '@/lib/db';
import { requireRole } from '../../_utils/guard';
import { bad, ok, serverError } from '../../_utils/http';

export const runtime = 'nodejs';

const Body = z.object({
  leaveType: z.enum(['SICK', 'PERSONAL', 'VACATION']),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  note: z.string().max(500).optional(),
});

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
      `insert into leave_requests(company_id, employee_id, team_id, leave_type, start_date, end_date, note, status)
       values($1,$2,$3,$4,$5,$6,$7,'WAIT_TL')
       returning id`,
      [r.user.companyId, r.user.uid, teamId, body.leaveType, body.startDate, body.endDate, body.note || null]
    );

    return ok({ ok: true, id: (rows[0] as any).id });
  } catch (e) {
    if (e instanceof z.ZodError) return bad('Invalid payload', 422);
    return serverError(e);
  }
}
