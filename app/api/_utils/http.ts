import { NextResponse } from 'next/server';

export function ok(data: any, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function serverError(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Internal error';
  return NextResponse.json({ error: msg }, { status: 500 });
}
