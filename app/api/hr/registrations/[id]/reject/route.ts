import { z } from 'zod';
import { q } from '@/lib/db';
import { requireRole } from '../../../../_utils/guard';
import { bad, ok, serverError } from '../../../../_utils/http';

export const runtime = 'nodejs';

const Body = z.object({ rejectReason: z.string().min(1).max(500) });

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const r = requireRole(['HR_ADMIN']);
  if ('res' in r) return r.res;
  const id = Number(ctx.params.id);
  if (!Number.isFinite(id)) return bad('Invalid id', 400);

  try {
    const body = Body.parse(await req.json());
    const rows = await q(
      `update registrations
       set status='REJECTED', reviewed_by=$1, reviewed_at=now(), reject_reason=$2
       where id=$3 and company_id=$4 and status='PENDING'
       returning id`,
      [r.user.uid, body.rejectReason, id, r.user.companyId]
    );

    if (!rows[0]) return bad('Not found or already processed', 404);
    return ok({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return bad('Invalid payload', 422);
    return serverError(e);
  }
}
