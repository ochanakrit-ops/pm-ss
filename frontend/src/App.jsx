import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import RequestsPage from './pages/RequestsPage.jsx';
import AdvancePage from './pages/AdvancePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import MorePage from './pages/MorePage.jsx';
import { t } from './i18n.js';
import { apiFetch, getQueueSize, syncOfflineQueue } from './api.js';

function isWorker(role) {
  const r = (role || '').toUpperCase();
  return ['TECH', 'TECHNICIAN', 'TEAM_LEAD', 'LEAD', 'FOREMAN'].includes(r);
}

export default function App() {
  const [lang, setLang] = useState(localStorage.getItem('pmss_lang') || 'th');
  const [me, setMe] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(getQueueSize());
  const navigate = useNavigate();

  const hasToken = useMemo(() => !!localStorage.getItem('pmss_token'), []);

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

  useEffect(() => {
    const onOn = async () => {
      setOnline(true);
      const r = await syncOfflineQueue().catch(() => null);
      setQueueSize(getQueueSize());
      return r;
    };
    const onOff = () => setOnline(false);
    window.addEventListener('online', onOn);
    window.addEventListener('offline', onOff);
    return () => {
      window.removeEventListener('online', onOn);
      window.removeEventListener('offline', onOff);
    };
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

  async function manualSync() {
    await syncOfflineQueue().catch(() => null);
    setQueueSize(getQueueSize());
  }

  const showBottom = !!me && isWorker(me.role);

  return (
    <div>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <div className="title">{t(lang, 'appName')}</div>
            <nav className="nav-top">
              <Link to="/" style={{ textDecoration: 'none' }}>{t(lang, 'dashboard')}</Link>
            </nav>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={online ? 'badge online' : 'badge offline'}>{online ? t(lang,'online') : t(lang,'offline')}</span>
            <button onClick={toggleLang} className="pill primary">
              {lang.toUpperCase()}
            </button>
            {me ? (
              <button onClick={logout} className="pill danger">
                {t(lang, 'logout')}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className={`container ${showBottom ? 'main-with-bottom' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage lang={lang} onLoggedIn={() => refreshMe()} />} />
          <Route path="/register" element={<RegisterPage lang={lang} />} />

          {/* Worker mobile pages */}
          <Route path="/home" element={<HomePage lang={lang} me={me} />} />
          <Route path="/requests" element={<RequestsPage lang={lang} />} />
          <Route path="/advance" element={<AdvancePage lang={lang} />} />
          <Route path="/profile" element={<ProfilePage lang={lang} me={me} />} />
          <Route path="/more" element={<MorePage lang={lang} online={online} queueSize={queueSize} onToggleLang={toggleLang} onLogout={logout} onSync={manualSync} />} />

          {/* Admin dashboard */}
          <Route path="/" element={<DashboardPage lang={lang} me={me} onRequireLogin={() => navigate('/login')} />} />
          <Route path="*" element={<DashboardPage lang={lang} me={me} onRequireLogin={() => navigate('/login')} />} />
        </Routes>
      </main>

      {showBottom ? (
        <div className="bottom-nav">
          <div className="bottom-nav-inner">
            <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div>🏠</div><div>{t(lang,'home')}</div>
            </NavLink>
            <NavLink to="/requests" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div>📄</div><div>{t(lang,'requests')}</div>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div>👤</div><div>{t(lang,'profile')}</div>
            </NavLink>
            <NavLink to="/more" className={({ isActive }) => (isActive ? 'active' : '')}>
              <div>⚙️</div><div>{t(lang,'more')}</div>
            </NavLink>
          </div>
        </div>
      ) : null}

      <footer className="container muted" style={{ fontSize: 12 }}>
        PM-SS MVP • Render + Supabase
      </footer>
    </div>
  );
}