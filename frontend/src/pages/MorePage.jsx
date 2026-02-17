import React from 'react';
import { t } from '../i18n.js';

export default function MorePage({ lang, onToggleLang, onLogout, queueSize, online, onSync }) {
  return (
    <div style={{ paddingTop: 12 }}>
      <h2 style={{ margin: '6px 0 12px' }}>{t(lang,'more')}</h2>

      <div className="card" style={{ display:'grid', gap:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className={online ? 'badge online' : 'badge offline'}>
            {online ? t(lang,'online') : t(lang,'offline')}
          </div>
          <div className="badge">{t(lang,'queued')}: {queueSize}</div>
        </div>

        <button className="btn ghost" onClick={onToggleLang}>
          {t(lang,'switchLang')} ({lang.toUpperCase()})
        </button>

        <button className="btn" onClick={onSync} disabled={!online || queueSize === 0}>
          {t(lang,'syncNow')}
        </button>

        <button className="btn" onClick={onLogout}>
          {t(lang,'logout')}
        </button>
      </div>
    </div>
  );
}