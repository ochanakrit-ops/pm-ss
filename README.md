# PM-SS MobilePro v1.3 (Full Secure)

This release fixes Render deploy crash and enables baseline security:
- JWT auth middleware (`authRequired`)
- Role-based access control for HR endpoints
- Helmet security headers
- Rate limiting
- CORS allowlist via `CORS_ORIGIN`

## Deploy (Render)
1. Connect GitHub repo
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Add Environment Variables:
   - `DATABASE_URL` (Supabase **Session Pooler** URL + `?sslmode=require`)
   - `JWT_SECRET` (random long string)
   - `CORS_ORIGIN` = your site URL (optional but recommended)

## Supabase
Use **Session pooler** connection string (IPv4 compatible), not direct connection.

## Notes
- Admin endpoints require role: `HR_ADMIN`
- Worker endpoints require authentication (Bearer token)
