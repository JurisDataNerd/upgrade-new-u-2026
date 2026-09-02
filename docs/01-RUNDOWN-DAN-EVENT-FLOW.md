# 📅 Integrasi Rundown & Alur Kegiatan 3 Hari (PKKMB UNU 2026)
### *Pemetaan Rundown GENIUS 2026 ke Fitur & Modul Aplikasi*

Dokumen ini memetakan seluruh rangkaian acara dari dokumen resmi **"Rundown GENIUS 2026 SEMENTARA"** ke dalam fungsionalitas aplikasi mobile mahasiswa baru (`frontend/user`), dashboard panitia & buddy (`frontend/admin`), serta backend API (`backend`).

---

## 🧭 Ikhtisar 3 Hari Rangkaian Kegiatan

Aplikasi GENIUS UNU 2026 beroperasi secara dinamis selama **3 hari berturut-turut (22 - 24 September 2026)** dengan fokus gamifikasi yang bertransformasi setiap harinya:

```mermaid
journey
    title Perjalanan Mahasiswa Baru (MABA) di GENIUS UNU 2026
    section Hari 1 (22 Sept): Identity & Reflection
      Scan QR Presensi Pagi & Bikin Profil Avatar: 5: MABA, Buddy
      Opening Ceremony di Hall Utama: 3: MABA
      FGD 1 (Intention) - Dinilai Buddy: 5: MABA, Buddy
      Literasi Keuangan di Ruang Kelas: 4: MABA
      Daily Check-Out & Kuesioner: 4: MABA, Admin
    section Hari 2 (23 Sept): Tech & Campus Quest
      Presensi Pagi & Briefing Aturan Main: 5: MABA
      Literasi AI & Simulasi Industri 5.0: 4: MABA
      Campus Quest Sesi 1 (Pos Karakter 9 Lantai): 5: MABA, PJ Pos
      Sesi Kepesantrenan & Nilai Aswaja: 4: MABA
      Campus Quest Sesi 2 (Pos Akademik & PPKS): 5: MABA, PJ Pos
      Check-Out & Leaderboard Sementara: 5: MABA, Panitia
    section Hari 3 (24 Sept): Academic & Ormawa Expo
      Presensi Pagi & Pembekalan SIAKAD/KRS: 4: MABA
      UNU Berdampak & FGD 6 (Impact): 5: MABA, Buddy
      UKM / Ormawa Expo (QR Hunting Lt 3-5): 5: MABA, Ormawa
      Game Angkatan Kolosal: 5: MABA
      Grand Finale Awarding & Penutupan: 5: MABA, Panitia
```

---

## 📌 HARI 1: SELASA, 22 SEPTEMBER 2026
### *Tema: Onboarding, Identity, Character & Intention*

| Waktu | Durasi | Nama Kegiatan | Kategori Pilar | Lokasi | PIC | Integrasi Aplikasi GENIUS |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **07:00 - 07:30** | 30' | **Check-In & Onboarding** | Non-Materi | Area Presensi | Buddy & IT | **[Modul Presensi Pagi H1]** Mahasiswa scan QR presensi; pembuatan avatar & profil karakter RPG. |
| **07:30 - 08:30** | 60' | **Opening Ceremony** | Pilar 2 (Sistem PT) | Hall Utama | Pimpinan | Menampilkan video pembuka, lagu resmi, dan instruksi pembuka aplikasi. |
| **08:30 - 09:00** | 30' | **FGD 1: Intention** | Pilar 2 (Sistem PT) | Hall Utama | Buddy | **[Modul Buddy Scoring 1]** Diskusi *"Ke UNU apa yang kau cari?"*. Buddy input penilaian keaktifan & reward XP (+100 - +200 XP). |
| **09:00 - 10:00** | 60' | **Sesi Hubbul Wathan** | Pilar 1 (Bela Negara) | Hall Utama | Pemateri | Kelas klasikal penanaman wawasan kebangsaan dan cinta tanah air. |
| **10:00 - 10:30** | 30' | **FGD 2: Agent of Change** | Pilar 1 (Bela Negara) | Hall Utama | Buddy | **[Modul Buddy Scoring 2]** Refleksi peran agen perubahan. Buddy memberikan feedback & skor refleksi peserta. |
| **10:30 - 10:40** | 10' | Mobilisasi ke Kelas | Non-Materi | - | Buddy + Acara | Navigasi panduan denah lantai di aplikasi. |
| **10:40 - 12:00** | 80' | **Literasi Keuangan** | Pilar 2 (Sistem PT) | Ruang Kelas | Pakar Keuangan | **[Modul Kuis Kelas]** Pembahasan pinjol, anti-penipuan finansial, interaktif kuis kilat via aplikasi. |
| **12:00 - 13:00** | 60' | ISHOMA | Non-Materi | Masjid & Kelas | Logistik | Timer istirahat di dashboard mahasiswa. |
| **13:00 - 13:30** | 30' | Energizer | Non-Materi | Kelas Prodi | Acara | Ice breaking & mini riddle. |
| **13:30 - 15:20** | 110' | Prodi Connect & HMP | Pilar 2 (Sistem PT) | Kelas Prodi | Dosen / Alumni | Pengenalan kurikulum & Himpunan Mahasiswa Prodi. |
| **15:20 - 16:00** | 40' | Mobilisasi & Sholat Ashar | Non-Materi | Masjid | Logistik | Notifikasi jadwal ibadah. |
| **16:00 - 16:30** | 30' | **Daily Check-Out** | Non-Materi | Hall Utama | Buddy & IT | **[Modul Check-Out H1]** Scan QR Pulang, submit kuesioner harian & refleksi penutup hari 1. |

### Detail Alur Aplikasi Hari 1:
1. **Presensi Pagi (07:00):** Mahasiswa baru membuka URL user (`http://localhost:3000` / domain produksi). Mahasiswa memindai QR Code presensi yang dipajang di gate masuk / dibawa oleh Buddy. Setelah terverifikasi, Maba memasukkan data NIM, Nama, Prodi, Fakultas, serta memilih Avatar Karakter RPG (Cowok/Cewek).
2. **Buddy Point Awarding FGD 1 & FGD 2:** Setiap Buddy login ke Admin Panel (`frontend/admin` -> `/buddies`) dan membuka daftar mahasiswa dalam kelompok bimbingannya. Buddy memberikan rating keaktifan (Bintang 1-5), catatan refleksi, dan klik **"Award Points"** yang secara instan menambahkan XP ke akun MABA.
3. **Daily Check-Out (16:00):** MABA mengisi formulir refleksi harian (3 pertanyaan rating & 1 kolom esai singkat) kemudian scan QR Pulang untuk mengunci presensi Hari 1.

---

## 📌 HARI 2: RABU, 23 SEPTEMBER 2026
### *Tema: Digital Era, Technology, Future Skills & 9-Floor Campus Quest*

| Waktu | Durasi | Nama Kegiatan | Kategori Pilar | Lokasi | PIC | Integrasi Aplikasi GENIUS |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **07:00 - 07:30** | 30' | **Check-In & Briefing** | Non-Materi | Ruang Kelas | Acara & IT | **[Presensi H2]** Presensi digital hari kedua & pengarahan aturan main Campus Quest 9 Lantai. |
| **07:30 - 08:30** | 60' | **Literasi AI & Etika** | Pilar 3 (Era Digital) | Ruang Kelas | Pemateri IT | Modul materi etika siber & AI tools di aplikasi. |
| **08:30 - 09:30** | 60' | **Simulasi Industri 5.0** | Pilar 3 (Era Digital) | Ruang Kelas | Pemateri IT | Simulasi future skills. |
| **09:30 - 11:50** | 140' | **CAMPUS QUEST SESI 1** | Pilar 4 (Karakter) | Lt 1 - 9 Kampus | Acara, Buddy, PJ Pos | **[Game Engine Campus Quest 1]** Eksplorasi 8+ Pos Karakter & Integritas: Anti Korupsi, Anti Terorisme, Leadership, Pancasila, Anti Narkoba, Anti Plagiarisme, Medsos, Komunikasi. |
| **11:50 - 13:00** | 70' | Mobilisasi & ISHOMA | Non-Materi | Masjid & Selasar | Logistik | Timer istirahat & panduan lokasi makan. |
| **13:00 - 14:00** | 60' | **Sesi Kepesantrenan** | Pilar 5 (Aswaja) | Hall Utama | Kyai | Penanaman nilai-nilai ke-UNU-an dan Aswaja An-Nahdliyyah. |
| **14:00 - 15:30** | 90' | **CAMPUS QUEST SESI 2** | Pilar 2 (Sistem PT) | Lt 1 - 9 Kampus | Acara, Buddy, PJ Pos | **[Game Engine Campus Quest 2]** Eksplorasi pos Satgas PPKS, Sistem Akademik, Perpustakaan, Fasilitas Riset di 9 Lantai. |
| **15:30 - 16:00** | 30' | Sholat Ashar | Non-Materi | Masjid | Logistik | Pengingat waktu ibadah. |
| **16:00 - 16:30** | 30' | **Check-Out & Skor** | Non-Materi | Hall Utama | Divisi IT | **[Leaderboard Reveal H2]** Presensi pulang & penayangan skor sementara di proyektor Hall Utama. |

### Detail Alur Aplikasi Hari 2:
1. **Dynamic Campus Quest Engine:** Maba bergerak secara berkelompok atau berpasangan menyusuri Lantai 1 s.d. Lantai 9 gedung UNU Jogja.
2. **Mekanisme Pos & QR Stand:** Di setiap Pos/Booth fisik, terdapat standing banner QR Code. Mahasiswa membuka fitur kamera di aplikasi Maba dan memindai QR Pos.
3. **Variasi Modul Game Dinamis:** Saat QR pos terpindai, aplikasi membuka modul mini-game yang dikonfigurasi admin untuk pos tersebut:
   - **TTS (Teka-Teki Silang):** Mengisi kotak kata mendatar & menurun bertema Anti-Korupsi/Aswaja.
   - **Tebak Kata (Scramble):** Menyusun huruf acak menjadi istilah kunci (misal: *TASAMUH*, *TAWASSUTH*).
   - **Kuis Cepat (Rapid Timer):** 3-5 soal pilihan ganda berdurasi mundur 15 detik per soal.
   - **Benar / Salah:** Menilai kebenaran pernyataan seputar Satgas PPKS & kode etik kampus.
   - **Memory Match:** Mencocokkan pasangan kartu logo fakultas, riset, atau tokoh teladan.
   - **Tebak Posisi:** Mengidentifikasi foto fasilitas/ruangan kampus yang tepat.
4. **Stempel Digital & XP:** Setiap kali pos berhasil diselesaikan dengan skor di atas ambang batas kelulusan, paspor digital Maba mendapatkan **Stempel Emas** dan akumulasi +250 s.d. +500 XP.

---

## 📌 HARI 3: KAMIS, 24 SEPTEMBER 2026
### *Tema: Academic Mastery, UKM/Ormawa Discovery & Grand Finale*

| Waktu | Durasi | Nama Kegiatan | Kategori Pilar | Lokasi | PIC | Integrasi Aplikasi GENIUS |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **07:00 - 07:30** | 30' | **Check-In & Pengarahan** | Non-Materi | Hall Utama | Acara & IT | **[Presensi H3]** Presensi pagi hari penutupan. |
| **07:30 - 08:30** | 60' | **Panduan Akademik & SIAKAD** | Pilar 2 (Sistem PT) | Hall Utama | Dir. Akademik | Panduan teknis pengisian KRS, LMS, dan perwalian DPA. |
| **08:30 - 09:00** | 30' | **Pengenalan Direktorat & Fakultas** | Pilar 2 (Sistem PT) | Hall Utama | Dekanat | Pengenalan jajaran direktorat kampus. |
| **09:00 - 11:00** | 120' | **UNU Berdampak (SDGs)** | Pilar 5 (Muatan Lokal) | Hall Utama | Acara & Pemateri | Presentasi inovasi pengabdian masyarakat. |
| **11:00 - 11:30** | 30' | **FGD 6: Refleksi Impact** | Pilar 4 (Karakter) | Area Terbuka | Buddy | **[Modul Buddy Scoring 3]** Refleksi kontribusi mahasiswa; Buddy memberikan poin penilaian akhir FGD. |
| **11:30 - 12:30** | 60' | ISHOMA | Non-Materi | Masjid & Selasar | Logistik | Istirahat penuh. |
| **12:30 - 14:00** | 90' | **UKM / ORMAWA EXPO** | Pilar 2 (Sistem PT) | Selasar Lt 3, 4, 5 | Acara & Ormawa | **[Modul UKM Discovery QR]** Maba mengunjungi booth pameran UKM/Ormawa, memindai QR unik tiap stand, dan mengumpulkan Bonus XP + Ormawa Badges. |
| **14:00 - 15:00** | 60' | **Game Angkatan Kolosal** | Pilar 2 (Sistem PT) | Hall Utama | Acara | Ice breaking & formasi angkatan. |
| **15:00 - 15:30** | 30' | Sholat Ashar | Non-Materi | Masjid | Logistik | Ibadah bersama. |
| **15:30 - 16:30** | 60' | **AWARDING & CLOSING** | Non-Materi | Hall Utama | Pimpinan & Panitia | **[Grand Finale Leaderboard]** Penayangan pemenang gamifikasi individu & kelompok terbaik, penerbitan sertifikat level "Upgraded You". |

### Detail Alur Aplikasi Hari 3:
1. **UKM / Ormawa Expo QR Hunting (12:30 - 14:00):**
   - Terdapat 20+ stand pameran Organisasi Mahasiswa (BEM, DPM, HMP) dan Unit Kegiatan Mahasiswa (Paduan Suara, Silat, Tari, Robotika, Mapala, KSR, dll) di selasar Lantai 3, 4, dan 5.
   - Setiap stand memiliki QR Code resmi yang digenerate oleh admin (`/qr-center` atau `/ormawa`).
   - Mahasiswa baru yang datang dan berinteraksi dengan stand UKM memindai QR tersebut.
   - Sistem memvalidasi scan, menerbitkan **Badge Pengenal UKM** ke Paspor Maba, dan menginjeksi **Bonus +75 XP** per UKM (maksimal terakumulasi sesuai limit kebijakan panitia).
2. **Grand Finale Awarding (15:30):**
   - Admin membekukan (*freeze*) papan peringkat pada pukul 15:00.
   - Layar LED Proyektor Hall Utama menampilkan animasi selebrasi Top 10 Maba Teraktif, Top 5 Kelompok Terbaik, dan Distribusi Level Kelulusan PKKMB 2026.

---

## 📊 Matriks Peran Pengguna Sepanjang 3 Hari

```text
+-------------------+---------------------------------------+---------------------------------------+---------------------------------------+
| ROLE PENGGUNA     | HARI 1 (22 SEPT)                      | HARI 2 (23 SEPT)                      | HARI 3 (24 SEPT)                      |
+-------------------+---------------------------------------+---------------------------------------+---------------------------------------+
| MABA (Peserta)    | - Scan presensi masuk & pulang       | - Scan presensi masuk & pulang       | - Scan presensi masuk                 |
|                   | - Konfigurasi profil & avatar RPG     | - Eksplorasi 9 lantai gedung         | - Eksplorasi UKM Expo (Scan QR stand) |
|                   | - Ikuti FGD 1 & FGD 2 bersama Buddy   | - Mainkan 7 jenis modul game pos      | - Ikuti FGD 6 Refleksi Impact         |
|                   | - Isi kuesioner harian Hari 1         | - Kumpulkan 18+ stempel paspor        | - Lihat pengumuman juara di proyektor |
+-------------------+---------------------------------------+---------------------------------------+---------------------------------------+
| BUDDY (Pendamping)| - Validasi presensi kelompok          | - Dampingi kelompok rute 9 lantai    | - Dampingi kelompok di Expo UKM       |
|                   | - Input nilai FGD 1 & FGD 2 via portal| - Pantau progres stempel kelompok     | - Input nilai FGD 6 Refleksi          |
|                   | - Berikan bimbingan adaptasi kampus   | - Bantu eskalasi kendala teknis pos   | - Rekapitulasi keaktifan kelompok     |
+-------------------+---------------------------------------+---------------------------------------+---------------------------------------+
| PJ POS / LANTAI   | - Persiapan banner QR lantai          | - Jaga ketertiban pos di lantai 1-9  | - Monitoring selasar lantai 3, 4, 5   |
|                   | - Verifikasi ruangan & materi         | - Pandu maba yang antre di pos game   | - Bantuan teknis scan QR ormawa       |
+-------------------+---------------------------------------+---------------------------------------+---------------------------------------+
| SUPER ADMIN & IT  | - Live monitoring check-in 1000+ Maba | - Kontrol status buka/tutup pos game  | - Cetak QR resmi UKM / Ormawa         |
|                   | - Monitoring trafik API backend       | - Konfigurasi pertanyaan & modul      | - Freeze leaderboard & mode proyektor |
+-------------------+---------------------------------------+---------------------------------------+---------------------------------------+
```
