# PM-SS MobilePro v1.6 (Production MVP)

โทนสี **น้ำเงิน/เขียว minimal** + รองรับ **Multi-company** + **JWT (httpOnly cookie)** + ทำงานกับ **Supabase Postgres** ได้ทันที

## Features (MVP)
- Multi-company (เลือกบริษัทตอน Login จาก `companies.code`)
- Roles
  - **HR_ADMIN**: approve/reject registration, approve/reject advance/leave (WAIT_HR), handle password reset requests
  - **TEAM_LEADER**: approve/reject advance/leave (WAIT_TL) ในทีมตัวเอง
  - **TECHNICIAN**: สร้างคำขอ Advance/Leave
- API ทำเป็น Next.js Route Handlers (Node runtime) ไม่ต้องแยก backend

## Environment Variables
ตั้งค่าใน Render (Environment) หรือ `.env.local`

- `DATABASE_URL`
  - **สำคัญ**: ถ้า deploy บน Render แล้วเจอ IPv4 issue จาก Supabase ให้ใช้ **Session Pooler** (แท็บ Pooler settings) หรือซื้อ IPv4 add-on ของ Supabase
- `JWT_SECRET`
  - สุ่มยาวๆ เช่น `openssl rand -base64 48`

ตัวอย่าง
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=REPLACE_ME
```

## Local run
```bash
npm install
npm run dev
```

## Render Deploy (แนะนำ)
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Node Version: ใช้ค่า default ได้

> โปรเจกต์ตั้ง `next.config.js` เป็น `output: 'standalone'` แล้ว ดังนั้น `npm start` จะเรียก `node .next/standalone/server.js`

## Database
ใช้ schema ที่คุณให้มาได้เลย (tables: companies, users, teams, registrations, leave_requests, advance_requests, password_reset_requests, ...)

### Seed ตัวอย่าง (optional)
ไฟล์ `scripts/seed.sql` เป็นตัวอย่างสำหรับเริ่มต้น (password_hash เป็น plain text เพื่อให้เริ่มทดสอบเร็ว)

- HR Admin
  - username: `hradmin`
  - password: `Pmss@1234`

> ถ้าคุณต้องการเข้มขึ้น: เปลี่ยน `password_hash` เป็น bcrypt แล้วระบบจะ compare แบบ bcrypt ให้อัตโนมัติ

