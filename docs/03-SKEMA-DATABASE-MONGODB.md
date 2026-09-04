# 🍃 Skema Database & Pemodelan Dokumen MongoDB Atlas
### *Struktur Basis Data NoSQL untuk Sistem Gamifikasi GENIUS UNU 2026*

Dokumen ini mendefinisikan rancangan pemodelan dokumen (*Document Schema*), koleksi (*Collections*), relasi semantik (*Embedding vs Referencing*), indeks performa (*Indexes*), serta aturan validasi data pada basis data **MongoDB Atlas**.

---

## 🗂️ Daftar Koleksi Database

```text
genius_unu_2026 (Database)
├── users                  # Data mahasiswa baru (MABA) & profil gamifikasi
├── admins                 # Data panitia, buddy pendamping, PJ lantai, & superadmin
├── attendances            # Riwayat presensi digital (Hari 1, 2, 3 - Masuk & Pulang)
├── fgd_sessions           # Konfigurasi sesi FGD (FGD 1, FGD 2, FGD 6)
├── fgd_evaluations        # Nilai & poin keaktifan MABA dari Buddy
├── floors                 # Data master 9 lantai kampus UNU Yogyakarta
├── checkpoints            # Data Pos Misi dinamis (dapat diatur admin)
├── game_modules           # Konfigurasi modul & tipe game (TTS, Kuis, Tebak Kata, dll)
├── questions              # Bank soal dinamis terikat ke modul game
├── stamp_records          # Catatan perolehan stempel digital paspor MABA
├── ormawa_booths          # Daftar stand UKM/Ormawa pada Expo Hari Ke-3
├── ormawa_scans           # Log pemindaian QR stand Ormawa untuk Bonus XP
├── daily_reflections      # Kuesioner evaluasi harian MABA (Hari 1-3)
└── system_settings        # Konfigurasi global event (Active Day, Freeze Leaderboard)
```

---

## 📄 Spesifikasi Lengkap Dokumen & Schema

### 1. Koleksi: `users` (Mahasiswa Baru)
Menyimpan profil mahasiswa, identitas kelompok, perolehan XP, level RPG, dan array ID stempel yang telah diraih.

```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a111111" },
  "nim": "260100101",
  "name": "Ahmad Fauzi Ridwan",
  "email": "ahmad.fauzi@student.unu-jogja.ac.id",
  "faculty": "Fakultas Teknologi Informasi",
  "prodi": "Informatika",
  "avatar": "character-cowok-avatar.png",
  "characterClass": "CYBER_KNIGHT",
  "groupId": "grp-1",
  "groupName": "Kelompok 01 - KH. Hasyim Asyari",
  "buddyId": "adm-buddy-01",
  "totalXp": 2450,
  "level": "Achiever",
  "completedBooths": ["booth-1a", "booth-1b", "booth-2a", "booth-2b", "booth-3a"],
  "completedFloorsCount": 2,
  "ormawaBadges": ["ormawa-silat", "ormawa-padus", "ormawa-robotik"],
  "bonusOrmawaXp": 225,
  "isRegistered": true,
  "registeredAt": { "$date": "2026-09-22T00:15:30.000Z" },
  "lastActivityAt": { "$date": "2026-09-23T04:20:10.000Z" },
  "createdAt": { "$date": "2026-09-22T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-09-23T04:20:10.000Z" }
}
```

* **Indeks:**
  - `nim`: Unique Index `{ nim: 1 }`
  - `groupId`: Index `{ groupId: 1 }`
  - `totalXp`: Descending Index `{ totalXp: -1 }` (Kebutuhan Leaderboard)
  - `prodi`: Index `{ prodi: 1 }`

---

### 2. Koleksi: `admins` (Panitia & Buddy)
Menyimpan hak akses akun manajemen PKKMB, peran kerja, dan penugasan lantai/kelompok.

```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a222222" },
  "username": "buddy_01",
  "passwordHash": "$2b$10$abcdefghijklmnopqrstuvwxyz0123456789",
  "name": "Nabila Salsa Billa",
  "role": "buddy", // superadmin | admin_floor | buddy | pj_pos | ormawa_pic
  "email": "buddy.kelompok01@unu-jogja.ac.id",
  "phone": "+6281234567890",
  "assignedGroupId": "grp-1",
  "assignedGroupName": "Kelompok 01 - KH. Hasyim Asyari",
  "assignedFloor": null,
  "assignedBoothId": null,
  "isActive": true,
  "createdAt": { "$date": "2026-09-20T00:00:00.000Z" }
}
```

* **Indeks:**
  - `username`: Unique Index `{ username: 1 }`
  - `role`: Index `{ role: 1 }`

---

### 3. Koleksi: `attendances` (Presensi Digital Hari 1-3)
Merekam bukti kehadiran pagi (Check-In) dan kepulangan (Check-Out) mahasiswa baru untuk setiap hari acara.

```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a333333" },
  "nim": "260100101",
  "userName": "Ahmad Fauzi Ridwan",
  "day": 1, // 1 | 2 | 3
  "date": "2026-09-22",
  "checkIn": {
    "timestamp": { "$date": "2026-09-22T00:12:45.000Z" },
    "status": "ON_TIME", // ON_TIME | LATE
    "qrTokenUsed": "QR-PRESENSI-H1-MORNING-TOKEN",
    "verifiedBy": "SYSTEM_SCAN",
    "xpAwarded": 100
  },
  "checkOut": {
    "timestamp": { "$date": "2026-09-22T09:15:20.000Z" },
    "status": "COMPLETED",
    "qrTokenUsed": "QR-PRESENSI-H1-EVENING-TOKEN",
    "reflectionSubmitted": true,
    "xpAwarded": 50
  },
  "totalDayXp": 150,
  "createdAt": { "$date": "2026-09-22T00:12:45.000Z" }
}
```

* **Indeks:**
  - Compound Unique Index: `{ nim: 1, day: 1 }` (Mencegah duplikasi presensi per hari)
  - `date`: Index `{ date: 1 }`

---

### 4. Koleksi: `fgd_sessions` & `fgd_evaluations` (Penilaian Buddy)

#### A. `fgd_sessions` (Definisi Sesi FGD)
```json
{
  "_id": "fgd-1",
  "code": "FGD_H1_INTENTION",
  "day": 1,
  "title": "FGD 1: Intention (Niat & Tujuan Masuk UNU)",
  "questionPrompt": "Ke UNU apa yang kau cari? Jelaskan visi masa depanmu.",
  "maxScore": 200,
  "defaultXpAward": 150,
  "rubrics": [
    { "key": "keaktifan", "label": "Keaktifan Diskusi", "maxPoint": 5 },
    { "key": "kedalaman", "label": "Kedalaman Niat & Visi", "maxPoint": 5 },
    { "key": "adab", "label": "Adab & Etika Menyampaikan", "maxPoint": 5 }
  ],
  "isOpen": true
}
```

#### B. `fgd_evaluations` (Rekap Nilai yang Diinput Buddy)
```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a444444" },
  "sessionId": "fgd-1",
  "nim": "260100101",
  "studentName": "Ahmad Fauzi Ridwan",
  "buddyId": "adm-buddy-01",
  "buddyName": "Nabila Salsa Billa",
  "groupId": "grp-1",
  "rubricScores": {
    "keaktifan": 5,
    "kedalaman": 4,
    "adab": 5
  },
  "totalScore": 14, // dari 15
  "xpAwarded": 190,
  "feedbackNotes": "Sangat antusias menyampaikan visi digitalisasi agrikultur.",
  "submittedAt": { "$date": "2026-09-22T01:50:00.000Z" }
}
```

* **Indeks:**
  - Compound Unique Index: `{ sessionId: 1, nim: 1 }`

---

### 5. Koleksi: `checkpoints` (Pos Misi Dinamis 9 Lantai)
Memungkinkan Super Admin untuk mengatur secara dinamis berapa jumlah pos per lantai, nama pos, pilar materi, dan jenis modul game yang aktif.

```json
{
  "_id": "pos-lt1-a",
  "code": "B1-A",
  "floorNumber": 1,
  "name": "Gerbang Nilai Aswaja & Etika Kampus",
  "subtitle": "Pondasi Karakter & Tradisi Intelektual Nahdlatul Ulama",
  "pilar": "Pilar 5 (Muatan Lokal / Aswaja)",
  "category": "anti_korupsi",
  "gameType": "tts", // tts | tebak_kata | kuis_cepat | benar_salah | memory_match | tebak_posisi
  "qrSecretToken": "SEC-POS-B1A-2026-XYZ",
  "locationDescription": "Lantai 1 - Selasar Depan Hall Utama",
  "story": "Di gerbang pertama perjalananmu di UNU Jogja, buktikan pemahamanmu mengenai pilar Aswaja...",
  "readingTime": "3 Menit",
  "iconName": "Scroll",
  "stampTitle": "Pejuang Aswaja",
  "stampIcon": "SealCheck",
  "stampColor": "#10b981",
  "basePassingScore": 70,
  "xpReward": 250,
  "isActive": true,
  "sortOrder": 1,
  "createdAt": { "$date": "2026-09-21T00:00:00.000Z" }
}
```

* **Indeks:**
  - `floorNumber`: Index `{ floorNumber: 1 }`
  - `code`: Unique Index `{ code: 1 }`
  - `qrSecretToken`: Unique Index `{ qrSecretToken: 1 }`

---

### 6. Koleksi: `game_modules` & `questions` (Bank Soal Dinamis)

#### Contoh Dokumen Modul TTS (`game_modules`):
```json
{
  "_id": "mod-tts-pos-1a",
  "checkpointId": "pos-lt1-a",
  "gameType": "tts",
  "gridRows": 6,
  "gridCols": 8,
  "clues": [
    {
      "id": "c1",
      "number": 1,
      "direction": "across",
      "clue": "Sikap toleran terhadap perbedaan pandangan dalam tradisi NU",
      "answer": "TASAMUH",
      "row": 0,
      "col": 0
    },
    {
      "id": "c2",
      "number": 2,
      "direction": "down",
      "clue": "Sikap adil dan tegak lurus pada kebenaran",
      "answer": "ITIDAL",
      "row": 0,
      "col": 0
    }
  ]
}
```

#### Contoh Dokumen Bank Soal Kuis Pilihan Ganda (`questions`):
```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a555555" },
  "checkpointId": "pos-lt2-a",
  "gameType": "kuis_cepat",
  "category": "anti_korupsi",
  "questionText": "Manakah di bawah ini yang merupakan tindakan gratifikasi terlarang di lingkungan kampus?",
  "options": [
    "Meminjam buku perpustakaan tepat waktu",
    "Memberikan hadiah uang kepada dosen untuk perbaikan nilai ujian",
    "Mengikuti diskusi kelompok bersama teman sekelas",
    "Membayar uang kuliah melalui virtual account resmi bank"
  ],
  "correctAnswerIndex": 1,
  "explanation": "Pemberian hadiah atau fasilitas kepada pengajar untuk mempengaruhi nilai termasuk tindak pidana gratifikasi.",
  "difficulty": "MEDIUM",
  "points": 50,
  "isActive": true
}
```

---

### 7. Koleksi: `stamp_records` (Log Stempel Paspor Mahasiswa)
Merekam bukti valid kelulusan tantangan pos game oleh mahasiswa.

```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a666666" },
  "nim": "260100101",
  "checkpointId": "pos-lt1-a",
  "checkpointCode": "B1-A",
  "floorNumber": 1,
  "stampTitle": "Pejuang Aswaja",
  "stampIcon": "SealCheck",
  "stampColor": "#10b981",
  "score": 100,
  "totalQuestions": 2,
  "xpEarned": 250,
  "earnedAt": { "$date": "2026-09-23T03:15:00.000Z" },
  "durationSeconds": 48
}
```

* **Indeks:**
  - Compound Unique Index: `{ nim: 1, checkpointId: 1 }` (1 Stempel per Pos per Mahasiswa)
  - `floorNumber`: Index `{ floorNumber: 1 }`

---

### 8. Koleksi: `ormawa_booths` & `ormawa_scans` (Expo Hari Ke-3)

#### A. `ormawa_booths` (Stand Pameran UKM/Ormawa)
```json
{
  "_id": "ormawa-silat",
  "name": "Pagar Nusa & Pencak Silat UNU Jogja",
  "shortName": "Silat UNU",
  "category": "Olahraga & Seni Beladiri",
  "floorLocation": 3,
  "boothNumber": "E3-04",
  "description": "Wadah pengembangan minat seni beladiri tradisional dan kebugaran mahasiswa.",
  "qrSecretToken": "ORMAWA-QR-SILAT-987654",
  "xpReward": 75,
  "badgeIcon": "Shield",
  "badgeColor": "#16a34a",
  "contactPerson": "Zaki (+6281399887766)",
  "instagram": "@silat_unujogja",
  "totalVisitors": 142,
  "isActive": true
}
```

#### B. `ormawa_scans` (Catatan Kunjungan Stand oleh MABA)
```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a777777" },
  "nim": "260100101",
  "ormawaId": "ormawa-silat",
  "ormawaName": "Pagar Nusa & Pencak Silat UNU Jogja",
  "xpEarned": 75,
  "scannedAt": { "$date": "2026-09-24T05:45:10.000Z" }
}
```

* **Indeks:**
  - Compound Unique Index: `{ nim: 1, ormawaId: 1 }` (Mencegah scan berulang pada stand yang sama)
  - `scannedAt`: Index `{ scannedAt: -1 }`

---

### 9. Koleksi: `daily_reflections` (Kuesioner Harian)
```json
{
  "_id": { "$oid": "66e01a2b4f1c8a001a888888" },
  "nim": "260100101",
  "day": 1,
  "ratingFasilitas": 5,
  "ratingMateri": 4,
  "ratingBuddy": 5,
  "essayInsight": "Hari ini saya memahami pentingnya nilai tasamuh dalam berkehidupan di kampus multikultural.",
  "submittedAt": { "$date": "2026-09-22T09:14:00.000Z" }
}
```

---

### 10. Koleksi: `system_settings` (Konfigurasi Global)
```json
{
  "_id": "global_config",
  "activeDay": 1, // 1 | 2 | 3
  "isCheckInOpen": true,
  "isCheckOutOpen": false,
  "isCampusQuestOpen": false,
  "isOrmawaExpoOpen": false,
  "isLeaderboardFrozen": false,
  "maintenanceMode": false,
  "eventAnnouncement": "Selamat Datang Mahasiswa Baru di PKKMB UNU Yogyakarta 2026!"
}
```
