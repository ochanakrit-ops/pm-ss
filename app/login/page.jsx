"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../_components/Header";

const I18N = {
  th: { login:"เข้าสู่ระบบ", company:"บริษัท", username:"ชื่อผู้ใช้", password:"รหัสผ่าน", submit:"เข้าใช้งาน", register:"ลงทะเบียน", demo:"Demo seed: hradmin / Pmss@1234" },
  en: { login:"Login", company:"Company", username:"Username", password:"Password", submit:"Sign in", register:"Register", demo:"Demo seed: hradmin / Pmss@1234" },
};

export default function LoginPage() {
  const [lang, setLang] = useState("th");
  const t = (k) => I18N[lang][k] || k;
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [username, setUsername] = useState("hradmin");
  const [password, setPassword] = useState("Pmss@1234");
  const [err, setErr] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/companies");
      const data = await r.json();
      setCompanies(data);
      if (data?.[0]?.id) setCompanyId(String(data[0].id));
    })();
  }, []);

  async function doLogin() {
    setErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, username, password }),
    });
    const data = await r.json();
    if (!r.ok) { setErr(data.error || "LOGIN_FAILED"); return; }
    router.push("/dashboard");
  }

  return (
    <>
      <Header user={null} lang={lang} onToggleLang={() => setLang(lang === "th" ? "en" : "th")} />
      <div className="container">
        <h1>{t("login")}</h1>
        <p className="mini">{t("demo")}</p>

        <div className="card grid">
          <div className="row cols2">
            <div>
              <div className="label">{t("company")}</div>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {(lang==="th"?(c.name_th||c.name):(c.name_en||c.name))}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">{t("username")}</div>
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>

          <div className="row cols2">
            <div>
              <div className="label">{t("password")}</div>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="btn btnPrimary" style={{ width: "100%" }} onClick={doLogin}>{t("submit")}</button>
            </div>
          </div>

          {err ? <div className="alert">{err}</div> : null}

          <div className="mini">
            <a href="/register">{t("register")}</a>
          </div>
        </div>
      </div>
    </>
  );
}
