import jwt from "jsonwebtoken";

const COOKIE_NAME = "pmss_token";

export function getCookieName() {
  return COOKIE_NAME;
}

export function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, secret, { expiresIn: "12h" });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, secret);
}

export function getTokenFromRequest(request) {
  const c = request.cookies.get(COOKIE_NAME);
  return c?.value || null;
}

export function requireAuth(request) {
  const token = getTokenFromRequest(request);
  if (!token) return { ok: false, status: 401, error: "UNAUTHORIZED" };
  try {
    const user = verifyToken(token);
    return { ok: true, user };
  } catch {
    return { ok: false, status: 401, error: "UNAUTHORIZED" };
  }
}

export function requireRole(user, roles) {
  if (!user) return { ok: false, status: 401, error: "UNAUTHORIZED" };
  if (!roles.includes(user.role)) return { ok: false, status: 403, error: "FORBIDDEN" };
  return { ok: true };
}
