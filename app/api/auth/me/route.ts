import { q } from '@/lib/db';
import { requireAuth } from '../../_utils/guard';
import { ok, serverError } from '../../_utils/http';

export const runtime = 'nodejs';

export async function GET() {
  const r = requireAuth();
  if ('res' in r) return r.res;
  try {
    const company = await q<{ code: string; name: string; name_th: string | null; name_en: string | null }>(
      'select code, name, name_th, name_en from companies where id=$1',
      [r.user.companyId]
    );
    return ok({
      user: r.user,
      company: company[0] ? { ...company[0], display: `${company[0].code} - ${company[0].name_th || company[0].name_en || company[0].name}` } : null,
    });
  } catch (e) {
    return serverError(e);
  }
}
