import { q } from '@/lib/db';
import { requireRole } from '../../../../_utils/guard';
import { bad, ok, serverError } from '../../../../_utils/http';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const r = requireRole(['TEAM_LEADER']);
  if ('res' in r) return r.res;
  const id = Number(ctx.params.id);
  if (!Number.isFinite(id)) return bad('Invalid id', 400);

  try {
    const team = await q<{ team_id: number | null }>('select team_id from users where id=$1', [r.user.uid]);
    const teamId = team[0]?.team_id;
    const rows = await q(
      `update leave_requests
       set status='WAIT_HR', tl_approved_by=$1, tl_approved_at=now(), updated_at=now()
       where id=$2 and company_id=$3 and team_id=$4 and status='WAIT_TL'
       returning id`,
      [r.user.uid, id, r.user.companyId, teamId]
    );
    if (!rows[0]) return bad('Not found or already processed', 404);
    return ok({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
