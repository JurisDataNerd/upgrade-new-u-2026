# 📑 TASK-001: Backend API Presensi, FGD Buddy, Ormawa Expo, & Pengaturan Sistem

* **Status:** ⏳ Siap Dikerjakan (Priority 1)
* **Target Komponen:** `backend/src/routes/` & `backend/src/index.ts`
* **Prinsip:** Mengintegrasikan seluruh konsep terbaik dari dokumentasi acara PKKMB UNU 2026 ke dalam REST API backend.

---

## 🎯 Tujuan
Membangun endpoint backend Elysia.js untuk mendukung seluruh alur lapangan 3 hari:
1. **Presensi Digital Anti-Titip Absen:** Time-window token verification, pencegahan presensi ganda, dan bonus XP.
2. **Rubrik Evaluasi FGD Buddy 3 Pilar:** Penilaian berstandar nilai Aswaja (Keaktifan, Kedalaman Visi, Adab & Etika).
3. **Ormawa Expo Scanner & XP Capping:** Pengecekan kuota maksimal stand UKM (maks 10 stand / +750 XP) dan penerbitan lencana digital.
4. **Kendali Sistem & Freeze Leaderboard:** Endpoint bagi panitia untuk membekukan leaderboard sebelum closing ceremony.

---

## 🛠️ Rincian Modul & Endpoint yang Akan Dibangun

### 1. Modul Presensi Terverifikasi (`backend/src/routes/attendance.ts`)
* Prefix: `/api/attendance`
* **Endpoints:**
  * `POST /api/attendance/check-in`:
    * Body: `{ participantId: string, day: number, qrToken: string }`
    * Logic:
      - Validasi kecocokan token QR gerbang pagi.
      - Pastikan belum pernah check-in di hari yang sama (`attendances_participant_day_unique`).
      - Tentukan status: `ON_TIME` (sebelum 07:30) atau `LATE` (setelah 07:30).
      - Catat perolehan **+100 XP Presensi Masuk** ke tabel `scoreTransactions`.
  * `POST /api/attendance/check-out`:
    * Body: `{ participantId: string, day: number, qrToken: string }`
    * Logic: Update `checkOutAt` dan catat perolehan **+50 XP Presensi Pulang**.
  * `GET /api/attendance/status/:participantId`:
    * Query: `?day=1`
    * Response: Status presensi maba hari ini (apakah sudah check-in, jam kedatangan, dan status refleksi).
  * `GET /api/attendance/recap`:
    * Response untuk admin/buddy: Total hadir, terlambat, dan belum hadir per kelompok.

### 2. Modul Penilaian FGD Buddy 3 Pilar (`backend/src/routes/fgd.ts`)
* Prefix: `/api/buddy/evaluations`
* **Endpoints:**
  * `POST /api/buddy/evaluations`:
    * Body:
      ```json
      {
        "sessionId": "FGD-1",
        "participantId": "uuid",
        "teamId": "uuid",
        "rubricScores": {
          "keaktifan": 5,
          "kedalaman": 4,
          "adab": 5
        },
        "feedbackNotes": "Sangat santun dan aktif menyampaikan visi."
      }
      ```
    * Logic:
      - Total Skor = `keaktifan + kedalaman + adab` (skala 3 - 15).
      - Konversi XP: `Math.round((totalScore / 15) * 200)` (rentang +40 s/d +200 XP).
      - Simpan ke `fgdEvaluations` dan catat transaksi `scoreTransactions` dengan `sourceType: "BONUS"`.
  * `GET /api/buddy/evaluations/team/:teamId`:
    * Response: Matriks penilaian seluruh anggota kelompok untuk sesi FGD 1, FGD 2, dan FGD 6.

### 3. Modul Ormawa Expo & Lencana Digital (`backend/src/routes/ormawa.ts`)
* Prefix: `/api/ormawa`
* **Endpoints:**
  * `GET /api/ormawa/booths`:
    * Response: Daftar seluruh stan pameran UKM (nama, kategori, nomor booth, lokasi selasar lantai 3-5, kontak person, instagram).
  * `POST /api/ormawa/scan`:
    * Body: `{ participantId: string, qrCode: string }`
    * Logic:
      - Validasi QR Code stand UKM.
      - Pastikan belum pernah memindai stan yang sama.
      - **XP Capping Rule:** Cek jumlah stan yang sudah dipindai mahasiswa hari ini. Jika sudah mencapai batas maksimal (10 stan), scan tetap sukses membuka lencana pengenal UKM, namun bonus XP di-cap agar kompetisi tetap adil.
      - Jika di bawah kuota (≤ 10 stan), berikan **+75 XP Bonus** ke `scoreTransactions`.
  * `GET /api/ormawa/my-badges/:participantId`:
    * Response: Daftar lencana UKM yang sudah berhasil dikoleksi oleh mahasiswa beserta total stand yang telah dikunjungi.

### 4. Modul Refleksi Kepulangan (`backend/src/routes/reflections.ts`)
* Prefix: `/api/reflections`
* **Endpoints:**
  * `POST /api/reflections`:
    * Body: `{ participantId: string, day: number, ratingFasilitas: number, ratingMateri: number, ratingBuddy: number, essayInsight: string }`
    * Logic: Simpan ke `dailyReflections` dan tandai `reflectionSubmitted = true` pada `attendances`.

### 5. Modul Pengaturan Sistem & Freeze Leaderboard (`backend/src/routes/system.ts`)
* Prefix: `/api/system`
* **Endpoints:**
  * `GET /api/system/settings`:
    * Response: `{ activeDay: 1|2|3, isLeaderboardFrozen: boolean, isCampusQuestOpen: boolean, isOrmawaExpoOpen: boolean }`.
  * `POST /api/system/freeze-leaderboard` (Admin Only):
    * Body: `{ frozen: boolean }`
    * Logic: Mengaktifkan status freeze leaderboard menjelang grand final awarding dan broadcast ke WebSocket.

---

## ✅ Checklist Pengerjaan
- [x] Buat file `backend/src/routes/attendance.ts` (Check-In, Check-Out, Status, Recap) — *Teruji 100%*.
- [x] Buat file `backend/src/routes/fgd.ts` (Rubrik 3 pilar FGD 1, 2, 6) — *Teruji 100%*.
- [x] Pasang dokumentasi interaktif **Scalar API Reference** di `http://localhost:3001/swagger`.
- [x] Buat file `backend/src/routes/ormawa.ts` (Katalog booth, Scan QR UKM, Capping XP +75) — *Teruji 100%*.
- [x] Buat file `backend/src/routes/reflections.ts` (Kuesioner harian +25 XP, rekap panitia) — *Teruji 100%*.
- [x] Buat file `backend/src/routes/system.ts` (Freeze leaderboard toggle & status event) — *Teruji 100%*.
- [x] Daftarkan seluruh router baru di `backend/src/index.ts`.
- [x] Verifikasi dengan `bun run typecheck` (0 errors).
