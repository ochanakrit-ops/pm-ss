'use client';

import React from 'react';
import { api, useAsync } from './client';

export function Nav() {
  const { data } = useAsync(async () => {
    try {
      return await api<{ user: any; company: any }>('/api/auth/me');
    } catch {
      return null;
    }
  }, []);

  const online = !!data?.user;

  async function logout() {
    await api('/api/auth/logout', { method: 'POST', body: '{}' });
    window.location.href = '/login';
  }

  return (
    <div className="nav">
      <div className="brand">PM-SS</div>
      <div className="nav-right">
        <span className={online ? 'badge ok' : 'badge'}>{online ? 'Online' : 'Guest'}</span>
        {online ? (
          <button className="btn" onClick={logout}>Logout</button>
        ) : (
          <a className="btn" href="/login">Login</a>
        )}
      </div>
    </div>
  );
}
