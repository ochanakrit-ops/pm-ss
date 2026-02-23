import { q } from '@/lib/db';
import { requireRole } from '../../../_utils/guard';
import { ok, serverError } from '../../../_utils/http';

export const runtime = 'nodejs';

export async function GET() {
  const r = requireRole(['HR_ADMIN']);
  if ('res' in r) return r.res;
  try {
    const rows = await q<{
      id: number;
      full_name: string;
      desired_team: string | null;
      status: string;
      created_at: string;
      phone: string | null;
    }>(
      `select id, full_name, desired_team, status, created_at, phone
       from registrations
       where company_id=$1 and status='PENDING'
       order by created_at asc`,
      [r.user.companyId]
    );
    return ok({ items: rows });
  } catch (e) {
    return serverError(e);
  }
}
