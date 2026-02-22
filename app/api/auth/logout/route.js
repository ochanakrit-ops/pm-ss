import { getCookieName } from "../../../../lib/auth";

export async function POST() {
  const headers = new Headers();
  const cookieName = getCookieName();
  headers.append("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
