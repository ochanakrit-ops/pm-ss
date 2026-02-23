'use client';

import React from 'react';
import { Nav } from '../_components/Nav';
import { api, useAsync } from '../_components/client';

export default function RegisterPage() {
  const { data: companies } = useAsync(async () => api<any[]>('/api/companies'), []);
  const [companyCode, setCompanyCode] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [desiredTeam, setDesiredTeam] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [idCardLast4, setIdCardLast4] = React.useState('');
  const [note, setNote] = React.useState('');
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
      const res = await api<{ id: number }>('/api/public/register', {
        method: 'POST',
        body: JSON.stringify({ companyCode, fullName, desiredTeam, phone, idCardLast4, note }),
      });
      setMsg(`Submitted. Request ID: ${res.id}`);
      setFullName('');
      setDesiredTeam('');
      setPhone('');
      setIdCardLast4('');
      setNote('');
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    }
  }

  return (
    <div className="container">
      <Nav />
      <div className="card">
        <div className="h1">Register</div>
        <div className="muted">Send registration request to HR (MVP)</div>

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
            <div className="label">Full name</div>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="grid">
            <div className="field">
              <div className="label">Desired team</div>
              <input className="input" value={desiredTeam} onChange={(e) => setDesiredTeam(e.target.value)} />
            </div>
            <div className="field">
              <div className="label">Phone</div>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid">
            <div className="field">
              <div className="label">ID card last 4</div>
              <input className="input" value={idCardLast4} onChange={(e) => setIdCardLast4(e.target.value)} />
            </div>
            <div className="field">
              <div className="label">Note</div>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
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
