import { q } from '@/lib/db';
import { requireRole } from '../../../../_utils/guard';
import { bad, ok, serverError } from '../../../../_utils/http';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const r = requireRole(['HR_ADMIN']);
  if ('res' in r) return r.res;
  const id = Number(ctx.params.id);
  if (!Number.isFinite(id)) return bad('Invalid id', 400);

  try {
    const rows = await q(
      `update advance_requests
       set status='APPROVED', hr_approved_by=$1, hr_approved_at=now(), updated_at=now()
       where id=$2 and company_id=$3 and status='WAIT_HR'
       returning id`,
      [r.user.uid, id, r.user.companyId]
    );
    if (!rows[0]) return bad('Not found or already processed', 404);
    return ok({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
