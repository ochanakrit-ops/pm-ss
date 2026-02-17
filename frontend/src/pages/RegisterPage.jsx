import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../i18n.js';
import { apiFetch } from '../api.js';

export default function RegisterPage({ lang }) {
  const [companies, setCompanies] = useState([]);
  const [companyCode, setCompanyCode] = useState('SCP');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [desiredRole, setDesiredRole] = useState('TECH');
  const [teamName, setTeamName] = useState('');
  const [salaryMonthly, setSalaryMonthly] = useState('');
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/companies');
        setCompanies(data);
        if (data?.length && !data.find((c) => c.code === companyCode)) setCompanyCode(data[0].code);
      } catch (e) {
        setError(e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setDone(null);
    try {
      const payload = {
        companyCode,
        fullName,
        phone,
        email,
        desiredRole,
        teamName,
        salaryMonthly: salaryMonthly ? Number(salaryMonthly) : null,
      };
      const res = await apiFetch('/api/register-requests', { method: 'POST', body: JSON.stringify(payload) });
      setDone(res);
    } catch (e2) {
      setError(e2.message);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 24 }}>
      <h2 style={{ margin: 0 }}>{t(lang, 'register')}</h2>
      <p style={{ color: '#6b7280' }}>HR จะเข้ามารีวิว แล้วสร้าง Username/Password ให้</p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'company')}</div>
          <select value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} style={{ width: '100%', padding: 10 }}>
            {companies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {lang === 'th' ? c.nameTh : c.nameEn}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'fullName')}</div>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: 10 }} required />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'phone')}</div>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: 10 }} />
          </label>
          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'email')}</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10 }} />
          </label>
        </div>

        <label>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'role')}</div>
          <select value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)} style={{ width: '100%', padding: 10 }}>
            <option value="TEAM_LEAD">{t(lang, 'teamLead')}</option>
            <option value="TECH">{t(lang, 'tech')}</option>
          </select>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'teamName')}</div>
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} style={{ width: '100%', padding: 10 }} />
          </label>
          <label>
            <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'salary')}</div>
            <input inputMode="numeric" value={salaryMonthly} onChange={(e) => setSalaryMonthly(e.target.value)} style={{ width: '100%', padding: 10 }} />
          </label>
        </div>

        {error ? (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: 10, borderRadius: 8, color: '#991b1b' }}>
            {error}
          </div>
        ) : null}

        {done ? (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', padding: 10, borderRadius: 8, color: '#166534' }}>
            ส่งคำขอสำเร็จ ✅ (Request ID: {done.id})
          </div>
        ) : null}

        <button style={{ padding: 12, borderRadius: 10, border: 'none', background: '#111827', color: '#fff', fontWeight: 700 }}>
          {t(lang, 'submit')}
        </button>

        <div style={{ fontSize: 14 }}>
          <Link to="/login">← {t(lang, 'login')}</Link>
        </div>
      </form>
    </div>
  );
}
