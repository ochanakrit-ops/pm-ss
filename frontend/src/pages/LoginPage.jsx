import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../i18n.js';
import { apiFetch } from '../api.js';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isWorker(role) {
  const r = (role || '').toUpperCase();
  return ['TECH', 'TECHNICIAN', 'TEAM_LEAD', 'LEAD', 'FOREMAN'].includes(r);
}

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

      const payload = decodeJwt(data.token);
      await onLoggedIn?.();

      if (isWorker(payload?.role)) navigate('/home');
      else navigate('/');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', paddingTop: 18 }}>
      <h2 style={{ margin: '6px 0 6px' }}>{t(lang, 'login')}</h2>
      <div className="muted" style={{ marginBottom: 12 }}>Demo HR: <b>hradmin / Pmss@1234</b></div>

      <form onSubmit={submit} className="grid">
        <label>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'company')}</div>
          <select value={companyCode} onChange={(e) => setCompanyCode(e.target.value)}>
            {companies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {lang === 'th' ? c.nameTh : c.nameEn}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'username')}</div>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{t(lang, 'password')}</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error ? <div className="alert error">{error}</div> : null}

        <button disabled={loading} className="btn primary">
          {loading ? '...' : t(lang, 'login')}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <Link to="/register">{t(lang, 'register')}</Link>
          <span className="muted">{t(lang, 'forgot')} (MVP)</span>
        </div>
      </form>
    </div>
  );
}