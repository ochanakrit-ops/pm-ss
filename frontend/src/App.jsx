import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { t } from './i18n.js';
import { apiFetch } from './api.js';

const containerStyle = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '12px 16px',
};

export default function App() {
  const [lang, setLang] = useState(localStorage.getItem('pmss_lang') || 'th');
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  const isAuthed = useMemo(() => !!localStorage.getItem('pmss_token'), []);

  async function refreshMe() {
    const token = localStorage.getItem('pmss_token');
    if (!token) {
      setMe(null);
      return;
    }
    try {
      const data = await apiFetch('/api/auth/me');
      setMe(data);
    } catch {
      localStorage.removeItem('pmss_token');
      setMe(null);
    }
  }

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleLang() {
    const next = lang === 'th' ? 'en' : 'th';
    setLang(next);
    localStorage.setItem('pmss_lang', next);
  }

  function logout() {
    localStorage.removeItem('pmss_token');
    setMe(null);
    navigate('/login');
  }

  return (
    <div>
      <header style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{t(lang, 'appName')}</div>
            <nav style={{ display: 'flex', gap: 10, fontSize: 14 }}>
              <Link to="/" style={{ textDecoration: 'none' }}>{t(lang, 'dashboard')}</Link>
            </nav>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={toggleLang} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #2563eb', background: '#fff' }}>
              {lang.toUpperCase()}
            </button>
            {me ? (
              <button onClick={logout} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #9ca3af', background: '#fff' }}>
                {t(lang, 'logout')}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main style={containerStyle}>
        <Routes>
          <Route path="/login" element={<LoginPage lang={lang} onLoggedIn={() => refreshMe()} />} />
          <Route path="/register" element={<RegisterPage lang={lang} />} />
          <Route path="/" element={<DashboardPage lang={lang} me={me} onRequireLogin={() => navigate('/login')} />} />
          <Route path="*" element={<DashboardPage lang={lang} me={me} onRequireLogin={() => navigate('/login')} />} />
        </Routes>
      </main>

      <footer style={{ ...containerStyle, color: '#6b7280', fontSize: 12 }}>
        PM-SS MVP • Render + Supabase
      </footer>
    </div>
  );
}
