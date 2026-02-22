"use client";

import { useEffect, useState } from "react";

export default function Header({ user, lang, onToggleLang, onLogout }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const upd = () => setOnline(navigator.onLine);
    upd();
    window.addEventListener("online", upd);
    window.addEventListener("offline", upd);
    return () => {
      window.removeEventListener("online", upd);
      window.removeEventListener("offline", upd);
    };
  }, []);

  return (
    <div className="header">
      <div className="header-inner">
        <div className="brand">
          <div style={{ width: 12, height: 12, borderRadius: 4, background: "linear-gradient(135deg,var(--blue),var(--green))" }} />
          <div>PM-SS</div>
          <span className="badge">{online ? "Online" : "Offline"}</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn" onClick={onToggleLang}>{lang.toUpperCase()}</button>
          {user ? (
            <>
              <span className="pill">{user.companyCode} • {user.role}</span>
              <button className="btn btnDanger" onClick={onLogout}>Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
