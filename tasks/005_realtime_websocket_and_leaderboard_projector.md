# 📑 TASK-005: Sinkronisasi Real-Time WebSocket, Projector Mode, & Freeze Leaderboard

* **Status:** ⏳ Menunggu TASK-002 & TASK-004
* **Target Komponen:** `backend/src/realtime/`, `frontend/admin/pages/leaderboard.vue`, `frontend/user/src/views/LeaderboardView.vue`
* **Prinsip:** Menghidupkan atmosfer kompetisi panggung utama dengan siaran langsung perolehan poin dan mode panggung akbar (*Grand Stage Theater Mode*).

---

## 🎯 Tujuan
1. Menghubungkan client browser dengan WebSocket natif Elysia.js di `ws://localhost:3001/ws` untuk pembaruan skor live tanpa jeda.
2. Menyediakan **Mode Proyektor Panggung Akbar** untuk layar LED Hall Utama saat penutupan acara.
3. Mengimplementasikan fitur **"Freeze Leaderboard"** bagi panitia untuk mengunci tampilan skor publik menjelang pengumuman pemenang.

---

## 🛠️ Rincian Fitur yang Akan Dibangun

### 1. Sinkronisasi Real-Time WebSocket Backend
* Di `backend/src/realtime/index.ts`:
  * Setiap kali event pencatatan skor berhasil (kuis pos selesai, evaluasi FGD masuk, atau scan UKM tersimpan):
  * Server otomatis memicu `broadcastLeaderboardUpdate()`.
  * Seluruh client yang mendengarkan channel `/ws` menerima payload pembaruan daftar top 20 regu dan individu secara instan.

### 2. Leaderboard Projector Mode (`/leaderboard?mode=projector`)
* Didesain khusus untuk proyektor dan layar LED raksasa Hall Utama:
  * **Tampilan Fullscreen:** Seluruh navigasi, sidebar, dan header admin otomatis disembunyikan.
  * **Podium 3 Besar Teratas:**
    * 🥇 **Juara 1 (Piala Emas):** Podium tertinggi di tengah dengan kilau partikel emas dan mahkota.
    * 🥈 **Juara 2 (Piala Perak):** Podium kiri dengan kilau perak.
    * 🥉 **Juara 3 (Piala Perunggu):** Podium kanan dengan kilau perunggu.
    * Menampilkan nama regu, perolehan XP, dan jumlah stempel lantai yang diraih.
  * **Tabel Berjalan (Peringkat 4 s/d 20):**
    * Daftar regu di bawah podium dengan animasi transisi baris yang halus saat terjadi salip-menyalip skor.

### 3. Fitur Kendali "Freeze Leaderboard"
* **Kebutuhan Lapangan Panitia:**
  * Pada Hari ke-3 pukul 15:00 (1 jam sebelum penutupan), panitia menekan tombol **"🔒 Freeze Leaderboard"**.
  * **Dampak ke Layar Publik & HP Mahasiswa:**
    * Papan peringkat publik terkunci pada posisi terakhir.
    * Muncul badge: *"Papan peringkat dibekukan. Pemenang akhir akan diumumkan pada Closing Ceremony!"*.
    * Mahasiswa tetap dapat menyelesaikan game pos yang tersisa (poin tetap masuk ke database).
  * **Dampak ke Admin Backoffice:**
    * Panitia tetap dapat melihat peringkat riil (*live unmasked leaderboard*) di tab admin untuk mencetak piagam dan menyiapkan trofi juara sebelum naik panggung.

---

## ✅ Checklist Pengerjaan
- [ ] Uji stabilitas koneksi native WebSocket Bun/Elysia saat client reconnect.
- [ ] Buat tampilan layout Theater Mode pada halaman `/leaderboard` Nuxt 3.
- [ ] Buat animasi podium 3 besar emas, perak, dan perunggu.
- [ ] Implementasikan endpoint dan tombol toggle "Freeze Leaderboard".
- [ ] Uji simulasi perubahan skor dan verifikasi apakah proyektor otomatis memperbarui posisi podium tanpa reload halaman.
