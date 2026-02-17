export const dict = {
  th: {
    appName: 'PM-SS',
    dashboard: 'แดชบอร์ด',
    login: 'เข้าสู่ระบบ',
    register: 'ลงทะเบียน (สมัครใช้งาน)',
    forgot: 'ลืมรหัสผ่าน',
    company: 'บริษัท',
    username: 'ชื่อผู้ใช้',
    password: 'รหัสผ่าน',
    hello: 'สวัสดี',
    ready: 'พร้อมใช้งาน',
    online: 'ออนไลน์',
    offline: 'ออฟไลน์',
    queued: 'คิวออฟไลน์',
    switchLang: 'สลับภาษา',
    syncNow: 'ซิงก์ข้อมูลที่ค้าง',

    // HR dashboard
    welcome: 'ยินดีต้อนรับ',
    pendingRegs: 'คำขอลงทะเบียนรออนุมัติ',
    status: 'สถานะ',
    noData: 'ไม่มีข้อมูล',

    // Mobile Pro (v1.1)
    home: 'หน้าแรก',
    requests: 'คำขอ',
    advance: 'เบิกล่วงหน้า',
    profile: 'โปรไฟล์',
    more: 'อื่นๆ',
    comingSoon: 'กำลังทำ (Coming soon) — เวอร์ชัน MVP จะปล่อยฟีเจอร์เต็มใน v1.2',
    requestsMvpNote: 'ตอนนี้หน้านี้เป็นโครงไว้ก่อน เพื่อให้ช่างเริ่มทดลองใช้งาน Flow ได้',
    advanceMvpNote: 'ใน v1.2 จะเพิ่มฟอร์มเบิก + เงื่อนไขวงเงิน (x% เงินเดือน / วงเงินต่อคน)',
    profileNote: 'ข้อมูลนี้ดึงจาก token/login (MVP) — v1.2 จะเชื่อม Employee Profile',
    fullName: 'ชื่อ-สกุล',
    role: 'สิทธิ์',
    logout: 'ออกจากระบบ',

    advanceReq: 'ขอเบิกล่วงหน้า',
    advanceReqHint: 'สำหรับค่าใช้จ่ายระหว่างงาน',
    leaveReq: 'ขอลา',
    leaveReqHint: 'ลาป่วย / ลากิจ / ลาพักร้อน',
    myRequests: 'รายการของฉัน',
    myRequestsHint: 'ดูสถานะคำขอทั้งหมด',

    // Offline
    savedOffline: 'บันทึกแบบออฟไลน์แล้ว รอซิงก์ตอนออนไลน์',
  },
  en: {
    appName: 'PM-SS',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    forgot: 'Forgot password',
    company: 'Company',
    username: 'Username',
    password: 'Password',
    hello: 'Hello',
    ready: 'Ready',
    online: 'Online',
    offline: 'Offline',
    queued: 'Offline queue',
    switchLang: 'Switch language',
    syncNow: 'Sync pending data',

    welcome: 'Welcome',
    pendingRegs: 'Pending registrations',
    status: 'Status',
    noData: 'No data',

    home: 'Home',
    requests: 'Requests',
    advance: 'Advance',
    profile: 'Profile',
    more: 'More',
    comingSoon: 'Coming soon — MVP will deliver full features in v1.2',
    requestsMvpNote: 'This page is a skeleton for trial usage and user flow validation.',
    advanceMvpNote: 'v1.2 will add advance form and limit rules (x% of salary / per-user limit).',
    profileNote: 'MVP reads from login token — v1.2 will connect to Employee Profile.',
    fullName: 'Full name',
    role: 'Role',
    logout: 'Logout',

    advanceReq: 'Request advance',
    advanceReqHint: 'For job-related expenses',
    leaveReq: 'Request leave',
    leaveReqHint: 'Sick / Personal / Vacation',
    myRequests: 'My requests',
    myRequestsHint: 'Track all request statuses',

    savedOffline: 'Saved offline. Will sync when online.',
  },
};

export function t(lang, key) {
  return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
}