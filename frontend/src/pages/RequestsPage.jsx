import React, { useEffect, useState } from 'react';
import { t } from '../i18n.js';
import { apiFetch } from '../api.js';

export default function RequestsPage({ lang }) {
  const [leaveType, setLeaveType] = useState('SICK');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    try {
      const data = await apiFetch('/api/my/leave-requests');
      setItems(data || []);
    } catch (e) {}
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const res = await apiFetch('/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify({ leaveType, startDate, endDate, reason }),
      });
      if (res?.queued) {
        setMsg(t(lang,'savedOffline'));
      } else {
        setMsg('Submitted');
        setStartDate('');
        setEndDate('');
        setReason('');
        await load();
      }
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div style={{ paddingTop: 12 }}>
      <h2 style={{ margin: '6px 0 12px' }}>{t(lang,'requests')}</h2>

      <div className="card">
        <form onSubmit={submit} className="grid">
          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Leave type</div>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
              <option value="SICK">SICK</option>
              <option value="PERSONAL">PERSONAL</option>
              <option value="VACATION">VACATION</option>
            </select>
          </label>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <label>
              <div style={{ fontSize: 13, marginBottom: 6 }}>Start</div>
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              <div style={{ fontSize: 13, marginBottom: 6 }}>End</div>
              <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Reason</div>
            <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>

          {err ? <div className="alert error">{err}</div> : null}
          {msg ? <div className="alert info">{msg}</div> : null}

          <button className="btn primary">{t(lang,'leaveReq')}</button>
        </form>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3 style={{ margin: '0 0 10px' }}>{t(lang,'myRequests')}</h3>
        <div className="card">
          {!items.length ? <div className="muted">{t(lang,'noData')}</div> : null}
          {items.map((x) => (
            <div key={x.id} style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:10 }}>
              <div><b>#{x.id}</b> • {x.leave_type} • <span className="muted">{x.status}</span></div>
              <div className="muted" style={{ marginTop:4 }}>{x.start_date} → {x.end_date}</div>
              <div className="muted" style={{ marginTop:4 }}>{x.reason || '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}