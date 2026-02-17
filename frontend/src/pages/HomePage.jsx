import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n.js';

export default function HomePage({ lang, me }) {
  const nav = useNavigate();

  return (
    <div style={{ paddingTop: 12 }}>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:18 }}>{t(lang,'hello')}, {me?.fullName || '-'}</div>
            <div className="muted" style={{ marginTop:4 }}>{me?.companyCode} • {me?.role}</div>
          </div>
          <div className="badge online">{t(lang,'ready')}</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="big-actions">
        <div className="action-card" onClick={() => nav('/advance')}>
          <div>
            <div className="label">{t(lang,'advanceReq')}</div>
            <div className="muted" style={{ marginTop:4 }}>{t(lang,'advanceReqHint')}</div>
          </div>
          <div style={{ fontSize:22 }}>💰</div>
        </div>

        <div className="action-card" onClick={() => nav('/requests')}>
          <div>
            <div className="label">{t(lang,'leaveReq')}</div>
            <div className="muted" style={{ marginTop:4 }}>{t(lang,'leaveReqHint')}</div>
          </div>
          <div style={{ fontSize:22 }}>📅</div>
        </div>

        <div className="action-card" onClick={() => nav('/requests')}>
          <div>
            <div className="label">{t(lang,'myRequests')}</div>
            <div className="muted" style={{ marginTop:4 }}>{t(lang,'myRequestsHint')}</div>
          </div>
          <div style={{ fontSize:22 }}>📄</div>
        </div>
      </div>
    </div>
  );
}