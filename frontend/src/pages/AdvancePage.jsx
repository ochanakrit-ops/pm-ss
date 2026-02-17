import React, { useEffect, useState } from 'react';
import { t } from '../i18n.js';
import { apiFetch } from '../api.js';

export default function AdvancePage({ lang }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    try {
      const data = await apiFetch('/api/my/advance-requests');
      setItems(data || []);
    } catch (e) {
      // ignore for MVP
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const res = await apiFetch('/api/advance-requests', {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      });
      if (res?.queued) {
        setMsg(t(lang,'savedOffline'));
      } else {
        setMsg('Submitted');
        setAmount('');
        setReason('');
        await load();
      }
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div style={{ paddingTop: 12 }}>
      <h2 style={{ margin: '6px 0 12px' }}>{t(lang,'advance')}</h2>

      <div className="card">
        <form onSubmit={submit} className="grid">
          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Amount</div>
            <input className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" />
          </label>
          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Reason</div>
            <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          {err ? <div className="alert error">{err}</div> : null}
          {msg ? <div className="alert info">{msg}</div> : null}
          <button className="btn primary">{t(lang,'advanceReq')}</button>
        </form>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3 style={{ margin: '0 0 10px' }}>{t(lang,'myRequests')}</h3>
        <div className="card">
          {!items.length ? <div className="muted">{t(lang,'noData')}</div> : null}
          {items.map((x) => (
            <div key={x.id} style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:10 }}>
              <div><b>#{x.id}</b> • ฿{x.amount} • <span className="muted">{x.status}</span></div>
              <div className="muted" style={{ marginTop:4 }}>{x.reason || '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}