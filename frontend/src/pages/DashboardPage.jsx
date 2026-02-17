import React, { useEffect, useState } from 'react';
import { t } from '../i18n.js';
import { apiFetch } from '../api.js';

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ margin: '0 0 10px' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardPage({ lang, me, onRequireLogin }) {
  const [regRequests, setRegRequests] = useState([]);
  const [pending, setPending] = useState({ advance: [], leave: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!me) {
      onRequireLogin?.();
      return;
    }
    if (me.role !== 'HR_ADMIN') return;

    (async () => {
      try {
        const [regs, pend] = await Promise.all([
          apiFetch('/api/admin/registration-requests'),
          apiFetch('/api/hr/pending').catch(() => ({ advance: [], leave: [] })),
        ]);
        setRegRequests(regs);
        setPending(pend || { advance: [], leave: [] });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [me]);

  async function decide(type, id, decision) {
    try {
      if (type === 'advance') await apiFetch(`/api/hr/advance-requests/${id}/decision`, { method:'POST', body: JSON.stringify({ decision }) });
      if (type === 'leave') await apiFetch(`/api/hr/leave-requests/${id}/decision`, { method:'POST', body: JSON.stringify({ decision }) });
      const pend = await apiFetch('/api/hr/pending').catch(() => ({ advance: [], leave: [] }));
      setPending(pend || { advance: [], leave: [] });
    } catch (e) {
      setError(e.message);
    }
  }

  if (!me) return <div className="muted" style={{ paddingTop: 24 }}>Redirecting to login...</div>;

  return (
    <div style={{ paddingTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>{t(lang, 'dashboard')}</h2>

      <div className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
        <div>
          <div style={{ fontWeight:800 }}>{t(lang,'welcome')}: {me.fullName}</div>
          <div className="muted" style={{ marginTop:4 }}>{me.companyCode} • {me.role}</div>
        </div>
        <div className="badge">{me.role}</div>
      </div>

      {error ? <div className="alert error" style={{ marginTop: 12 }}>{error}</div> : null}

      {me.role === 'HR_ADMIN' ? (
        <>
          <Section title={t(lang,'pendingRegs')}>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 16, background:'#fff' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead style={{ background:'#F3F4F6' }}>
                  <tr>
                    <th style={{ textAlign:'left', padding:10 }}>ID</th>
                    <th style={{ textAlign:'left', padding:10 }}>{t(lang,'fullName')}</th>
                    <th style={{ textAlign:'left', padding:10 }}>{t(lang,'role')}</th>
                    <th style={{ textAlign:'left', padding:10 }}>Team</th>
                    <th style={{ textAlign:'left', padding:10 }}>{t(lang,'status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {regRequests.map((r) => (
                    <tr key={r.id} style={{ borderTop:'1px solid var(--border)' }}>
                      <td style={{ padding:10 }}>{r.id}</td>
                      <td style={{ padding:10 }}>{r.fullName}</td>
                      <td style={{ padding:10 }}>{r.desiredRole}</td>
                      <td style={{ padding:10 }}>{r.teamName || '-'}</td>
                      <td style={{ padding:10 }}>{r.status}</td>
                    </tr>
                  ))}
                  {!regRequests.length ? (
                    <tr><td colSpan="5" style={{ padding:12 }} className="muted">{t(lang,'noData')}</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              * MVP: หน้านี้แสดงรายการคำขอลงทะเบียน เพื่อให้ HR นำไปสร้าง user ต่อ
            </div>
          </Section>

          <Section title="Pending: Advance / Leave (v1.2)">
            <div className="grid">
              <div className="card">
                <div style={{ fontWeight:800, marginBottom:10 }}>Advance</div>
                {pending.advance?.length ? pending.advance.map((x) => (
                  <div key={`a-${x.id}`} style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:10 }}>
                    <div><b>#{x.id}</b> • Emp {x.employee_id} • ฿{x.amount}</div>
                    <div className="muted" style={{ marginTop:4 }}>{x.reason || '-'}</div>
                    <div style={{ display:'flex', gap:10, marginTop:10 }}>
                      <button className="pill primary" onClick={() => decide('advance', x.id, 'APPROVE')}>Approve</button>
                      <button className="pill danger" onClick={() => decide('advance', x.id, 'REJECT')}>Reject</button>
                    </div>
                  </div>
                )) : <div className="muted">{t(lang,'noData')}</div>}
              </div>

              <div className="card">
                <div style={{ fontWeight:800, marginBottom:10 }}>Leave</div>
                {pending.leave?.length ? pending.leave.map((x) => (
                  <div key={`l-${x.id}`} style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:10 }}>
                    <div><b>#{x.id}</b> • Emp {x.employee_id} • {x.leave_type}</div>
                    <div className="muted" style={{ marginTop:4 }}>{x.start_date} → {x.end_date}</div>
                    <div className="muted" style={{ marginTop:4 }}>{x.reason || '-'}</div>
                    <div style={{ display:'flex', gap:10, marginTop:10 }}>
                      <button className="pill primary" onClick={() => decide('leave', x.id, 'APPROVE')}>Approve</button>
                      <button className="pill danger" onClick={() => decide('leave', x.id, 'REJECT')}>Reject</button>
                    </div>
                  </div>
                )) : <div className="muted">{t(lang,'noData')}</div>}
              </div>
            </div>
          </Section>
        </>
      ) : (
        <div style={{ marginTop: 16 }} className="muted">
          Mobile Pro (ช่าง/หัวหน้าทีม) ใช้เมนูด้านล่างสำหรับ Flow ขอเบิก / ขอลา
        </div>
      )}
    </div>
  );
}