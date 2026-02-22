"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../_components/Header";

export default function DashboardPage() {
  const [lang, setLang] = useState("th");
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function loadMe() {
    const r = await fetch("/api/auth/me");
    const data = await r.json();
    if (!r.ok) { router.push("/login"); return; }
    setUser(data.user);
  }

  async function loadPending() {
    setErr("");
    const r = await fetch("/api/hr/pending-registrations");
    const data = await r.json();
    if (!r.ok) { setErr(data.error || "LOAD_FAILED"); return; }
    setPending(data);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method:"POST" });
    router.push("/login");
  }

  useEffect(() => { loadMe(); }, []);
  useEffect(() => { if (user?.role === "HR_ADMIN") loadPending(); }, [user]);

  return (
    <>
      <Header user={user} lang={lang} onToggleLang={() => setLang(lang==="th"?"en":"th")} onLogout={logout} />
      <div className="container">
        <h1>Dashboard</h1>
        {!user ? <div className="card">Loading...</div> : (
          <>
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:900, fontSize:18 }}>{user.fullName}</div>
                  <div className="mini">{user.companyCode} • {user.role}</div>
                </div>
                {user.role === "HR_ADMIN" ? (
                  <button className="btn" onClick={loadPending}>↻ Pending</button>
                ) : null}
              </div>
            </div>

            {user.role === "HR_ADMIN" ? (
              <div className="card" style={{ marginTop:14 }}>
                <h2>Pending registration</h2>
                {err ? <div className="alert">{err}</div> : null}
                {!pending.length ? <div className="mini">No data</div> : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Name</th><th>Role</th><th>Team</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.full_name}</td>
                          <td>{p.desired_role}</td>
                          <td>{p.team_name || "-"}</td>
                          <td><span className="pill pillWarn">{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mini" style={{ marginTop:10 }}>
                  Approve API ready: <code>POST /api/hr/approve-registration</code> (UI approve will be added in v1.6)
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginTop:14 }}>
                <h2>Self Service</h2>
                <div className="mini">MVP: login/register + role-based access. Next: Leave/Advance forms.</div>
              </div>
            )}

            <div className="footer">PM-SS v1.5 • Next.js • Blue/Green Minimal</div>
          </>
        )}
      </div>
    </>
  );
}
