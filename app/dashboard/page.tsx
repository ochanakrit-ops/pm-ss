'use client';

import React from 'react';
import { Nav } from '../_components/Nav';
import { api, Pill, useAsync } from '../_components/client';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="h2">{title}</div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const me = useAsync(async () => api<{ user: any; company: any }>('/api/auth/me'), []);
  const role = me.data?.user?.role as string | undefined;

  const reg = useAsync(async () => (role === 'HR_ADMIN' ? api<any>('/api/hr/registrations/pending') : null), [role]);
  const hrAdv = useAsync(async () => (role === 'HR_ADMIN' ? api<any>('/api/hr/advance/pending') : null), [role]);
  const hrLeave = useAsync(async () => (role === 'HR_ADMIN' ? api<any>('/api/hr/leave/pending') : null), [role]);
  const pwd = useAsync(async () => (role === 'HR_ADMIN' ? api<any>('/api/hr/password-reset') : null), [role]);

  const tlAdv = useAsync(async () => (role === 'TEAM_LEADER' ? api<any>('/api/tl/advance/pending') : null), [role]);
  const tlLeave = useAsync(async () => (role === 'TEAM_LEADER' ? api<any>('/api/tl/leave/pending') : null), [role]);

  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function act(fn: () => Promise<any>) {
    setMsg(null);
    setErr(null);
    try {
      await fn();
      setMsg('Done');
      // refresh
      reg.data && reg.loading === false && reg.data && reg.data.items && reg.data.items.length >= 0 && reg.data;
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    }
  }

  if (me.loading) {
    return (
      <div className="container">
        <Nav />
        <div className="card">Loading…</div>
      </div>
    );
  }

  if (me.error || !me.data?.user) {
    return (
      <div className="container">
        <Nav />
        <div className="alert">Unauthorized. Please login again.</div>
        <a className="btn" href="/login">Go to login</a>
      </div>
    );
  }

  const user = me.data.user;
  const company = me.data.company;

  return (
    <div className="container">
      <Nav />

      <div className="card">
        <div className="h1">Dashboard</div>
        <div className="muted">
          Welcome: <b>{user.fullName}</b> • {company?.display || ''} • <span className="pill">{user.role}</span>
        </div>
        {msg ? <div className="card">✅ {msg}</div> : null}
        {err ? <div className="alert">{err}</div> : null}
      </div>

      {role === 'HR_ADMIN' ? (
        <>
          <Section title="Pending registrations">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full name</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(reg.data?.items || []).map((it: any) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.full_name}</td>
                    <td>{it.desired_team || '-'}</td>
                    <td><Pill status={it.status} /></td>
                    <td className="row">
                      <button className="btn" onClick={() => act(() => api(`/api/hr/registrations/${it.id}/approve`, { method: 'POST', body: '{}' }))}>Approve</button>
                      <button className="btn" onClick={() => {
                        const reason = prompt('Reject reason?') || '';
                        if (!reason) return;
                        return act(() => api(`/api/hr/registrations/${it.id}/reject`, { method: 'POST', body: JSON.stringify({ rejectReason: reason }) }));
                      }}>Reject</button>
                    </td>
                  </tr>
                ))}
                {(reg.data?.items || []).length === 0 ? (
                  <tr><td colSpan={5} className="muted">No data</td></tr>
                ) : null}
              </tbody>
            </table>
          </Section>

          <div className="grid">
            <Section title="Advance pending (WAIT_HR)">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th><th>Employee</th><th>Team</th><th>Amount</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(hrAdv.data?.items || []).map((it: any) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>{it.employee_name}</td>
                      <td>{it.team_name}</td>
                      <td>{it.amount}</td>
                      <td><Pill status={it.status} /></td>
                      <td className="row">
                        <button className="btn" onClick={() => act(() => api(`/api/hr/advance/${it.id}/approve`, { method: 'POST', body: '{}' }))}>Approve</button>
                        <button className="btn" onClick={() => {
                          const reason = prompt('Reject reason?') || '';
                          if (!reason) return;
                          return act(() => api(`/api/hr/advance/${it.id}/reject`, { method: 'POST', body: JSON.stringify({ rejectReason: reason }) }));
                        }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                  {(hrAdv.data?.items || []).length === 0 ? (
                    <tr><td colSpan={6} className="muted">No data</td></tr>
                  ) : null}
                </tbody>
              </table>
            </Section>

            <Section title="Leave pending (WAIT_HR)">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th><th>Employee</th><th>Team</th><th>Type</th><th>Period</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(hrLeave.data?.items || []).map((it: any) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>{it.employee_name}</td>
                      <td>{it.team_name}</td>
                      <td>{it.leave_type}</td>
                      <td>{String(it.start_date)} → {String(it.end_date)}</td>
                      <td><Pill status={it.status} /></td>
                      <td className="row">
                        <button className="btn" onClick={() => act(() => api(`/api/hr/leave/${it.id}/approve`, { method: 'POST', body: '{}' }))}>Approve</button>
                        <button className="btn" onClick={() => {
                          const reason = prompt('Reject reason?') || '';
                          if (!reason) return;
                          return act(() => api(`/api/hr/leave/${it.id}/reject`, { method: 'POST', body: JSON.stringify({ rejectReason: reason }) }));
                        }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                  {(hrLeave.data?.items || []).length === 0 ? (
                    <tr><td colSpan={7} className="muted">No data</td></tr>
                  ) : null}
                </tbody>
              </table>
            </Section>
          </div>

          <Section title="Password reset requests (WAIT_HR)">
            <table className="table">
              <thead>
                <tr><th>ID</th><th>Username</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {(pwd.data?.items || []).map((it: any) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.username}</td>
                    <td><Pill status={it.status} /></td>
                    <td>
                      <button className="btn" onClick={() => act(() => api('/api/hr/password-reset', { method: 'POST', body: JSON.stringify({ id: it.id }) }))}>Mark done</button>
                    </td>
                  </tr>
                ))}
                {(pwd.data?.items || []).length === 0 ? (
                  <tr><td colSpan={4} className="muted">No data</td></tr>
                ) : null}
              </tbody>
            </table>
          </Section>
        </>
      ) : null}

      {role === 'TEAM_LEADER' ? (
        <div className="grid">
          <Section title="Advance pending (WAIT_TL)">
            <table className="table">
              <thead>
                <tr><th>ID</th><th>Employee</th><th>Amount</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {(tlAdv.data?.items || []).map((it: any) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.employee_name}</td>
                    <td>{it.amount}</td>
                    <td><Pill status={it.status} /></td>
                    <td className="row">
                      <button className="btn" onClick={() => act(() => api(`/api/tl/advance/${it.id}/approve`, { method: 'POST', body: '{}' }))}>Approve</button>
                      <button className="btn" onClick={() => {
                        const reason = prompt('Reject reason?') || '';
                        if (!reason) return;
                        return act(() => api(`/api/tl/advance/${it.id}/reject`, { method: 'POST', body: JSON.stringify({ rejectReason: reason }) }));
                      }}>Reject</button>
                    </td>
                  </tr>
                ))}
                {(tlAdv.data?.items || []).length === 0 ? (
                  <tr><td colSpan={5} className="muted">No data</td></tr>
                ) : null}
              </tbody>
            </table>
          </Section>

          <Section title="Leave pending (WAIT_TL)">
            <table className="table">
              <thead>
                <tr><th>ID</th><th>Employee</th><th>Type</th><th>Period</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {(tlLeave.data?.items || []).map((it: any) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.employee_name}</td>
                    <td>{it.leave_type}</td>
                    <td>{String(it.start_date)} → {String(it.end_date)}</td>
                    <td><Pill status={it.status} /></td>
                    <td className="row">
                      <button className="btn" onClick={() => act(() => api(`/api/tl/leave/${it.id}/approve`, { method: 'POST', body: '{}' }))}>Approve</button>
                      <button className="btn" onClick={() => {
                        const reason = prompt('Reject reason?') || '';
                        if (!reason) return;
                        return act(() => api(`/api/tl/leave/${it.id}/reject`, { method: 'POST', body: JSON.stringify({ rejectReason: reason }) }));
                      }}>Reject</button>
                    </td>
                  </tr>
                ))}
                {(tlLeave.data?.items || []).length === 0 ? (
                  <tr><td colSpan={6} className="muted">No data</td></tr>
                ) : null}
              </tbody>
            </table>
          </Section>
        </div>
      ) : null}

      {role === 'TECHNICIAN' ? (
        <div className="grid">
          <EmployeeAdvance />
          <EmployeeLeave />
        </div>
      ) : null}

      <div className="footer">PM-SS MobilePro v1.6 • Theme: Blue/Green Minimal</div>
    </div>
  );
}

function EmployeeAdvance() {
  const [amount, setAmount] = React.useState(1000);
  const [reason, setReason] = React.useState('Advance request');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      const res = await api<{ id: number }>('/api/employee/advance', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), reason }),
      });
      setMsg(`Submitted. ID: ${res.id}`);
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    }
  }

  return (
    <Section title="Request advance">
      <form onSubmit={submit}>
        <div className="field">
          <div className="label">Amount</div>
          <input className="input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div className="field">
          <div className="label">Reason</div>
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        {msg ? <div className="card">✅ {msg}</div> : null}
        {err ? <div className="alert">{err}</div> : null}
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn primary" type="submit">Submit</button>
        </div>
      </form>
    </Section>
  );
}

function EmployeeLeave() {
  const [leaveType, setLeaveType] = React.useState<'SICK' | 'PERSONAL' | 'VACATION'>('SICK');
  const [startDate, setStartDate] = React.useState('2026-02-22');
  const [endDate, setEndDate] = React.useState('2026-02-22');
  const [note, setNote] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      const res = await api<{ id: number }>('/api/employee/leave', {
        method: 'POST',
        body: JSON.stringify({ leaveType, startDate, endDate, note }),
      });
      setMsg(`Submitted. ID: ${res.id}`);
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    }
  }

  return (
    <Section title="Request leave">
      <form onSubmit={submit}>
        <div className="field">
          <div className="label">Leave type</div>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as any)}>
            <option value="SICK">SICK</option>
            <option value="PERSONAL">PERSONAL</option>
            <option value="VACATION">VACATION</option>
          </select>
        </div>
        <div className="grid">
          <div className="field">
            <div className="label">Start date</div>
            <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <div className="label">End date</div>
            <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <div className="label">Note</div>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {msg ? <div className="card">✅ {msg}</div> : null}
        {err ? <div className="alert">{err}</div> : null}
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn primary" type="submit">Submit</button>
        </div>
      </form>
    </Section>
  );
}
