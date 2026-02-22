"use client";

import { useEffect, useState } from "react";
import Header from "../_components/Header";

const I18N = {
  th: { title:"ลงทะเบียน (สมัครใช้งาน)", company:"บริษัท", fullName:"ชื่อ-สกุล", phone:"เบอร์โทร", email:"อีเมล", role:"ตำแหน่ง", team:"ทีม", salary:"เงินเดือน (ต่อเดือน)", submit:"ส่งให้ HR รีวิว", back:"กลับไป Login" },
  en: { title:"Register", company:"Company", fullName:"Full name", phone:"Phone", email:"Email", role:"Role", team:"Team", salary:"Monthly salary", submit:"Submit for HR review", back:"Back to Login" },
};

export default function RegisterPage() {
  const [lang, setLang] = useState("th");
  const t = (k) => I18N[lang][k] || k;
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [desiredRole, setDesiredRole] = useState("TECH");
  const [teamName, setTeamName] = useState("");
  const [salaryMonthly, setSalaryMonthly] = useState(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/companies");
      const data = await r.json();
      setCompanies(data);
      if (data?.[0]?.id) setCompanyId(String(data[0].id));
    })();
  }, []);

  async function submit() {
    setMsg(""); setErr("");
    const r = await fetch("/api/register", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ companyId, fullName, phone, email, desiredRole, teamName, salaryMonthly })
    });
    const data = await r.json();
    if (!r.ok) { setErr(data.error || "REGISTER_FAILED"); return; }
    setMsg(`OK • Request ID ${data.id} • ${data.status}`);
  }

  return (
    <>
      <Header user={null} lang={lang} onToggleLang={() => setLang(lang === "th" ? "en" : "th")} />
      <div className="container">
        <h1>{t("title")}</h1>
        <div className="card grid">
          <div className="row cols2">
            <div>
              <div className="label">{t("company")}</div>
              <select value={companyId} onChange={(e)=>setCompanyId(e.target.value)}>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {(lang==="th"?(c.name_th||c.name):(c.name_en||c.name))}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">{t("role")}</div>
              <select value={desiredRole} onChange={(e)=>setDesiredRole(e.target.value)}>
                <option value="TECH">TECH</option>
                <option value="TEAM_LEAD">TEAM_LEAD</option>
              </select>
            </div>
          </div>

          <div className="row cols2">
            <div>
              <div className="label">{t("fullName")}</div>
              <input className="input" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
            </div>
            <div>
              <div className="label">{t("phone")}</div>
              <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </div>
          </div>

          <div className="row cols2">
            <div>
              <div className="label">{t("email")}</div>
              <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div>
              <div className="label">{t("team")}</div>
              <input className="input" value={teamName} onChange={(e)=>setTeamName(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="label">{t("salary")}</div>
            <input className="input" type="number" value={salaryMonthly} onChange={(e)=>setSalaryMonthly(Number(e.target.value||0))} />
          </div>

          <button className="btn btnPrimary" onClick={submit}>{t("submit")}</button>
          {msg ? <div className="pill pillOk">{msg}</div> : null}
          {err ? <div className="alert">{err}</div> : null}
          <div className="mini"><a href="/login">{t("back")}</a></div>
        </div>
      </div>
    </>
  );
}
