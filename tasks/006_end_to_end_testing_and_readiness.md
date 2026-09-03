# 📑 TASK-006: Simulasi End-to-End Rundown 3 Hari, Uji LAN, & Kesiapan Operasional Hari H

* **Status:** ⏳ Tahap Akhir (Final Polish)
* **Target Komponen:** Seluruh Ekosistem (Backend, User App, Admin Panel, Database Docker)
* **Prinsip:** Menguji seluruh alur secara menyeluruh dari kacamata Mahasiswa Baru, Buddy, dan Superadmin sebelum dipakai oleh ribuan mahasiswa di kampus UNU Yogyakarta.

---

## 🎯 Tujuan
1. Mensimulasikan perjalanan penuh mahasiswa baru sepanjang 3 hari kegiatan PKKMB tanpa ada kendala teknis.
2. Memastikan sistem siap beroperasi di jaringan lokal kampus (*Campus WiFi LAN Readiness*).
3. Menyiapkan panduan cadangan (*disaster recovery & database backup*) untuk mengantisipasi insiden di hari H.

---

## 🧪 Skenario Pengujian Alur 3 Hari Lengkap

### ☀️ Hari 1: Onboarding, Presensi & Refleksi Niat
* **Langkah 1 (Mahasiswa):** Buka aplikasi di HP ➔ Scan QR Gerbang ➔ Pilih Kelas Karakter RPG (misal: *Cyber Knight*) ➔ Berhasil check-in (+100 XP).
* **Langkah 2 (Buddy):** Login ke dashboard panitia ➔ Buka kelompoknya ➔ Berikan nilai rubrik FGD 1 (Keaktifan: 5, Kedalaman: 4, Adab: 5) ➔ Mahasiswa menerima +186 XP.
* **Langkah 3 (Kepulangan):** Pukul 16:00 mahasiswa mengisi kuesioner refleksi harian (3 rating bintang + kesan pesan) ➔ Scan QR Pulang ➔ Status terkunci (+50 XP).

### 🏢 Hari 2: Campus Quest 9 Lantai & Crowd Control Rute
* **Langkah 1 (Pemandu Rute):** Mahasiswa melihat rute awal regu di dashboard (misal: mulai dari Lantai 3).
* **Langkah 2 (Ekspedisi Pos):**
  - Mahasiswa mendatangi Pos Lantai 1 (Aswaja), Lantai 2 (Kesehatan & Etika), Lantai 3 (AI & FTI), dst.
  - Memindai QR Pos fisik.
  - Memainkan mini-game (TTS, Tebak Kata, Kuis Cepat, Benar/Salah).
* **Langkah 3 (Validasi Stempel & Refresh):**
  - Setelah menyelesaikan pos, stempel emas muncul di Paspor Digital.
  - Mahasiswa menutup browser dan membuka kembali ➔ **Seluruh stempel emas dan XP tetap utuh.**
* **Langkah 4 (Evolusi Level):**
  - Akumulasi XP melampaui 200 pts ➔ Karakter berevolusi ke Tier 2 (*Advanced*).
  - Akumulasi melampaui 500 pts ➔ Karakter berevolusi ke Tier 3 (*Ascended*).

### 🎪 Hari 3: Ormawa Expo, Freeze Leaderboard, & Grand Finale
* **Langkah 1 (Expo Stand UKM):**
  - Mahasiswa menjelajahi selasar Lantai 3, 4, dan 5.
  - Memindai QR stan UKM (Pagar Nusa, Robotika, Paduan Suara, Teater, KSR-PMI).
  - Lencana UKM digital aktif di paspor dan bonus +75 XP bertambah per stand (maksimal 10 stand / +750 XP).
* **Langkah 2 (Freeze Leaderboard):**
  - Pukul 15:00 panitia menekan tombol **"Freeze Leaderboard"**.
  - Layar HP maba menampilkan banner pengumuman bahwa skor telah dikunci untuk penutupan.
* **Langkah 3 (Projector Ceremony):**
  - Panitia menyalakan Mode Proyektor Panggung di layar panggung Hall Utama.
  - Tampil animasi megah podium Juara 1, 2, dan 3 regu terkompak dan mahasiswa teraktif.

---

## 🛡️ Checklist Kesiapan Operasional Hari H (Battle-Tested Readiness)

### A. Jaringan & Aksesibilitas Server Kampus
- [ ] Backend terkonfigurasi bind ke `HOST=0.0.0.0` (dapat diakses oleh HP mahasiswa via IP WiFi kampus, misal `http://192.168.1.100:3000`).
- [ ] Rate limiter backend tidak memblokir IP bersama jika router kampus menggunakan NAT tunggal.
- [ ] Service Worker / PWA cache teruji bekerja dengan baik saat koneksi internet kampus fluktuatif.

### B. Prosedur Pencadangan Database (Backup & Recovery)
- [ ] Sediakan perintah satu baris untuk backup instan ke file SQL:
  ```bash
  docker exec -t genius_postgres_dev pg_dump -U genius genius_2026 > backup_h1.sql
  ```
- [ ] Sediakan skrip restore cadangan jika terjadi kegagalan hardware panitia:
  ```bash
  docker exec -i genius_postgres_dev psql -U genius genius_2026 < backup_h1.sql
  ```

### C. SOP Panitia & Tim Helpdesk IT
- [ ] Panitia memiliki akun superadmin cadangan.
- [ ] Seluruh kartu QR Pos 9 Lantai dan Stand UKM telah dicetak dari menu `/qr-center` satu hari sebelum acara.
- [ ] Seluruh Buddy memahami cara pengisian rubrik evaluasi FGD 1, 2, dan 6.
