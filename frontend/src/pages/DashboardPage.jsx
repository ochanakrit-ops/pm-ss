import React, { useEffect, useState } from 'react';
import { t } from '../i18n.js';
import { apiFetch } from '../api.js';

export default function DashboardPage({ lang, me, onRequireLogin }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!me) {
      onRequireLogin?.();
      return;
    }
    if (me.role !== 'HR_ADMIN') return;

    (async () => {
      try {
        const data = await apiFetch('/api/admin/registration-requests');
        setRequests(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [me]);

  if (!me) {
    return (
      <div style={{ paddingTop: 24, color: '#6b7280' }}>
        Redirecting to login...
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>{t(lang, 'dashboard')}</h2>
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: 12, borderRadius: 12 }}>
        {t(lang, 'welcome')}: <b>{me.fullName}</b> • {me.companyCode} • <b>{me.role}</b>
      </div>

      {me.role === 'HR_ADMIN' ? (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>{t(lang, 'pendingRequests')}</h3>
          {error ? (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: 10, borderRadius: 8, color: '#991b1b' }}>
              {error}
            </div>
          ) : null}

          <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10 }}>ID</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>{t(lang, 'fullName')}</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>{t(lang, 'role')}</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>{t(lang, 'teamName')}</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 10 }}>{r.id}</td>
                    <td style={{ padding: 10 }}>{r.fullName}</td>
                    <td style={{ padding: 10 }}>{r.desiredRole}</td>
                    <td style={{ padding: 10 }}>{r.teamName || '-'}</td>
                    <td style={{ padding: 10 }}>{r.status}</td>
                  </tr>
                ))}
                {!requests.length ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 12, color: '#6b7280' }}>No data</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
            * MVP: หน้านี้แสดงรายการคำขอลงทะเบียน เพื่อให้ HR นำไปสร้าง user ต่อ
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16, color: '#6b7280' }}>
          MVP: เมนูสำหรับช่าง/หัวหน้าทีมจะเพิ่มในรอบถัดไป (ลา/เบิกล่วงหน้า)
        </div>
      )}
    </div>
  );
}
