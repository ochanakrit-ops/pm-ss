'use client';

import React from 'react';

export function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fn()
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e?.message || 'Error'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export function Pill({ status }: { status: string }) {
  const s = status.toUpperCase();
  let cls = 'pill';
  if (s.includes('WAIT') || s === 'PENDING') cls += ' pending';
  else if (s === 'APPROVED' || s === 'DONE') cls += ' approved';
  else if (s === 'REJECTED') cls += ' rejected';
  return <span className={cls}>{s}</span>;
}
