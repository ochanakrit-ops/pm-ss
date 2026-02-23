import { z } from 'zod';
import { q } from '@/lib/db';
import { bad, ok, serverError } from '../../_utils/http';

export const runtime = 'nodejs';

const Body = z.object({ companyCode: z.string().min(1), username: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const c = await q<{ id: number }>('select id from companies where code=$1', [body.companyCode]);
    if (!c[0]) return bad('Company not found', 404);

    await q(
      `insert into password_reset_requests(company_id, username, status)
       values($1, $2, 'WAIT_HR')`,
      [c[0].id, body.username]
    );

    return ok({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return bad('Invalid payload', 422);
    return serverError(e);
  }
}
