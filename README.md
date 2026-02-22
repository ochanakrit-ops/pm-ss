# PM-SS MobilePro v1.5 (Next.js Production MVP)

## Features (MVP)
- Multi-company (tenant by company_id)
- Auth: JWT in HttpOnly cookie
- Roles: HR_ADMIN / TEAM_LEAD / TECH
- Registration -> HR approve -> create user
- Leave request flow + Advance request flow + limit check (FIXED or PERCENT)
- TH/EN toggle (basic)

## Render Deploy
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Env:
  - `DATABASE_URL` = Supabase Session Pooler URI (IPv4) + `?sslmode=require`
  - `JWT_SECRET` = long random string
  - `ADMIN_TOKEN` = any long string (used for /api/admin/migrate)
  - `PORT` is provided by Render automatically

## First time
If your Supabase already has schema/data, skip migration.
If you want to initialize tables on a new DB:
1) set `ADMIN_TOKEN`
2) POST `/api/admin/migrate` with header `x-admin-token: <ADMIN_TOKEN>`
3) Optional seed: POST `/api/admin/seed` with same header

## Default seed user (if you run seed)
- Company: SCP
- HR Admin: hradmin / Pmss@1234
