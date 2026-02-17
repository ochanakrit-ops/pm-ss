const { Pool } = require('pg');

function buildPgConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');

  // Supabase pooler typically requires SSL. Setting rejectUnauthorized=false avoids CA issues on free tiers.
  const needsSSL = true;

  return {
    connectionString,
    ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(buildPgConfig());

async function initDb() {
  // Basic schema for MVP
  await pool.query(`
    create table if not exists companies (
      id bigserial primary key,
      code text unique not null,
      name_th text not null,
      name_en text not null,
      created_at timestamptz not null default now()
    );

    create table if not exists users (
      id bigserial primary key,
      company_id bigint not null references companies(id) on delete cascade,
      username text not null,
      password_hash text not null,
      role text not null check (role in ('HR_ADMIN','TEAM_LEAD','TECH')),
      full_name text not null,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      unique(company_id, username)
    );

    create table if not exists registration_requests (
      id bigserial primary key,
      company_id bigint not null references companies(id) on delete cascade,
      full_name text not null,
      phone text,
      email text,
      desired_role text not null check (desired_role in ('TEAM_LEAD','TECH')),
      team_name text,
      salary_monthly numeric(12,2),
      created_at timestamptz not null default now(),
      status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
      hr_note text
    );

    create table if not exists advance_limits (
      id bigserial primary key,
      user_id bigint not null references users(id) on delete cascade,
      limit_type text not null check (limit_type in ('PERCENT','FIXED')),
      percent_of_salary numeric(5,2),
      fixed_amount numeric(12,2),
      updated_at timestamptz not null default now(),
      unique(user_id)
    );

    create table if not exists advance_requests (
      id bigserial primary key,
      user_id bigint not null references users(id) on delete cascade,
      amount numeric(12,2) not null,
      reason text,
      requested_at timestamptz not null default now(),
      status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','PAID')),
      approver_user_id bigint references users(id),
      decided_at timestamptz,
      note text
    );
  `);

  // Seed companies if empty
  const { rows } = await pool.query('select count(*)::int as c from companies');
  if (rows[0].c === 0) {
    await pool.query(
      `insert into companies(code, name_th, name_en)
       values
        ('SCP', 'หจก. เอสซีพี', 'SCP Ltd. Partnership'),
        ('ABC', 'บริษัท เอบีซี', 'ABC Company')
      on conflict do nothing;`
    );
  }

  // Seed an HR admin (optional) if not exists
  // default: company SCP, username hradmin, password Pmss@1234
  const scp = await pool.query('select id from companies where code=$1', ['SCP']);
  if (scp.rowCount) {
    const companyId = scp.rows[0].id;
    const exists = await pool.query('select 1 from users where company_id=$1 and username=$2', [companyId, 'hradmin']);
    if (!exists.rowCount) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('Pmss@1234', 10);
      await pool.query(
        `insert into users(company_id, username, password_hash, role, full_name)
         values($1,$2,$3,'HR_ADMIN','HR Admin')`,
        [companyId, 'hradmin', hash]
      );
    }
  }
}

module.exports = { pool, initDb };
