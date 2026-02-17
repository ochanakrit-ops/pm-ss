const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : undefined,
});

async function q(text, params) {
  return pool.query(text, params);
}

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.error("? DATABASE_URL is not set");
    process.exit(1);
  }

  await q(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      name TEXT NOT NULL,
      UNIQUE(company_id, name)
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      team_id INTEGER NULL REFERENCES teams(id),
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('HR_ADMIN','TEAM_LEADER','TECHNICIAN')),
      full_name TEXT NOT NULL,
      salary INTEGER NULL CHECK (salary IS NULL OR salary >= 0),
      advance_limit_type TEXT NOT NULL DEFAULT 'FIXED' CHECK (advance_limit_type IN ('FIXED','PCT_SALARY')),
      advance_limit_value INTEGER NOT NULL DEFAULT 0 CHECK (advance_limit_value >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(company_id, username)
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      desired_team TEXT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NULL,
      id_card_last4 TEXT NULL,
      note TEXT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
      reviewed_by INTEGER NULL REFERENCES users(id),
      reviewed_at TIMESTAMPTZ NULL,
      reject_reason TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS password_reset_requests (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      username TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'WAIT_HR' CHECK (status IN ('WAIT_HR','DONE')),
      hr_done_by INTEGER NULL REFERENCES users(id),
      hr_done_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      employee_id INTEGER NOT NULL REFERENCES users(id),
      team_id INTEGER NOT NULL REFERENCES teams(id),
      leave_type TEXT NOT NULL CHECK (leave_type IN ('SICK','PERSONAL','VACATION')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      note TEXT NULL,
      status TEXT NOT NULL CHECK (status IN ('WAIT_TL','WAIT_HR','APPROVED','REJECTED')),
      tl_approved_by INTEGER NULL REFERENCES users(id),
      tl_approved_at TIMESTAMPTZ NULL,
      hr_approved_by INTEGER NULL REFERENCES users(id),
      hr_approved_at TIMESTAMPTZ NULL,
      reject_reason TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NULL
    );

    CREATE TABLE IF NOT EXISTS advance_requests (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      employee_id INTEGER NOT NULL REFERENCES users(id),
      team_id INTEGER NOT NULL REFERENCES teams(id),
      amount INTEGER NOT NULL CHECK (amount > 0),
      reason TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('WAIT_TL','WAIT_HR','APPROVED','REJECTED')),
      tl_approved_by INTEGER NULL REFERENCES users(id),
      tl_approved_at TIMESTAMPTZ NULL,
      hr_approved_by INTEGER NULL REFERENCES users(id),
      hr_approved_at TIMESTAMPTZ NULL,
      reject_reason TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NULL
    );
  `);

  const c = await q(`SELECT COUNT(1)::int AS n FROM companies`);
  if (c.rows[0].n === 0) await seed();

  console.log("? DB ready (PostgreSQL)");
}

async function seed() {
  await q(`INSERT INTO companies (code, name) VALUES ('SCP','???. SCP'), ('ABC','???. ABC')`);

  const scp = (await q(`SELECT id FROM companies WHERE code='SCP'`)).rows[0].id;
  const abc = (await q(`SELECT id FROM companies WHERE code='ABC'`)).rows[0].id;

  const scpTeams = ["Team 1","Team 2","Team 3","Team 4","Team 5"];
  for (const t of scpTeams) await q(`INSERT INTO teams (company_id, name) VALUES ($1,$2)`, [scp, t]);
  await q(`INSERT INTO teams (company_id, name) VALUES ($1,'Team A'), ($1,'Team B')`, [abc]);

  const pw = await bcrypt.hash("Password1!", 10);

  const team1 = (await q(`SELECT id FROM teams WHERE company_id=$1 AND name='Team 1'`, [scp])).rows[0].id;

  // SCP users
  await q(
    `INSERT INTO users (company_id, team_id, username, password_hash, role, full_name, salary, advance_limit_type, advance_limit_value)
     VALUES ($1,NULL,'hr.admin',$2,'HR_ADMIN','HR Admin',NULL,'FIXED',0)`,
    [scp, pw]
  );
  await q(
    `INSERT INTO users (company_id, team_id, username, password_hash, role, full_name, salary, advance_limit_type, advance_limit_value)
     VALUES ($1,$3,'tl.a',$2,'TEAM_LEADER','Team Leader A',30000,'PCT_SALARY',20)`,
    [scp, pw, team1]
  );
  await q(
    `INSERT INTO users (company_id, team_id, username, password_hash, role, full_name, salary, advance_limit_type, advance_limit_value)
     VALUES ($1,$3,'tech.a1',$2,'TECHNICIAN','Technician A1',20000,'PCT_SALARY',15)`,
    [scp, pw, team1]
  );

  // ABC users
  const teamA = (await q(`SELECT id FROM teams WHERE company_id=$1 AND name='Team A'`, [abc])).rows[0].id;
  await q(
    `INSERT INTO users (company_id, team_id, username, password_hash, role, full_name, salary, advance_limit_type, advance_limit_value)
     VALUES ($1,NULL,'hr.admin',$2,'HR_ADMIN','HR Admin',NULL,'FIXED',0)`,
    [abc, pw]
  );
  await q(
    `INSERT INTO users (company_id, team_id, username, password_hash, role, full_name, salary, advance_limit_type, advance_limit_value)
     VALUES ($1,$3,'tl.a',$2,'TEAM_LEADER','Team Leader A',35000,'PCT_SALARY',20)`,
    [abc, pw, teamA]
  );
  await q(
    `INSERT INTO users (company_id, team_id, username, password_hash, role, full_name, salary, advance_limit_type, advance_limit_value)
     VALUES ($1,$3,'tech.a1',$2,'TECHNICIAN','Technician A1',22000,'PCT_SALARY',15)`,
    [abc, pw, teamA]
  );

  // Seed one leave
  const techId = (await q(`SELECT id FROM users WHERE company_id=$1 AND username='tech.a1'`, [scp])).rows[0].id;
  await q(
    `INSERT INTO leave_requests (company_id, employee_id, team_id, leave_type, start_date, end_date, note, status)
     VALUES ($1,$2,$3,'SICK','2026-02-16','2026-02-16','Sore throat','WAIT_TL')`,
    [scp, techId, team1]
  );
}

module.exports = { q, initDb };
