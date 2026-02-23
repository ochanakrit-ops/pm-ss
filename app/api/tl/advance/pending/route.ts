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
      `select ar.id, ar.amount, ar.reason, ar.status, ar.created_at,
              u.full_name as employee_name
       from advance_requests ar
       join users u on u.id=ar.employee_id
       where ar.company_id=$1 and ar.team_id=$2 and ar.status='WAIT_TL'
       order by ar.created_at asc`,
      [r.user.companyId, teamId]
    );
    return ok({ items });
  } catch (e) {
    return serverError(e);
  }
}
