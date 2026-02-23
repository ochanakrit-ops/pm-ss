import { q } from '@/lib/db';
import { ok, serverError } from '../_utils/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const rows = await q<{ id: number; code: string; name: string; name_th: string | null; name_en: string | null }>(
      'select id, code, name, name_th, name_en from companies order by id asc'
    );

    return ok(
      rows.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        display: `${r.code} - ${r.name_th || r.name_en || r.name}`,
      }))
    );
  } catch (e) {
    return serverError(e);
  }
}
