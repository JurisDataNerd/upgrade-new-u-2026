# 📡 Spesifikasi Kontrak REST API Backend
### *Dokumentasi Endpoint RESTful API GENIUS UNU Yogyakarta 2026*

Dokumen ini mendefinisikan kontrak antarmuka API (*API Contracts*), format payload request/response JSON, kode status HTTP, serta mekanisme otentikasi JWT yang menghubungkan aplikasi frontend dengan backend Elysia / Bun.

> [!TIP]
> **Dokumentasi Interaktif Resmi (Live Single Source of Truth):**
> Dokumentasi API interaktif dengan antarmuka modern, pengujian request langsung di browser, dan OpenAPI 3.0.3 spec dapat diakses secara live di:
> * 📖 **Scalar API Reference:** [`http://localhost:3001/swagger`](http://localhost:3001/swagger) *(atau [`/reference`](http://localhost:3001/reference))*
> * 📄 **OpenAPI Spec (JSON):** [`http://localhost:3001/swagger/json`](http://localhost:3001/swagger/json)

---

## 🌐 Konvensi Umum API

* **Base URL:** `http://localhost:3001/api` (Lokal) / `https://api-genius.unu-jogja.ac.id/api` (Produksi)
* **Format Data:** `application/json; charset=utf-8`
* **Header Otentikasi:** `Authorization: Bearer <JWT_TOKEN>`

### Standar Struktur Response JSON
```json
{
  "success": true,
  "message": "Operasi berhasil dilakukan",
  "data": {},
  "timestamp": "2026-09-22T07:15:00.000Z"
}
```

### Standar Struktur Error JSON
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Sesi login telah kedaluwarsa atau token tidak valid"
  },
  "timestamp": "2026-09-22T07:15:00.000Z"
}
```

---

## 🔐 1. Endpoint Otentikasi & Profil (`/auth`)

### A. Registrasi Onboarding Mahasiswa Baru (Hari 1)
* **Method:** `POST`
* **Path:** `/auth/register-maba`
* **Request Body:**
  ```json
  {
    "nim": "260100101",
    "name": "Ahmad Fauzi Ridwan",
    "email": "ahmad.fauzi@student.unu-jogja.ac.id",
    "prodi": "Informatika",
    "faculty": "Fakultas Teknologi Informasi",
    "avatar": "character-cowok-avatar.png",
    "groupId": "grp-1",
    "groupName": "Kelompok 01 - KH. Hasyim Asyari",
    "qrPresensiToken": "QR-PRESENSI-H1-GATE"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Pendaftaran berhasil, profil karakter RPG aktif!",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "nim": "260100101",
        "name": "Ahmad Fauzi Ridwan",
        "totalXp": 100,
        "level": "New You"
      }
    }
  }
  ```

### B. Login Mahasiswa Baru
* **Method:** `POST`
* **Path:** `/auth/login-maba`
* **Request Body:** `{ "nim": "260100101" }`
* **Response (200 OK):** Mengembalikan token JWT dan profil lengkap peserta.

### C. Login Admin & Buddy
* **Method:** `POST`
* **Path:** `/auth/login-admin`
* **Request Body:** `{ "username": "buddy_01", "passcode": "unu2026" }`
* **Response (200 OK):** Mengembalikan token JWT admin berserta wewenang (`role`).

---

## 📱 2. Endpoint Presensi Digital (`/attendance`)

### A. Presensi Masuk (Check-In)
* **Method:** `POST`
* **Path:** `/attendance/check-in`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body:**
  ```json
  {
    "day": 1,
    "qrToken": "QR-PRESENSI-H1-GATE-VALID"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Presensi masuk Hari 1 berhasil tercatat.",
    "data": {
      "day": 1,
      "status": "ON_TIME",
      "xpAwarded": 100,
      "newTotalXp": 200,
      "timestamp": "2026-09-22T07:12:00.000Z"
    }
  }
  ```

### B. Presensi Pulang & Submit Kuesioner (Check-Out)
* **Method:** `POST`
* **Path:** `/attendance/check-out`
* **Request Body:**
  ```json
  {
    "day": 1,
    "qrToken": "QR-CHECKOUT-H1-HALL",
    "reflection": {
      "ratingFasilitas": 5,
      "ratingMateri": 4,
      "ratingBuddy": 5,
      "essayInsight": "Sangat berkesan di sesi pembukaan."
    }
  }
  ```
* **Response (200 OK):** Menambahkan bonus +50 XP kepulangan dan mengunci presensi harian.

---

## 👥 3. Endpoint Portal Buddy & Evaluasi FGD (`/buddy`)

### A. Mendapatkan Daftar Anggota Kelompok Bimbingan
* **Method:** `GET`
* **Path:** `/buddy/teams/:groupId`
* **Headers:** `Authorization: Bearer <BUDDY_TOKEN>`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "groupId": "grp-1",
      "groupName": "Kelompok 01 - KH. Hasyim Asyari",
      "members": [
        {
          "nim": "260100101",
          "name": "Ahmad Fauzi Ridwan",
          "totalXp": 1250,
          "completedFloors": 3,
          "fgdScores": {
            "fgd-1": 150,
            "fgd-2": 180
          }
        }
      ]
    }
  }
  ```

### B. Input Nilai Evaluasi FGD
* **Method:** `POST`
* **Path:** `/buddy/evaluations/submit`
* **Request Body:**
  ```json
  {
    "sessionId": "fgd-1",
    "nim": "260100101",
    "rubricScores": {
      "keaktifan": 5,
      "kedalaman": 4,
      "adab": 5
    },
    "feedbackNotes": "Penyampaian sangat jelas dan inspiratif"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Evaluasi berhasil disimpan, +190 XP ditambahkan ke mahasiswa.",
    "data": {
      "xpAwarded": 190,
      "newTotalXp": 1440
    }
  }
  ```

---

## 🏢 4. Endpoint Campus Quest & Mini-Game (`/quest`)

### A. Ambil Data Pos Misi via Scan QR
* **Method:** `GET`
* **Path:** `/quest/checkpoints/:codeOrToken`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "pos-lt1-a",
      "code": "B1-A",
      "floorNumber": 1,
      "name": "Gerbang Nilai Aswaja",
      "gameType": "tts",
      "story": "Di gerbang pertama perjalananmu...",
      "gameContent": {
        "gridRows": 6,
        "gridCols": 8,
        "clues": [
          { "number": 1, "direction": "across", "clue": "Sikap toleran...", "answer": "TASAMUH", "row": 0, "col": 0 }
        ]
      }
    }
  }
  ```

### B. Submisi Hasil Game & Penerbitan Stempel
* **Method:** `POST`
* **Path:** `/quest/stamps/submit`
* **Request Body:**
  ```json
  {
    "checkpointId": "pos-lt1-a",
    "score": 100,
    "totalQuestions": 2,
    "durationSeconds": 45,
    "answers": { "c1": "TASAMUH", "c2": "ITIDAL" }
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Selamat! Tantangan terselesaikan dengan sempurna.",
    "data": {
      "stamp": {
        "boothId": "pos-lt1-a",
        "stampTitle": "Pejuang Aswaja",
        "stampIcon": "SealCheck",
        "stampColor": "#10b981",
        "score": 100
      },
      "xpEarned": 250,
      "newTotalXp": 1690,
      "isFloorComplete": false,
      "unlockedLevel": "Explorer"
    }
  }
  ```

---

## 🎪 5. Endpoint UKM / Ormawa Expo (`/ormawa`)

### A. Daftar Katalog Ormawa / UKM (Hari 3)
* **Method:** `GET`
* **Path:** `/ormawa/booths`
* **Response (200 OK):** Mengembalikan daftar seluruh stand pameran di Lantai 3, 4, 5.

### B. Pemindaian QR Stand Ormawa (Bonus XP)
* **Method:** `POST`
* **Path:** `/ormawa/scan`
* **Request Body:** `{ "qrToken": "ORMAWA-QR-SILAT-987654" }`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Berhasil mengunjungi stand Pagar Nusa & Pencak Silat UNU Jogja!",
    "data": {
      "ormawaName": "Pagar Nusa & Pencak Silat UNU Jogja",
      "badgeAwarded": "Shield",
      "bonusXp": 75,
      "totalOrmawaVisited": 3,
      "newTotalXp": 1765
    }
  }
  ```

---

## 🏆 6. Endpoint Leaderboard & Analytics (`/leaderboard` & `/stats`)

### A. Leaderboard Individu Mahasiswa
* **Method:** `GET`
* **Path:** `/leaderboard/individual?limit=50&prodi=all`
* **Response (200 OK):** Mengembalikan peringkat 1 s.d. 50 MABA berdasarkan `totalXp`.

### B. Leaderboard Kelompok / Regu
* **Method:** `GET`
* **Path:** `/leaderboard/groups`
* **Response (200 OK):** Mengembalikan daftar kelompok terurut berdasarkan `avgXp`.

### C. Ringkasan Statistik Admin (`/admin/stats/overview`)
* **Method:** `GET`
* **Path:** `/admin/stats/overview`
* **Response (200 OK):** Menghasilkan total pendaftar, jumlah check-in hari ini, total stempel diterbitkan, dan rasio penyelesaian 9 lantai.
