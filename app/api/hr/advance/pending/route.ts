import { q } from '@/lib/db';
import { requireRole } from '../../../_utils/guard';
import { ok, serverError } from '../../../_utils/http';

export const runtime = 'nodejs';

export async function GET() {
  const r = requireRole(['HR_ADMIN']);
  if ('res' in r) return r.res;
  try {
    const items = await q(
      `select ar.id, ar.amount, ar.reason, ar.status, ar.created_at,
              u.full_name as employee_name,
              t.name as team_name
       from advance_requests ar
       join users u on u.id=ar.employee_id
       join teams t on t.id=ar.team_id
       where ar.company_id=$1 and ar.status='WAIT_HR'
       order by ar.created_at asc`,
      [r.user.companyId]
    );
    return ok({ items });
  } catch (e) {
    return serverError(e);
  }
}
