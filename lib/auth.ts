import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { env } from './env';

export type JwtUser = {
  uid: number;
  companyId: number;
  role: 'HR_ADMIN' | 'TEAM_LEADER' | 'TECHNICIAN';
  username: string;
  fullName: string;
};

const COOKIE_NAME = 'pmss_token';

export function signToken(payload: JwtUser) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '12h' });
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });
}

export function getAuthUser(): JwtUser | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtUser;
  } catch {
    return null;
  }
}
