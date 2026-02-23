import { clearAuthCookie } from '@/lib/auth';
import { ok } from '../../_utils/http';

export const runtime = 'nodejs';

export async function POST() {
  clearAuthCookie();
  return ok({ ok: true });
}
