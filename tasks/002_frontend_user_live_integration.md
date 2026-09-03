# 📑 TASK-002: Integrasi Frontend User (MABA) dengan Live Auth, Paspor Digital, & Level Progression

* **Status:** ⏳ Menunggu TASK-001
* **Target Komponen:** `frontend/user/src/store/gameStore.ts`, `frontend/user/src/views/`, `frontend/user/src/lib/api.ts`
* **Prinsip:** Mengubah frontend mahasiswa dari sekadar prototipe memori statis menjadi aplikasi game RPG yang terhubung live ke PostgreSQL, lengkap dengan audio 8-bit dan level progression bertingkat.

---

## 🎯 Tujuan
1. Menyimpan seluruh progres petualangan MABA (stempel paspor, XP, dan riwayat game) secara persisten di database.
2. Mengintegrasikan sistem penjenjangan level RPG resmi PKKMB: **New You ➔ Explorer ➔ Achiever ➔ Almost There ➔ Upgraded You**.
3. Memberikan umpan balik visual (*confetti*, *gold stamp*) dan audio 8-bit saat rintangan pos ditaklukkan.

---

## 🛠️ Rincian Fitur & Alur Kerja

### 1. Sistem Autentikasi & Onboarding Terintegrasi
* Menyediakan form login cepat di awal aplikasi:
  * Masukkan NIM / Akun Demo (misal: `peserta_1` s/d `peserta_5`, password default `genius2026`).
  * Simpan JWT Token di `localStorage`.
* Saat pertama kali masuk (Hari 1):
  * MABA memilih Karakter RPG (8 Kelas: *Cyber Knight, Tech Mage, Code Archer, Data Alchemist, Shadow Assassin, Quantum Scholar, Mecha Paladin, Runic Engineer*).
  * Karakter langsung aktif dengan atribut dasar (STR, INT, AGI, VIT, WIS).

### 2. Paspor Digital 9 Lantai & Stempel Emas
* Memperbarui `PasporView.vue`:
  * Mengambil data stempel riil dari server (`/api/scores` atau `/api/game-sessions`).
  * Menampilkan 9 slot lantai dengan stempel emas berkilau jika pos telah lulus (ambang batas skor minimal 70%).
  * Menampilkan tanggal perolehan stempel dan nama pos yang diselesaikan.

### 3. Logika Penjenjangan Level "Upgrade New U"
Tingkatan level dihitung otomatis berdasarkan jumlah lantai yang telah diselesaikan:
```text
+-------------------+-----------------------+---------------------------------------+
| LEVEL             | PERSYARATAN           | EFEK VISUAL RPG                       |
+-------------------+-----------------------+---------------------------------------+
| 🌱 New You        | 0 - 1 Lantai Selesai  | Karakter Novice, Aura Dasar           |
| 🧭 Explorer       | 2 - 3 Lantai Selesai  | Badge Penjelajah, +10% Speed          |
| ⚡ Achiever       | 4 - 5 Lantai Selesai  | Border Karakter Perak, Aura Biru      |
| 🔥 Almost There   | 6 - 8 Lantai Selesai  | Border Karakter Emas, Aura Ungu       |
| 👑 Upgraded You   | 9 Lantai Tuntas       | Mahkota Transformasi, Golden Fanfare  |
+-------------------+-----------------------+---------------------------------------+
```
* Ketika mencapai level baru, putar suara `playLevelUp()` dari Web Audio Engine dan picu animasi `canvas-confetti`.

### 4. Pemandu Rute Kelompok (Crowd Control Helper)
* Agar 1.000+ maba tidak menumpuk di Lantai 1:
  * Dashboard MABA menampilkan banner panduan: *"Rute Regu Anda: Mulai Eksplorasi dari Lantai 3 (Pos B3-A)"*.
  * Informasi ini diambil dari rute kelompok (`team.routeId`) yang ditetapkan panitia.

### 5. Respon Status "Freeze Leaderboard"
* Jika panitia mengaktifkan *Freeze Leaderboard*, halaman papan peringkat MABA menampilkan pita (*banner*) informatif:
  > *"🔒 Papan Peringkat Sementara Dibekukan untuk Penganugerahan Grand Final Awarding di Hall Utama!"*

---

## ✅ Checklist Pengerjaan
- [ ] Buat dialog/halaman login peserta yang tersambung ke `POST /api/auth/login`.
- [ ] Modifikasi `gameStore.ts` agar menyinkronkan stempel dan total XP dari PostgreSQL saat dibuka.
- [ ] Hubungkan `completeBooth()` ke endpoint submit skor server.
- [ ] Terapkan kalkulasi level resmi (5 tingkatan dari *New You* s/d *Upgraded You*).
- [ ] Integrasikan sound effect 8-bit saat stempel pos berhasil diraih.
- [ ] Tampilkan banner rute awal kelompok mahasiswa untuk membantu ketertiban gedung.
