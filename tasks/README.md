# 📋 Roadmap & Task Tracker Menuju MVP GENIUS UNU 2026

Repositori ini telah memiliki fondasi infrastruktur yang solid:
- Database PostgreSQL berjalan di Docker (Port 5432).
- Backend API (Elysia.js + Drizzle ORM) berjalan di Port 3001.
- Frontend Player (Vue 3) di Port 3000 & Admin (Nuxt 3) di Port 3002.
- Skema database 100% mencakup kebutuhan acara PKKMB 3 hari.

Berikut adalah daftar tugas terstruktur (*actionable tasks*) untuk menyelesaikan implementasi sistem sampai siap digunakan pada hari H (*Production-Ready MVP*):

---

## 🗺️ Matriks Urutan Pengerjaan (Execution Pipeline)

| Kode Task | Nama Modul / Task | Estimasi Scope | Status | File Task |
| :--- | :--- | :--- | :---: | :--- |
| **TASK-001** | Backend API Presensi, FGD Buddy, Ormawa Expo, & Refleksi | Backend Service | ✅ Selesai 100% | [`001_backend_event_flow_apis.md`](./001_backend_event_flow_apis.md) |
| **TASK-002** | Integrasi Frontend User (MABA) dengan Live Auth & State Persistence | Frontend User | 🚀 Siap Dikerjakan | [`002_frontend_user_live_integration.md`](./002_frontend_user_live_integration.md) |
| **TASK-003** | UI Presensi QR Gate & Penjelajah Stand Ormawa Expo di Frontend User | Frontend User | ⏳ Menunggu 002 | [`003_frontend_user_attendance_and_ormawa_features.md`](./003_frontend_user_attendance_and_ormawa_features.md) |
| **TASK-004** | Form Penilaian FGD Buddy & Penyempurnaan QR Center di Frontend Admin | Frontend Admin | 🚀 Siap Dikerjakan | [`004_frontend_admin_fgd_and_qr_integration.md`](./004_frontend_admin_fgd_and_qr_integration.md) |
| **TASK-005** | Sinkronisasi Real-Time WebSocket & Projector Mode Layar Panggung | Fullstack / Realtime | 🟢 Backend Siap / UI Panggung Pending | [`005_realtime_websocket_and_leaderboard_projector.md`](./005_realtime_websocket_and_leaderboard_projector.md) |
| **TASK-006** | Simulasi End-to-End Rundown 3 Hari & Database Backup SOP | Backend & QA | ✅ Selesai 100% (Simulasi Lulus) | [`006_end_to_end_testing_and_readiness.md`](./006_end_to_end_testing_and_readiness.md) |

---

## 🎯 Definisi Selesai (*Definition of Done - MVP*)

Sistem dinyatakan lulus sebagai MVP siap pakai jika:
1. **Hari 1:** MABA dapat login, mengisi profil RPG, dan melakukan presensi QR kedatangan pagi hari. Buddy dapat menginput nilai FGD 1.
2. **Hari 2:** MABA dapat menjelajah 9 lantai, memainkan mini-game pos, memperoleh stempel emas, serta XP tersimpan permanen di PostgreSQL.
3. **Hari 3:** MABA dapat memindai stan pameran UKM/Ormawa dan mengisi kuesioner refleksi kepulangan.
4. **Panitia:** Dashboard Admin memantau progres kelulusan 9 lantai dan leaderboard panggung menampilkan juara secara real-time.

---

## 💎 7 Pilar Konsep Emas Acara yang Diterapkan di Tasks:

1. **Anti-Titip Absen & Presensi Gate:** Validasi waktu dan pencegahan ganda per hari (+100 XP masuk, +50 XP pulang).
2. **Rubrik Evaluasi Buddy 3 Pilar:** Nilai terstandar berbasis kultur santri: Keaktifan (1-5), Kedalaman Visi (1-5), dan Adab/Etika (1-5).
3. **Ormawa Expo QR Hunting (Hari 3):** Memecah kebekuan maba dengan berburu scan stan UKM, bonus +75 XP (capping maks 10 stand / +750 XP), dan koleksi lencana paspor.
4. **Paspor Digital & Level Progression:** Stempel emas 9 lantai dan penjenjangan resmi: *New You ➔ Explorer ➔ Achiever ➔ Almost There ➔ Upgraded You* + audio 8-bit fanfare.
5. **Freeze Leaderboard & Mode Proyektor:** Kunci skor 1 jam sebelum penutupan dan mode panggung fullscreen untuk closing ceremony.
6. **Crowd Control Rute Kelompok:** Pembagian lantai awal regu agar 1.000+ maba tidak menumpuk di lantai 1.
7. **Zero-Install PWA:** Scanner kamera browser HTML5 tanpa install APK.

