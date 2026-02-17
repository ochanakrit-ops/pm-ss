import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../i18n.js';
import { apiFetch } from '../api.js';

export default function LoginPage({ lang, onLoggedIn }) {
  const [companies, setCompanies] = useState([]);
  const [companyCode, setCompanyCode] = useState('SCP');
  const [username, setUsername] = useState('hradmin');
  const [password, setPassword] = useState('Pmss@1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/companies');
        setCompanies(data);
        if (data?.length && !data.find((c) => c.code === companyCode)) {
          setCompanyCode(data[0].code);
        }
      } catch (e) {
        setError(e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ companyCode, username, password }),
      });
      localStorage.setItem('pmss_token', data.token);
      await onLoggedIn?.();
      navigate('/');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', paddingTop: 24 }}>
      <h2 style={{ margin: 0 }}>{t(lang, 'login')}</h2>
      <p style={{ color: '#6b7280' }}>Demo HR: <b>hradmin / Pmss@1234</b></p>

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
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'username')}</div>
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 10 }} />
        </label>

        <label>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'password')}</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10 }} />
        </label>

        {error ? (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: 10, borderRadius: 8, color: '#991b1b' }}>
            {error}
          </div>
        ) : null}

        <button disabled={loading} style={{ padding: 12, borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700 }}>
          {loading ? '...' : t(lang, 'login')}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <Link to="/register">{t(lang, 'register')}</Link>
          <span style={{ color: '#9ca3af' }}>{t(lang, 'forgot')} (MVP)</span>
        </div>
      </form>
    </div>
  );
}
