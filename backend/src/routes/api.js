const express = require("express");
const bcrypt = require("bcryptjs");
const { requireAuth, requireRole } = require("../auth");
const { q } = require("../db");

const apiRouter = express.Router();
apiRouter.use(requireAuth);

function sameCompany(req, companyId) {
  return Number(req.user.company_id) === Number(companyId);
}

async function getUserAdvanceMax(userId) {
  const r = await q(`SELECT salary, advance_limit_type, advance_limit_value FROM users WHERE id=$1`, [userId]);
  if (r.rowCount === 0) return 0;
  const u = r.rows[0];
  if (u.advance_limit_type === "PCT_SALARY") {
    const sal = Number(u.salary || 0);
    const pct = Number(u.advance_limit_value || 0);
    return Math.floor((sal * pct) / 100);
  }
  return Number(u.advance_limit_value || 0);
}

apiRouter.get("/me", async (req, res) => {
  const r = await q(
    `SELECT id, company_id, username, role, full_name, team_id, salary, advance_limit_type, advance_limit_value
     FROM users WHERE id=$1`,
    [req.user.id]
  );
  res.json(r.rows[0]);
});

apiRouter.get("/teams", requireRole(["HR_ADMIN", "TEAM_LEADER"]), async (req, res) => {
  const r = await q(`SELECT id, name FROM teams WHERE company_id=$1 ORDER BY id`, [req.user.company_id]);
  res.json(r.rows);
});

// HR registrations
apiRouter.get("/hr/registrations", requireRole(["HR_ADMIN"]), async (req, res) => {
  const r = await q(`SELECT * FROM registrations WHERE company_id=$1 ORDER BY id DESC`, [req.user.company_id]);
  res.json(r.rows);
});

apiRouter.post("/hr/registrations/:id/reject", requireRole(["HR_ADMIN"]), async (req, res) => {
  const id = Number(req.params.id);
  const { reason } = req.body || {};

  const r0 = await q(`SELECT company_id FROM registrations WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  if (!sameCompany(req, r0.rows[0].company_id)) return res.status(403).json({ message: "Forbidden" });

  const r = await q(
    `UPDATE registrations
     SET status='REJECTED', reviewed_by=$1, reviewed_at=now(), reject_reason=$2
     WHERE id=$3
     RETURNING *`,
    [req.user.id, reason || "Rejected", id]
  );
  res.json(r.rows[0]);
});

apiRouter.post("/hr/registrations/:id/approve-create-user", requireRole(["HR_ADMIN"]), async (req, res) => {
  const id = Number(req.params.id);
  const { username, password, role, team_id, salary, limit_type, limit_value, full_name_override } = req.body || {};

  if (!username || !password || !role) return res.status(400).json({ message: "username/password/role required" });
  if (!["TECHNICIAN", "TEAM_LEADER"].includes(role)) return res.status(400).json({ message: "role must be TECHNICIAN or TEAM_LEADER" });
  if (!team_id) return res.status(400).json({ message: "team_id required" });

  const r0 = await q(`SELECT * FROM registrations WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  const reg = r0.rows[0];
  if (!sameCompany(req, reg.company_id)) return res.status(403).json({ message: "Forbidden" });

  const t = await q(`SELECT id FROM teams WHERE id=$1 AND company_id=$2`, [team_id, req.user.company_id]);
  if (t.rowCount === 0) return res.status(400).json({ message: "Invalid team_id" });

  const passHash = await bcrypt.hash(password, 10);
  const fullName = (full_name_override && String(full_name_override).trim())
    ? String(full_name_override).trim()
    : reg.full_name;

  const lt = (limit_type === "PCT_SALARY") ? "PCT_SALARY" : "FIXED";
  const lv = Number(limit_value || 0);
  const sal = salary === null || salary === undefined || salary === "" ? null : Number(salary);

  try {
    const u = await q(
      `INSERT INTO users (company_id, team_id, username, password_hash, role, full_name, salary, advance_limit_type, advance_limit_value)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, username, role, full_name, team_id`,
      [req.user.company_id, Number(team_id), username, passHash, role, fullName, sal, lt, lv]
    );

    await q(`UPDATE registrations SET status='APPROVED', reviewed_by=$1, reviewed_at=now() WHERE id=$2`, [req.user.id, id]);

    res.json({ ok: true, user: u.rows[0] });
  } catch (e) {
    if (String(e.message).includes("duplicate key")) return res.status(400).json({ message: "Username already exists in this company" });
    throw e;
  }
});

// HR users + reset password
apiRouter.get("/hr/users", requireRole(["HR_ADMIN"]), async (req, res) => {
  const r = await q(
    `SELECT u.id, u.username, u.role, u.full_name, u.team_id, t.name as team_name,
            u.salary, u.advance_limit_type, u.advance_limit_value
     FROM users u
     LEFT JOIN teams t ON t.id=u.team_id
     WHERE u.company_id=$1
     ORDER BY u.role, u.username`,
    [req.user.company_id]
  );
  res.json(r.rows);
});

apiRouter.post("/hr/users/:id/reset-password", requireRole(["HR_ADMIN"]), async (req, res) => {
  const id = Number(req.params.id);
  const { new_password } = req.body || {};
  if (!new_password) return res.status(400).json({ message: "new_password required" });

  const r0 = await q(`SELECT company_id FROM users WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  if (!sameCompany(req, r0.rows[0].company_id)) return res.status(403).json({ message: "Forbidden" });

  const hash = await bcrypt.hash(new_password, 10);
  await q(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hash, id]);
  res.json({ ok: true });
});

// HR reset requests list + mark done
apiRouter.get("/hr/password-resets", requireRole(["HR_ADMIN"]), async (req, res) => {
  const r = await q(`SELECT * FROM password_reset_requests WHERE company_id=$1 ORDER BY id DESC`, [req.user.company_id]);
  res.json(r.rows);
});

apiRouter.post("/hr/password-resets/:id/mark-done", requireRole(["HR_ADMIN"]), async (req, res) => {
  const id = Number(req.params.id);

  const r0 = await q(`SELECT company_id FROM password_reset_requests WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  if (!sameCompany(req, r0.rows[0].company_id)) return res.status(403).json({ message: "Forbidden" });

  const r = await q(
    `UPDATE password_reset_requests
     SET status='DONE', hr_done_by=$1, hr_done_at=now()
     WHERE id=$2
     RETURNING *`,
    [req.user.id, id]
  );
  res.json(r.rows[0]);
});

// Leave
apiRouter.get("/leaves/my", async (req, res) => {
  const r = await q(
    `SELECT lr.*, t.name as team_name
     FROM leave_requests lr
     JOIN teams t ON t.id=lr.team_id
     WHERE lr.company_id=$1 AND lr.employee_id=$2
     ORDER BY lr.id DESC`,
    [req.user.company_id, req.user.id]
  );
  res.json(r.rows);
});

apiRouter.post("/leaves", async (req, res) => {
  const { leave_type, start_date, end_date, note } = req.body || {};
  if (!leave_type || !start_date || !end_date) return res.status(400).json({ message: "leave_type/start_date/end_date required" });
  if (!req.user.team_id) return res.status(400).json({ message: "No team assigned" });

  const r = await q(
    `INSERT INTO leave_requests (company_id, employee_id, team_id, leave_type, start_date, end_date, note, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'WAIT_TL') RETURNING *`,
    [req.user.company_id, req.user.id, req.user.team_id, leave_type, start_date, end_date, note || null]
  );
  res.json(r.rows[0]);
});

apiRouter.get("/leaves/pending", requireRole(["HR_ADMIN","TEAM_LEADER"]), async (req, res) => {
  if (req.user.role === "TEAM_LEADER" && !req.user.team_id) return res.json([]);
  const params = [req.user.company_id];
  let sql = `
    SELECT lr.*, u.full_name as employee_name, t.name as team_name
    FROM leave_requests lr
    JOIN users u ON u.id=lr.employee_id
    JOIN teams t ON t.id=lr.team_id
    WHERE lr.company_id=$1 AND lr.status IN ('WAIT_TL','WAIT_HR')
  `;
  if (req.user.role === "TEAM_LEADER") { sql += ` AND lr.team_id=$2`; params.push(req.user.team_id); }
  sql += ` ORDER BY lr.id DESC`;
  const r = await q(sql, params);
  res.json(r.rows);
});

apiRouter.post("/leaves/:id/approve", requireRole(["HR_ADMIN","TEAM_LEADER"]), async (req, res) => {
  const id = Number(req.params.id);
  const r0 = await q(`SELECT * FROM leave_requests WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  const row = r0.rows[0];
  if (!sameCompany(req, row.company_id)) return res.status(403).json({ message: "Forbidden" });

  if (req.user.role === "TEAM_LEADER") {
    if (row.team_id !== req.user.team_id) return res.status(403).json({ message: "Forbidden (different team)" });
    if (row.status !== "WAIT_TL") return res.status(400).json({ message: "Status must be WAIT_TL" });
    await q(`UPDATE leave_requests SET status='WAIT_HR', tl_approved_by=$1, tl_approved_at=now(), updated_at=now() WHERE id=$2`, [req.user.id, id]);
  } else {
    if (row.status !== "WAIT_HR") return res.status(400).json({ message: "Status must be WAIT_HR" });
    await q(`UPDATE leave_requests SET status='APPROVED', hr_approved_by=$1, hr_approved_at=now(), updated_at=now() WHERE id=$2`, [req.user.id, id]);
  }

  const r = await q(`SELECT * FROM leave_requests WHERE id=$1`, [id]);
  res.json(r.rows[0]);
});

apiRouter.post("/leaves/:id/reject", requireRole(["HR_ADMIN","TEAM_LEADER"]), async (req, res) => {
  const id = Number(req.params.id);
  const { reason } = req.body || {};

  const r0 = await q(`SELECT * FROM leave_requests WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  const row = r0.rows[0];
  if (!sameCompany(req, row.company_id)) return res.status(403).json({ message: "Forbidden" });

  if (req.user.role === "TEAM_LEADER") {
    if (row.team_id !== req.user.team_id) return res.status(403).json({ message: "Forbidden (different team)" });
    if (row.status !== "WAIT_TL") return res.status(400).json({ message: "Status must be WAIT_TL" });
  }

  await q(`UPDATE leave_requests SET status='REJECTED', reject_reason=$1, updated_at=now() WHERE id=$2`, [reason || "Rejected", id]);

  const r = await q(`SELECT * FROM leave_requests WHERE id=$1`, [id]);
  res.json(r.rows[0]);
});

// Advance
apiRouter.get("/advances/max", async (req, res) => {
  const max = await getUserAdvanceMax(req.user.id);
  res.json({ max });
});

apiRouter.get("/advances/my", async (req, res) => {
  const r = await q(
    `SELECT ar.*, t.name as team_name
     FROM advance_requests ar
     JOIN teams t ON t.id=ar.team_id
     WHERE ar.company_id=$1 AND ar.employee_id=$2
     ORDER BY ar.id DESC`,
    [req.user.company_id, req.user.id]
  );
  res.json(r.rows);
});

apiRouter.post("/advances", async (req, res) => {
  const { amount, reason } = req.body || {};
  const amt = Number(amount);
  if (!amt || amt <= 0 || !reason) return res.status(400).json({ message: "amount>0 and reason required" });
  if (!req.user.team_id) return res.status(400).json({ message: "No team assigned" });

  const max = await getUserAdvanceMax(req.user.id);
  if (max > 0 && amt > max) return res.status(400).json({ message: `Amount exceeds your limit (max ${max})` });

  const r = await q(
    `INSERT INTO advance_requests (company_id, employee_id, team_id, amount, reason, status)
     VALUES ($1,$2,$3,$4,$5,'WAIT_TL') RETURNING *`,
    [req.user.company_id, req.user.id, req.user.team_id, amt, reason]
  );
  res.json(r.rows[0]);
});

apiRouter.get("/advances/pending", requireRole(["HR_ADMIN","TEAM_LEADER"]), async (req, res) => {
  if (req.user.role === "TEAM_LEADER" && !req.user.team_id) return res.json([]);
  const params = [req.user.company_id];
  let sql = `
    SELECT ar.*, u.full_name as employee_name, t.name as team_name
    FROM advance_requests ar
    JOIN users u ON u.id=ar.employee_id
    JOIN teams t ON t.id=ar.team_id
    WHERE ar.company_id=$1 AND ar.status IN ('WAIT_TL','WAIT_HR')
  `;
  if (req.user.role === "TEAM_LEADER") { sql += ` AND ar.team_id=$2`; params.push(req.user.team_id); }
  sql += ` ORDER BY ar.id DESC`;
  const r = await q(sql, params);
  res.json(r.rows);
});

apiRouter.post("/advances/:id/approve", requireRole(["HR_ADMIN","TEAM_LEADER"]), async (req, res) => {
  const id = Number(req.params.id);
  const r0 = await q(`SELECT * FROM advance_requests WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  const row = r0.rows[0];
  if (!sameCompany(req, row.company_id)) return res.status(403).json({ message: "Forbidden" });

  if (req.user.role === "TEAM_LEADER") {
    if (row.team_id !== req.user.team_id) return res.status(403).json({ message: "Forbidden (different team)" });
    if (row.status !== "WAIT_TL") return res.status(400).json({ message: "Status must be WAIT_TL" });
    await q(`UPDATE advance_requests SET status='WAIT_HR', tl_approved_by=$1, tl_approved_at=now(), updated_at=now() WHERE id=$2`, [req.user.id, id]);
  } else {
    if (row.status !== "WAIT_HR") return res.status(400).json({ message: "Status must be WAIT_HR" });
    await q(`UPDATE advance_requests SET status='APPROVED', hr_approved_by=$1, hr_approved_at=now(), updated_at=now() WHERE id=$2`, [req.user.id, id]);
  }

  const r = await q(`SELECT * FROM advance_requests WHERE id=$1`, [id]);
  res.json(r.rows[0]);
});

apiRouter.post("/advances/:id/reject", requireRole(["HR_ADMIN","TEAM_LEADER"]), async (req, res) => {
  const id = Number(req.params.id);
  const { reason } = req.body || {};

  const r0 = await q(`SELECT * FROM advance_requests WHERE id=$1`, [id]);
  if (r0.rowCount === 0) return res.status(404).json({ message: "Not found" });
  const row = r0.rows[0];
  if (!sameCompany(req, row.company_id)) return res.status(403).json({ message: "Forbidden" });

  if (req.user.role === "TEAM_LEADER") {
    if (row.team_id !== req.user.team_id) return res.status(403).json({ message: "Forbidden (different team)" });
    if (row.status !== "WAIT_TL") return res.status(400).json({ message: "Status must be WAIT_TL" });
  }

  await q(`UPDATE advance_requests SET status='REJECTED', reject_reason=$1, updated_at=now() WHERE id=$2`, [reason || "Rejected", id]);

  const r = await q(`SELECT * FROM advance_requests WHERE id=$1`, [id]);
  res.json(r.rows[0]);
});

module.exports = { apiRouter };
