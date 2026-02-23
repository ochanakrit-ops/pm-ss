import { q } from '@/lib/db';
import { requireRole } from '../../../_utils/guard';
import { ok, serverError } from '../../../_utils/http';

export const runtime = 'nodejs';

export async function GET() {
  const r = requireRole(['TEAM_LEADER']);
  if ('res' in r) return r.res;
  try {
    const team = await q<{ team_id: number | null }>('select team_id from users where id=$1', [r.user.uid]);
    const teamId = team[0]?.team_id;
    const items = await q(
      `select lr.id, lr.leave_type, lr.start_date, lr.end_date, lr.note, lr.status, lr.created_at,
              u.full_name as employee_name
       from leave_requests lr
       join users u on u.id=lr.employee_id
       where lr.company_id=$1 and lr.team_id=$2 and lr.status='WAIT_TL'
       order by lr.created_at asc`,
      [r.user.companyId, teamId]
    );
    return ok({ items });
  } catch (e) {
    return serverError(e);
  }
}
