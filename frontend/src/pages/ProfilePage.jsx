import React from 'react';
import { t } from '../i18n.js';

export default function ProfilePage({ lang, me }) {
  return (
    <div style={{ paddingTop: 12 }}>
      <h2 style={{ margin: '6px 0 12px' }}>{t(lang,'profile')}</h2>
      <div className="card">
        <div style={{ display:'grid', gap:8, fontSize:14 }}>
          <div><b>{t(lang,'fullName')}:</b> {me?.fullName || '-'}</div>
          <div><b>{t(lang,'company')}:</b> {me?.companyCode || '-'}</div>
          <div><b>{t(lang,'role')}:</b> {me?.role || '-'}</div>
          <div className="muted">{t(lang,'profileNote')}</div>
        </div>
      </div>
    </div>
  );
}