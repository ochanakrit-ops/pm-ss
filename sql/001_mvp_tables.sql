-- Idempotent MVP schema (safe to run multiple times)
CREATE TABLE IF NOT EXISTS public.companies (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_th text,
  name_en text
);

CREATE TABLE IF NOT EXISTS public.teams (
  id serial PRIMARY KEY,
  company_id integer NOT NULL REFERENCES public.companies(id),
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users (
  id serial PRIMARY KEY,
  company_id integer NOT NULL REFERENCES public.companies(id),
  team_id integer REFERENCES public.teams(id),
  username text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['HR_ADMIN','TEAM_LEAD','TECH'])),
  full_name text NOT NULL,
  salary integer CHECK (salary IS NULL OR salary >= 0),
  full_name_th text,
  full_name_en text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, username)
);

CREATE TABLE IF NOT EXISTS public.registration_requests (
  id bigserial PRIMARY KEY,
  company_id bigint NOT NULL REFERENCES public.companies(id),
  full_name text NOT NULL,
  phone text,
  email text,
  desired_role text NOT NULL CHECK (desired_role = ANY (ARRAY['TEAM_LEAD','TECH'])),
  team_name text,
  salary_monthly numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status = ANY (ARRAY['PENDING','APPROVED','REJECTED'])),
  hr_note text
);

CREATE TABLE IF NOT EXISTS public.advance_limits (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL UNIQUE REFERENCES public.users(id),
  limit_type text NOT NULL CHECK (limit_type = ANY (ARRAY['PERCENT','FIXED'])),
  percent_of_salary numeric,
  fixed_amount numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id serial PRIMARY KEY,
  company_id integer NOT NULL REFERENCES public.companies(id),
  employee_id integer NOT NULL REFERENCES public.users(id),
  team_id integer NOT NULL REFERENCES public.teams(id),
  leave_type text NOT NULL CHECK (leave_type = ANY (ARRAY['SICK','PERSONAL','VACATION'])),
  start_date date NOT NULL,
  end_date date NOT NULL,
  note text,
  status text NOT NULL CHECK (status = ANY (ARRAY['WAIT_TL','WAIT_HR','APPROVED','REJECTED'])),
  tl_approved_by integer REFERENCES public.users(id),
  tl_approved_at timestamptz,
  hr_approved_by integer REFERENCES public.users(id),
  hr_approved_at timestamptz,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.advance_requests (
  id serial PRIMARY KEY,
  company_id integer NOT NULL REFERENCES public.companies(id),
  employee_id integer NOT NULL REFERENCES public.users(id),
  team_id integer NOT NULL REFERENCES public.teams(id),
  amount integer NOT NULL CHECK (amount > 0),
  reason text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['WAIT_TL','WAIT_HR','APPROVED','REJECTED'])),
  tl_approved_by integer REFERENCES public.users(id),
  tl_approved_at timestamptz,
  hr_approved_by integer REFERENCES public.users(id),
  hr_approved_at timestamptz,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id serial PRIMARY KEY,
  company_id integer NOT NULL REFERENCES public.companies(id),
  username text NOT NULL,
  status text NOT NULL DEFAULT 'WAIT_HR' CHECK (status = ANY (ARRAY['WAIT_HR','DONE'])),
  hr_done_by integer REFERENCES public.users(id),
  hr_done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
