'use client';

import React from 'react';
import { Nav } from '../_components/Nav';
import { api, useAsync } from '../_components/client';

export default function LoginPage() {
  const { data: companies, error } = useAsync(async () => api<any[]>('/api/companies'), []);
  const [companyCode, setCompanyCode] = React.useState('');
  const [username, setUsername] = React.useState('hradmin');
  const [password, setPassword] = React.useState('Pmss@1234');
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!companyCode && companies?.[0]?.code) setCompanyCode(companies[0].code);
  }, [companies, companyCode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ companyCode, username, password }),
      });
      window.location.href = '/dashboard';
    } catch (e: any) {
      setErr(e?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <Nav />
      <div className="card">
        <div className="h1">Login</div>
        <div className="muted">Production MVP • Render + Supabase • Multi-company</div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <div className="label">Company</div>
            <select value={companyCode} onChange={(e) => setCompanyCode(e.target.value)}>
              {(companies || []).map((c: any) => (
                <option key={c.code} value={c.code}>
                  {c.display}
                </option>
              ))}
            </select>
            {error ? <div className="alert">Load companies error: {String(error)}</div> : null}
          </div>

          <div className="field">
            <div className="label">Username</div>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="field">
            <div className="label">Password</div>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {err ? <div className="alert">{err}</div> : null}

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" disabled={busy} type="submit">
              {busy ? 'Logging in…' : 'Login'}
            </button>
            <a className="btn" href="/register">Register (MVP)</a>
            <a className="btn" href="/forgot">Password reset (MVP)</a>
          </div>
        </form>
      </div>

      <div className="footer">PM-SS MobilePro v1.6 • Secure cookie JWT • Node runtime API</div>
    </div>
  );
}
