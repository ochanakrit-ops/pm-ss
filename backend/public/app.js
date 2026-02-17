// PM-SS Frontend (Vanilla JS) - TH/EN + Multi-company
const API = "/api";

const i18n = {
  th: {
    subtitle:"PM Self Service (MVP)",
    company:"??????", username:"??????????", password:"????????", login:"???????????",
    register:"?????/?????????????????", forgot:"???????????", register_title:"?????/?????????? (??????????????)",
    back:"????", full_name:"????-???????", phone:"????????", id_last4:"??????? 4 ???????", desired_team:"?????????????/??????",
    note:"????????", submit:"?????????",
    dashboard:"????????", my_leave:"????????????", my_leave_desc:"????/????????????",
    my_advance:"??????????????????", new:"?????????", list:"??????",
    approvals:"???????????", approvals_desc:"???????????????? / HR",
    approve_leave:"?????????", approve_advance:"???????????",
    hr_tools:"?????????? HR", hr_tools_desc:"Review ???????? / ???????????? / Reset Password",
    hr_registrations:"HR: ???????????/??????????", hr_users:"HR: ????????????", hr_resets:"HR: ??????????????????",
    profile:"???????",
    leave_new:"??????????", leave_type:"???????????", start_date:"???????????", end_date:"?????????????", leave_list:"??????????????",
    advance_new:"??????????????????", amount:"????????? (???)", reason:"??????", advance_list:"????????????????????????",
    home:"???????", leave:"??", advance:"????", approve:"???????",
    status_wait_tl:"????????????", status_wait_hr:"?? HR", status_approved:"???????????", status_rejected:"?????????",
    approve_btn:"???????", reject_btn:"??????", reject_prompt:"???????????????:",
    ok_register:"????????????? ? HR ?????????????????????????",
    ok_forgot:"??????????? ? ??????????? HR ????????????????"
  },
  en: {
    subtitle:"PM Self Service (MVP)",
    company:"Company", username:"Username", password:"Password", login:"Login",
    register:"Register / Employee Form", forgot:"Forgot password", register_title:"Registration (Job-like form)",
    back:"Back", full_name:"Full name", phone:"Phone", id_last4:"ID card last 4 digits", desired_team:"Desired team",
    note:"Note", submit:"Submit",
    dashboard:"Dashboard", my_leave:"My Leave", my_leave_desc:"Request / track leave",
    my_advance:"Advance Payment", new:"New", list:"List",
    approvals:"Approvals", approvals_desc:"For Team Leader / HR",
    approve_leave:"Approve Leave", approve_advance:"Approve Advance",
    hr_tools:"HR Tools", hr_tools_desc:"Review registrations / Manage users / Reset password",
    hr_registrations:"HR: Registrations", hr_users:"HR: Users", hr_resets:"HR: Password reset requests",
    profile:"Profile",
    leave_new:"New Leave Request", leave_type:"Leave type", start_date:"Start date", end_date:"End date", leave_list:"My Leave Requests",
    advance_new:"New Advance Request", amount:"Amount (THB)", reason:"Reason", advance_list:"My Advance Requests",
    home:"Home", leave:"Leave", advance:"Advance", approve:"Approve",
    status_wait_tl:"Waiting TL", status_wait_hr:"Waiting HR", status_approved:"Approved", status_rejected:"Rejected",
    approve_btn:"Approve", reject_btn:"Reject", reject_prompt:"Reject reason:",
    ok_register:"Submitted ? HR will review and create your account",
    ok_forgot:"Submitted ? Please contact HR for a new password"
  }
};

const state = {
  token: localStorage.getItem("pmss_token"),
  user: JSON.parse(localStorage.getItem("pmss_user") || "null"),
  lang: localStorage.getItem("pmss_lang") || "th"
};

const qs = (id) => document.getElementById(id);
const t = (k) => (i18n[state.lang] && i18n[state.lang][k]) || k;
const show = (id) => qs(id).classList.remove("d-none");
const hide = (id) => qs(id).classList.add("d-none");
const escapeHtml = (str) => (str ?? "").toString().replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

function hideAllViews() {
  [
    "viewLogin","viewRegister","viewDashboard",
    "viewLeaveNew","viewLeaveMy","viewAdvNew","viewAdvMy",
    "viewApproveLeave","viewApproveAdv",
    "viewHRRegs","viewHRUsers","viewHRResets"
  ].forEach(hide);
}

function roleName(role){
  if(role==="HR_ADMIN") return "HR-Admin";
  if(role==="TEAM_LEADER") return state.lang==="th" ? "??????????" : "Team Leader";
  return state.lang==="th" ? "????" : "Technician";
}

function statusBadge(status){
  const map = {
    WAIT_TL:["warning",t("status_wait_tl")],
    WAIT_HR:["info",t("status_wait_hr")],
    APPROVED:["success",t("status_approved")],
    REJECTED:["danger",t("status_rejected")]
  };
  const [c,l] = map[status] || ["secondary",status];
  return `<span class="badge text-bg-${c}">${l}</span>`;
}

async function api(path, opts={}){
  const headers = Object.assign({ "Content-Type":"application/json" }, opts.headers||{});
  if(state.token) headers["Authorization"] = `Bearer ${state.token}`;
  const res = await fetch(API+path, { ...opts, headers });
  const isJson = (res.headers.get("content-type")||"").includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if(!res.ok) throw new Error(body && body.message ? body.message : `HTTP ${res.status}`);
  return body;
}

function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  qs("btnLang").textContent = state.lang.toUpperCase();
}

function ensureAuthUI(){
  const authed = !!state.token && !!state.user;
  qs("btnLogout").style.display = authed ? "inline-block" : "none";
  qs("meLabel").textContent = authed ? `${state.user.full_name} (${roleName(state.user.role)}) | ${state.user.company_code}` : "";
}

async function loadCompanies(){
  const list = await api("/companies", { headers:{} });
  const opts = list.map(c=>`<option value="${c.code}">${c.code} - ${escapeHtml(c.name)}</option>`).join("");
  qs("loginCompany").innerHTML = opts;
  qs("regCompany").innerHTML = opts;

  const saved = localStorage.getItem("pmss_company") || (list[0] && list[0].code) || "";
  qs("loginCompany").value = saved;
  qs("regCompany").value = saved;
}

function nav(view){
  hideAllViews();
  ensureAuthUI();
  applyI18n();

  if(!state.token){
    show(view==="register" ? "viewRegister" : "viewLogin");
    return;
  }

  const canApprove = ["HR_ADMIN","TEAM_LEADER"].includes(state.user.role);
  qs("navApprove").classList.toggle("d-none", !canApprove);
  qs("cardApprovals").classList.toggle("d-none", !canApprove);
  qs("cardHR").classList.toggle("d-none", state.user.role!=="HR_ADMIN");

  if(view==="dashboard"){ show("viewDashboard"); loadProfile(); loadAdvanceHint(); }
  else if(view==="leaveNew"){ show("viewLeaveNew"); }
  else if(view==="leaveMy"){ show("viewLeaveMy"); loadMyLeaves(); }
  else if(view==="advNew"){ show("viewAdvNew"); loadAdvanceHint(true); }
  else if(view==="advMy"){ show("viewAdvMy"); loadMyAdvances(); }
  else if(view==="approveLeave"){ show("viewApproveLeave"); loadPendingLeaves(); }
  else if(view==="approveAdv"){ show("viewApproveAdv"); loadPendingAdvances(); }
  else if(view==="hrRegs"){ show("viewHRRegs"); loadHRRegs(); }
  else if(view==="hrUsers"){ show("viewHRUsers"); loadHRUsers(); }
  else if(view==="hrResets"){ show("viewHRResets"); loadHRResets(); }
  else { show("viewDashboard"); loadProfile(); loadAdvanceHint(); }
}

async function login(){
  hide("loginError");
  const company_code = qs("loginCompany").value;
  const username = qs("loginUsername").value.trim();
  const password = qs("loginPassword").value;

  try{
    const data = await api("/login", { method:"POST", body:JSON.stringify({company_code, username, password}), headers:{} });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("pmss_token", state.token);
    localStorage.setItem("pmss_user", JSON.stringify(state.user));
    localStorage.setItem("pmss_company", company_code);
    nav("dashboard");
  }catch(e){
    qs("loginError").textContent = e.message;
    show("loginError");
  }
}

function logout(){
  localStorage.removeItem("pmss_token");
  localStorage.removeItem("pmss_user");
  state.token = null;
  state.user = null;
  nav("login");
}

function setMessage(el, ok, text){
  el.classList.remove("d-none","text-danger","text-success");
  el.classList.add(ok ? "text-success" : "text-danger");
  el.textContent = text;
}

async function submitRegister(){
  const msg = qs("regMsg"); msg.classList.add("d-none");
  const company_code = qs("regCompany").value;
  const full_name = qs("regFullName").value.trim();
  if(!full_name) return setMessage(msg,false,"full_name required");

  const phone = qs("regPhone").value.trim();
  const id_card_last4 = qs("regIdLast4").value.trim();
  const desired_team = qs("regDesiredTeam").value.trim();
  const note = qs("regNote").value.trim();

  try{
    await api("/register", { method:"POST", body:JSON.stringify({company_code, full_name, phone, id_card_last4, desired_team, note}), headers:{} });
    setMessage(msg,true,t("ok_register"));
    ["regFullName","regPhone","regIdLast4","regDesiredTeam","regNote"].forEach(id=>qs(id).value="");
  }catch(e){
    setMessage(msg,false,e.message);
  }
}

async function forgotPassword(){
  const company_code = qs("loginCompany").value;
  const username = qs("loginUsername").value.trim();
  if(!username) return alert("Please enter username");
  await api("/forgot-password", { method:"POST", body:JSON.stringify({company_code, username}), headers:{} });
  alert(t("ok_forgot"));
}

async function loadProfile(){
  const me = await api("/me");
  qs("profileBox").innerHTML = `
    <div><b>Name:</b> ${escapeHtml(me.full_name)}</div>
    <div><b>Username:</b> ${escapeHtml(me.username)}</div>
    <div><b>Role:</b> ${escapeHtml(roleName(me.role))}</div>
    <div><b>TeamId:</b> ${me.team_id ?? "-"}</div>
    <div><b>Salary:</b> ${me.salary ?? "-"}</div>
    <div><b>Advance Limit:</b> ${escapeHtml(me.advance_limit_type)} / ${me.advance_limit_value}</div>
  `;
}

async function loadAdvanceHint(forForm=false){
  try{
    const r = await api("/advances/max");
    const max = Number(r.max || 0);
    const text = max > 0
      ? (state.lang==="th" ? `?????????????: = ? ${max.toLocaleString("th-TH")}` : `Per-request limit: = ? ${max.toLocaleString("en-US")}`)
      : (state.lang==="th" ? "??????: ??????????? (??? HR ???????)" : "Limit: not set (ask HR)");

    qs("advanceHint").textContent = text;
    if(forForm) qs("advMaxHint").textContent = text;
  }catch{}
}

async function loadMyLeaves(){
  const box = qs("leaveMyList");
  box.innerHTML = `<div class="small-muted">Loading...</div>`;
  const rows = await api("/leaves/my");

  if(!rows.length) return box.innerHTML = `<div class="small-muted">No data</div>`;
  box.innerHTML = rows.map(r=>`
    <div class="card shadow-sm"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">${escapeHtml(r.leave_type)}</div>
        ${statusBadge(r.status)}
      </div>
      <div class="small-muted mt-2">Date: ${r.start_date} - ${r.end_date}</div>
      ${r.note?`<div class="mt-2">${escapeHtml(r.note)}</div>`:""}
      ${r.reject_reason?`<div class="text-danger mt-2">Reason: ${escapeHtml(r.reject_reason)}</div>`:""}
    </div></div>
  `).join("");
}

async function loadMyAdvances(){
  const box = qs("advMyList");
  box.innerHTML = `<div class="small-muted">Loading...</div>`;
  const rows = await api("/advances/my");

  if(!rows.length) return box.innerHTML = `<div class="small-muted">No data</div>`;
  box.innerHTML = rows.map(r=>`
    <div class="card shadow-sm"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">? ${Number(r.amount).toLocaleString()}</div>
        ${statusBadge(r.status)}
      </div>
      <div class="mt-2">${escapeHtml(r.reason)}</div>
      ${r.reject_reason?`<div class="text-danger mt-2">Reason: ${escapeHtml(r.reject_reason)}</div>`:""}
    </div></div>
  `).join("");
}

async function submitLeave(){
  const msg = qs("leaveNewMsg"); msg.classList.add("d-none");
  const leave_type = qs("leaveType").value;
  const start_date = qs("leaveStart").value;
  const end_date = qs("leaveEnd").value;
  const note = qs("leaveNote").value.trim();

  if(!start_date || !end_date) return setMessage(msg,false,"start/end required");
  if(end_date < start_date) return setMessage(msg,false,"end < start");

  try{
    await api("/leaves", { method:"POST", body:JSON.stringify({leave_type,start_date,end_date,note}) });
    setMessage(msg,true,"OK ?");
    qs("leaveNote").value = "";
    setTimeout(()=>nav("leaveMy"), 400);
  }catch(e){
    setMessage(msg,false,e.message);
  }
}

async function submitAdvance(){
  const msg = qs("advNewMsg"); msg.classList.add("d-none");
  const amount = Number(qs("advAmount").value);
  const reason = qs("advReason").value.trim();

  if(!amount || amount<=0) return setMessage(msg,false,"amount invalid");
  if(!reason) return setMessage(msg,false,"reason required");

  try{
    await api("/advances", { method:"POST", body:JSON.stringify({amount,reason}) });
    setMessage(msg,true,"OK ?");
    qs("advAmount").value = "";
    qs("advReason").value = "";
    setTimeout(()=>nav("advMy"), 400);
  }catch(e){
    setMessage(msg,false,e.message);
  }
}

async function loadPendingLeaves(){
  const box = qs("approveLeaveList");
  box.innerHTML = `<div class="small-muted">Loading...</div>`;
  const rows = await api("/leaves/pending");
  if(!rows.length) return box.innerHTML = `<div class="small-muted">No pending</div>`;

  box.innerHTML = rows.map(r=>`
    <div class="card shadow-sm"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">${escapeHtml(r.employee_name)} (${escapeHtml(r.team_name)})</div>
        ${statusBadge(r.status)}
      </div>
      <div class="small-muted mt-2">Type: ${escapeHtml(r.leave_type)} | ${r.start_date} - ${r.end_date}</div>
      ${r.note?`<div class="mt-2">${escapeHtml(r.note)}</div>`:""}
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-success w-100" data-action="leaveApprove" data-id="${r.id}">${t("approve_btn")}</button>
        <button class="btn btn-outline-danger w-100" data-action="leaveReject" data-id="${r.id}">${t("reject_btn")}</button>
      </div>
    </div></div>
  `).join("");
}

async function loadPendingAdvances(){
  const box = qs("approveAdvList");
  box.innerHTML = `<div class="small-muted">Loading...</div>`;
  const rows = await api("/advances/pending");
  if(!rows.length) return box.innerHTML = `<div class="small-muted">No pending</div>`;

  box.innerHTML = rows.map(r=>`
    <div class="card shadow-sm"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">${escapeHtml(r.employee_name)} (${escapeHtml(r.team_name)})</div>
        ${statusBadge(r.status)}
      </div>
      <div class="small-muted mt-2">Amount: ? ${Number(r.amount).toLocaleString()}</div>
      <div class="mt-2">${escapeHtml(r.reason)}</div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-success w-100" data-action="advApprove" data-id="${r.id}">${t("approve_btn")}</button>
        <button class="btn btn-outline-danger w-100" data-action="advReject" data-id="${r.id}">${t("reject_btn")}</button>
      </div>
    </div></div>
  `).join("");
}

async function loadHRRegs(){
  const box = qs("hrRegsList");
  box.innerHTML = `<div class="small-muted">Loading...</div>`;
  const rows = await api("/hr/registrations");
  if(!rows.length) return box.innerHTML = `<div class="small-muted">No data</div>`;

  box.innerHTML = rows.map(r=>`
    <div class="card shadow-sm"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">${escapeHtml(r.full_name)}</div>
        <span class="badge text-bg-${r.status==='PENDING'?'warning':r.status==='APPROVED'?'success':'danger'}">${escapeHtml(r.status)}</span>
      </div>
      <div class="small-muted mt-2">
        Phone: ${escapeHtml(r.phone||"-")} | ID: ${escapeHtml(r.id_card_last4||"-")} | Desired: ${escapeHtml(r.desired_team||"-")}
      </div>
      ${r.note?`<div class="mt-2">${escapeHtml(r.note)}</div>`:""}
      ${r.status==='PENDING'?`
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-success w-100" data-action="hrApproveCreate" data-id="${r.id}">Create user</button>
          <button class="btn btn-outline-danger w-100" data-action="hrRegReject" data-id="${r.id}">${t("reject_btn")}</button>
        </div>
      `:""}
    </div></div>
  `).join("");
}

async function loadHRUsers(){
  const box = qs("hrUsersList");
  box.innerHTML = `<div class="small-muted">Loading...</div>`;
  const rows = await api("/hr/users");
  if(!rows.length) return box.innerHTML = `<div class="small-muted">No data</div>`;

  box.innerHTML = rows.map(u=>`
    <div class="card shadow-sm"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">${escapeHtml(u.full_name)} <span class="small-muted">(@${escapeHtml(u.username)})</span></div>
        <span class="badge text-bg-secondary">${escapeHtml(u.role)}</span>
      </div>
      <div class="small-muted mt-2">
        Team: ${escapeHtml(u.team_name||"-")} | Salary: ${u.salary ?? "-"} | Limit: ${escapeHtml(u.advance_limit_type)} / ${u.advance_limit_value}
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-primary w-100" data-action="hrResetPw" data-id="${u.id}">Reset password</button>
      </div>
    </div></div>
  `).join("");
}

async function loadHRResets(){
  const box = qs("hrResetsList");
  box.innerHTML = `<div class="small-muted">Loading...</div>`;
  const rows = await api("/hr/password-resets");
  if(!rows.length) return box.innerHTML = `<div class="small-muted">No data</div>`;

  box.innerHTML = rows.map(r=>`
    <div class="card shadow-sm"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fw-semibold">@${escapeHtml(r.username)}</div>
        <span class="badge text-bg-${r.status==='WAIT_HR'?'warning':'success'}">${escapeHtml(r.status)}</span>
      </div>
      ${r.status==='WAIT_HR'?`
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-outline-primary w-100" data-action="hrResetPwByUsername" data-username="${escapeHtml(r.username)}">Set new password</button>
          <button class="btn btn-success w-100" data-action="hrMarkResetDone" data-id="${r.id}">Mark done</button>
        </div>
      `:""}
    </div></div>
  `).join("");
}

document.addEventListener("click", async (e)=>{
  const navBtn = e.target.closest("[data-nav]");
  if(navBtn){
    const v = navBtn.getAttribute("data-nav");
    nav(v==="login" ? "login" : v);
    return;
  }

  const act = e.target.closest("[data-action]");
  if(!act) return;

  const action = act.getAttribute("data-action");
  const id = act.getAttribute("data-id");

  try{
    if(action==="leaveApprove"){ await api(`/leaves/${id}/approve`, {method:"POST"}); await loadPendingLeaves(); }
    else if(action==="leaveReject"){
      const reason = prompt(t("reject_prompt"), "Not OK");
      if(reason===null) return;
      await api(`/leaves/${id}/reject`, {method:"POST", body:JSON.stringify({reason})});
      await loadPendingLeaves();
    }
    else if(action==="advApprove"){ await api(`/advances/${id}/approve`, {method:"POST"}); await loadPendingAdvances(); }
    else if(action==="advReject"){
      const reason = prompt(t("reject_prompt"), "Not OK");
      if(reason===null) return;
      await api(`/advances/${id}/reject`, {method:"POST", body:JSON.stringify({reason})});
      await loadPendingAdvances();
    }
    else if(action==="hrRegReject"){
      const reason = prompt(t("reject_prompt"), "????????????");
      if(reason===null) return;
      await api(`/hr/registrations/${id}/reject`, {method:"POST", body:JSON.stringify({reason})});
      await loadHRRegs();
    }
    else if(action==="hrApproveCreate"){
      const username = prompt("Username:", "tech.new");
      if(!username) return;
      const password = prompt("Password:", "Password1!");
      if(!password) return;
      const role = (prompt("Role (TECHNICIAN/TEAM_LEADER):", "TECHNICIAN") || "TECHNICIAN").toUpperCase();
      const teams = await api("/teams");
      const teamId = prompt("TeamId:\n" + teams.map(t=>`${t.id}: ${t.name}`).join("\n"), String(teams[0]?.id||""));
      if(!teamId) return;

      const salary = prompt("Salary (optional):", "20000");
      const limit_type = (prompt("Limit type (FIXED/PCT_SALARY):", "PCT_SALARY") || "PCT_SALARY").toUpperCase();
      const limit_value = prompt("Limit value (FIXED=amount, PCT=percent):", limit_type==="FIXED" ? "3000" : "15");

      await api(`/hr/registrations/${id}/approve-create-user`, {
        method:"POST",
        body:JSON.stringify({
          username, password, role,
          team_id:Number(teamId),
          salary: salary==="" ? null : Number(salary),
          limit_type: limit_type==="PCT_SALARY" ? "PCT_SALARY" : "FIXED",
          limit_value: Number(limit_value||0)
        })
      });
      await loadHRRegs();
    }
    else if(action==="hrResetPw"){
      const new_password = prompt("New password:", "Password1!");
      if(!new_password) return;
      await api(`/hr/users/${id}/reset-password`, {method:"POST", body:JSON.stringify({new_password})});
      alert("Done ?");
    }
    else if(action==="hrResetPwByUsername"){
      const username = act.getAttribute("data-username");
      const users = await api("/hr/users");
      const u = users.find(x=>x.username===username);
      if(!u) return alert("User not found");
      const new_password = prompt("New password:", "Password1!");
      if(!new_password) return;
      await api(`/hr/users/${u.id}/reset-password`, {method:"POST", body:JSON.stringify({new_password})});
      alert("Done ?");
    }
    else if(action==="hrMarkResetDone"){
      await api(`/hr/password-resets/${id}/mark-done`, {method:"POST"});
      await loadHRResets();
    }
  }catch(err){
    alert(err.message);
  }
});

qs("btnLogin").addEventListener("click", login);
qs("btnLogout").addEventListener("click", logout);
qs("btnSubmitLeave").addEventListener("click", submitLeave);
qs("btnSubmitAdv").addEventListener("click", submitAdvance);
qs("btnSubmitRegister").addEventListener("click", submitRegister);
qs("btnGoRegister").addEventListener("click", ()=>nav("register"));
qs("btnForgot").addEventListener("click", forgotPassword);
qs("btnLang").addEventListener("click", ()=>{
  state.lang = state.lang==="th" ? "en" : "th";
  localStorage.setItem("pmss_lang", state.lang);
  nav(state.token ? "dashboard" : "login");
});

(async function boot(){
  ensureAuthUI();
  applyI18n();
  await loadCompanies();
  nav(state.token ? "dashboard" : "login");
})();
