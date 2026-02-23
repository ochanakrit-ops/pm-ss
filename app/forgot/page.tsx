'use client';

import React from 'react';
import { Nav } from '../_components/Nav';
import { api, useAsync } from '../_components/client';

export default function ForgotPage() {
  const { data: companies } = useAsync(async () => api<any[]>('/api/companies'), []);
  const [companyCode, setCompanyCode] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyCode && companies?.[0]?.code) setCompanyCode(companies[0].code);
  }, [companies, companyCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      await api('/api/public/password-reset', {
        method: 'POST',
        body: JSON.stringify({ companyCode, username }),
      });
      setMsg('Submitted. HR will reset your password (MVP).');
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    }
  }

  return (
    <div className="container">
      <Nav />
      <div className="card">
        <div className="h1">Password reset</div>
        <div className="muted">Send request to HR (MVP)</div>

        <form onSubmit={submit}>
          <div className="field">
            <div className="label">Company</div>
            <select value={companyCode} onChange={(e) => setCompanyCode(e.target.value)}>
              {(companies || []).map((c: any) => (
                <option key={c.code} value={c.code}>
                  {c.display}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="label">Username</div>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          {msg ? <div className="card">✅ {msg}</div> : null}
          {err ? <div className="alert">{err}</div> : null}

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" type="submit">Submit</button>
            <a className="btn" href="/login">Back</a>
          </div>
        </form>
      </div>
    </div>
  );
}
