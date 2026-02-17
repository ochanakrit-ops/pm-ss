const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const { pool, initDb } = require('./db');
const { signToken, authMiddleware, requireRole } = require('./auth');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- API ---
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('select 1 as ok');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/companies', async (req, res) => {
  const r = await pool.query('select code, name_th as "nameTh", name_en as "nameEn" from companies order by code');
  res.json(r.rows);
});

app.post('/api/auth/login', async (req, res) => {
  const { companyCode, username, password } = req.body || {};
  if (!companyCode || !username || !password) return res.status(400).json({ message: 'Missing fields' });

  const c = await pool.query('select id from companies where code=$1', [companyCode]);
  if (!c.rowCount) return res.status(404).json({ message: 'Company not found' });

  const u = await pool.query(
    'select id, username, password_hash, role, full_name from users where company_id=$1 and username=$2 and is_active=true',
    [c.rows[0].id, username]
  );
  if (!u.rowCount) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, u.rows[0].password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({
    userId: u.rows[0].id,
    companyCode,
    role: u.rows[0].role,
    fullName: u.rows[0].full_name,
    username: u.rows[0].username,
  });

  res.json({ token });
});

app.get('/api/auth/me', authMiddleware(true), async (req, res) => {
  res.json({
    userId: req.user.userId,
    companyCode: req.user.companyCode,
    role: req.user.role,
    fullName: req.user.fullName,
    username: req.user.username,
  });
});

app.post('/api/register-requests', async (req, res) => {
  const { companyCode, fullName, phone, email, desiredRole, teamName, salaryMonthly } = req.body || {};
  if (!companyCode || !fullName || !desiredRole) return res.status(400).json({ message: 'Missing fields' });

  const c = await pool.query('select id from companies where code=$1', [companyCode]);
  if (!c.rowCount) return res.status(404).json({ message: 'Company not found' });

  const r = await pool.query(
    `insert into registration_requests(company_id, full_name, phone, email, desired_role, team_name, salary_monthly)
     values($1,$2,$3,$4,$5,$6,$7)
     returning id, status, created_at as "createdAt"`,
    [c.rows[0].id, fullName, phone || null, email || null, desiredRole, teamName || null, salaryMonthly || null]
  );
  res.status(201).json(r.rows[0]);
});

// HR Admin: list + approve requests, create users
app.get('/api/admin/registration-requests', authMiddleware(true), requireRole('HR_ADMIN'), async (req, res) => {
  const c = await pool.query('select id from companies where code=$1', [req.user.companyCode]);
  const r = await pool.query(
    `select id, full_name as "fullName", phone, email, desired_role as "desiredRole", team_name as "teamName",
            salary_monthly as "salaryMonthly", status, created_at as "createdAt", hr_note as "hrNote"
     from registration_requests
     where company_id=$1
     order by created_at desc`,
    [c.rows[0].id]
  );
  res.json(r.rows);
});

app.post('/api/admin/users', authMiddleware(true), requireRole('HR_ADMIN'), async (req, res) => {
  const { username, password, role, fullName, requestId } = req.body || {};
  if (!username || !password || !role || !fullName) return res.status(400).json({ message: 'Missing fields' });

  const c = await pool.query('select id from companies where code=$1', [req.user.companyCode]);
  const companyId = c.rows[0].id;

  const hash = await bcrypt.hash(password, 10);
  const u = await pool.query(
    `insert into users(company_id, username, password_hash, role, full_name)
     values($1,$2,$3,$4,$5)
     returning id, username, role, full_name as "fullName"`,
    [companyId, username, hash, role, fullName]
  );

  if (requestId) {
    await pool.query('update registration_requests set status=$1 where id=$2 and company_id=$3', ['APPROVED', requestId, companyId]);
  }

  res.status(201).json(u.rows[0]);
});

// Password reset (simple admin reset for MVP)
app.post('/api/auth/reset-password', authMiddleware(true), async (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword) return res.status(400).json({ message: 'Missing newPassword' });
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('update users set password_hash=$1 where id=$2', [hash, req.user.userId]);
  res.json({ ok: true });
});

// --- Serve SPA build ---
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// Client-side routing fallback (exclude /api)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 10000;

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`PM-SS running on port ${port}`);
    });
  })
  .catch((e) => {
    console.error('DB init failed', e);
    process.exit(1);
  });
