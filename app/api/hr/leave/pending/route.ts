import { q } from '@/lib/db';
import { requireRole } from '../../../_utils/guard';
import { ok, serverError } from '../../../_utils/http';

export const runtime = 'nodejs';

export async function GET() {
  const r = requireRole(['HR_ADMIN']);
  if ('res' in r) return r.res;
  try {
    const items = await q(
      `select lr.id, lr.leave_type, lr.start_date, lr.end_date, lr.note, lr.status, lr.created_at,
              u.full_name as employee_name,
              t.name as team_name
       from leave_requests lr
       join users u on u.id=lr.employee_id
       join teams t on t.id=lr.team_id
       where lr.company_id=$1 and lr.status='WAIT_HR'
       order by lr.created_at asc`,
      [r.user.companyId]
    );
    return ok({ items });
  } catch (e) {
    return serverError(e);
  }
}
