const express = require("express");
const bcrypt = require("bcryptjs");
const { q } = require("../db");
const { sign } = require("../auth");

const authRouter = express.Router();

authRouter.get("/companies", async (req, res) => {
  const r = await q(`SELECT code, name FROM companies ORDER BY code`);
  res.json(r.rows);
});

authRouter.post("/login", async (req, res) => {
  const { company_code, username, password } = req.body || {};
  if (!company_code || !username || !password) {
    return res.status(400).json({ message: "company_code/username/password required" });
  }

  const c = await q(`SELECT id, code FROM companies WHERE code=$1`, [company_code]);
  if (c.rowCount === 0) return res.status(400).json({ message: "Unknown company code" });
  const company = c.rows[0];

  const u = await q(
    `SELECT id, company_id, username, password_hash, role, full_name, team_id
     FROM users WHERE company_id=$1 AND username=$2`,
    [company.id, username]
  );
  if (u.rowCount === 0) return res.status(401).json({ message: "Invalid credentials" });

  const user = u.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = sign({
    id: user.id,
    company_id: user.company_id,
    company_code: company.code,
    role: user.role,
    username: user.username,
    full_name: user.full_name,
    team_id: user.team_id
  });

  res.json({
    token,
    user: {
      id: user.id,
      company_id: user.company_id,
      company_code: company.code,
      role: user.role,
      username: user.username,
      full_name: user.full_name,
      team_id: user.team_id
    }
  });
});

// Public register
authRouter.post("/register", async (req, res) => {
  const { company_code, full_name, phone, id_card_last4, desired_team, note } = req.body || {};
  if (!company_code || !full_name) return res.status(400).json({ message: "company_code/full_name required" });

  const c = await q(`SELECT id FROM companies WHERE code=$1`, [company_code]);
  if (c.rowCount === 0) return res.status(400).json({ message: "Unknown company code" });

  const r = await q(
    `INSERT INTO registrations (company_id, full_name, phone, id_card_last4, desired_team, note)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, status, created_at`,
    [c.rows[0].id, full_name, phone || null, id_card_last4 || null, desired_team || null, note || null]
  );
  res.json(r.rows[0]);
});

// Forgot password -> create request (HR-managed)
authRouter.post("/forgot-password", async (req, res) => {
  const { company_code, username } = req.body || {};
  if (!company_code || !username) return res.status(400).json({ message: "company_code/username required" });

  const c = await q(`SELECT id FROM companies WHERE code=$1`, [company_code]);
  if (c.rowCount === 0) return res.status(400).json({ message: "Unknown company code" });

  await q(`INSERT INTO password_reset_requests (company_id, username) VALUES ($1,$2)`, [c.rows[0].id, username]);
  res.json({ ok: true });
});

module.exports = { authRouter };
