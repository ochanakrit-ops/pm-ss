import { z } from 'zod';
import { q } from '@/lib/db';
import { bad, ok, serverError } from '../../_utils/http';

export const runtime = 'nodejs';

const Body = z.object({
  companyCode: z.string().min(1),
  fullName: z.string().min(2).max(200),
  desiredTeam: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  idCardLast4: z.string().max(10).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const c = await q<{ id: number }>('select id from companies where code=$1', [body.companyCode]);
    if (!c[0]) return bad('Company not found', 404);

    const rows = await q(
      `insert into registrations(company_id, desired_team, full_name, phone, id_card_last4, note, status)
       values($1,$2,$3,$4,$5,$6,'PENDING')
       returning id`,
      [c[0].id, body.desiredTeam || null, body.fullName, body.phone || null, body.idCardLast4 || null, body.note || null]
    );

    return ok({ ok: true, id: (rows[0] as any).id });
  } catch (e) {
    if (e instanceof z.ZodError) return bad('Invalid payload', 422);
    return serverError(e);
  }
}
