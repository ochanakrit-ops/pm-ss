# PM-SS (PM Self Service) – SPA (React + Vite) + Node (Express) + Supabase

## Default demo user
- Company: **SCP**
- Username: **hradmin**
- Password: **Pmss@1234**

## Local run
```bash
npm install
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:10000

## Render (Single Web Service)
**Build Command**
```bash
npm install && npm run build
```

**Start Command**
```bash
npm start
```

**Environment Variables (Render)**
- `DATABASE_URL` : Supabase **Session pooler** connection string (IPv4 compatible)
- `JWT_SECRET` : any long random string

## Notes
- Backend serves the SPA build from `frontend/dist`.
- All non-`/api/*` routes fallback to `index.html` for SPA routing.
