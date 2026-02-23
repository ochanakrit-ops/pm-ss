import { z } from 'zod';
import { q } from '@/lib/db';
import { requireRole } from '../../_utils/guard';
import { bad, ok, serverError } from '../../_utils/http';

export const runtime = 'nodejs';

export async function GET() {
  const r = requireRole(['HR_ADMIN']);
  if ('res' in r) return r.res;
  try {
    const items = await q(
      `select id, company_id, username, status, created_at, hr_done_by, hr_done_at
       from password_reset_requests
       where company_id=$1 and status='WAIT_HR'
       order by created_at asc`,
      [r.user.companyId]
    );
    return ok({ items });
  } catch (e) {
    return serverError(e);
  }
}

const DoneBody = z.object({ id: z.number().int().positive() });

export async function POST(req: Request) {
  const r = requireRole(['HR_ADMIN']);
  if ('res' in r) return r.res;

  try {
    const body = DoneBody.parse(await req.json());
    const rows = await q(
      `update password_reset_requests
       set status='DONE', hr_done_by=$1, hr_done_at=now()
       where id=$2 and company_id=$3 and status='WAIT_HR'
       returning id`,
      [r.user.uid, body.id, r.user.companyId]
    );
    if (!rows[0]) return bad('Not found or already processed', 404);
    return ok({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return bad('Invalid payload', 422);
    return serverError(e);
  }
}
