import { getAuthUser, JwtUser } from '@/lib/auth';
import { bad } from './http';

export function requireAuth(): { user: JwtUser } | { res: Response } {
  const user = getAuthUser();
  if (!user) return { res: bad('Unauthorized', 401) };
  return { user };
}

export function requireRole(roles: JwtUser['role'][]): { user: JwtUser } | { res: Response } {
  const r = requireAuth();
  if ('res' in r) return r;
  if (!roles.includes(r.user.role)) return { res: bad('Forbidden', 403) };
  return r;
}
