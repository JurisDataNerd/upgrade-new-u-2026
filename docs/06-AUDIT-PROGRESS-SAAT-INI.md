# 🔍 Audit Status Implementasi & Analisis Kesenjangan (Gap Analysis)
### *Inventarisasi Kemajuan Repositori GENIUS UNU 2026 Saat Ini*

Dokumen ini menyajikan audit transparan mengenai kondisi nyata kode program yang ada di repositori saat ini dibandingkan dengan kebutuhan sistem produksi berbasis **MongoDB Atlas** dan alur **Rundown 3 Hari PKKMB**.

---

## 📊 Ringkasan Status per Sub-Paket Monorepo

```text
+-----------------------+-------------------+-----------------------------------------------------------+
| PAKET / MODUL         | STATUS IMPLEMENTASI| KETERANGAN & CATATAN TEKNIS                              |
+-----------------------+-------------------+-----------------------------------------------------------+
| 📦 packages/shared    | 🟡 65% (Parsial)   | Tipe dasar game, auth, dan api ada; perlu penambahan tipe |
|                       |                   | presensi, buddy FGD, ormawa, dan checkpoint dinamis.      |
| ⚡ backend             | 🔴 25% (Rintisan)  | Server Hono dasar dengan in-memory Map store; belum ada   |
|                       |                   | koneksi MongoDB Atlas, middleware JWT, & router lengkap.  |
| 🎮 frontend/user      | 🟡 70% (Prototipe)| UI Retro RPG & 7 mini-game selesai; masih menggunakan     |
|                       |                   | mockData statis di Pinia, belum tersambung ke backend API.|
| 🛡️ frontend/admin     | 🟡 75% (Prototipe)| Halaman UI lengkap (Nuxt 3); saat ini membaca mockDb.ts   |
|                       |                   | di memori browser, perlu dialihkan ke live REST API.     |
+-----------------------+-------------------+-----------------------------------------------------------+
```

---

## 🔬 Audit Rinci per Komponen

### 1. Backend Service (`backend/`)
* **Kondisi Saat Ini:**
  - Telah menggunakan framework Hono dengan TypeScript di `src/index.ts`.
  - Data tersimpan sementara di memori variabel JavaScript (`src/data/store.ts`) menggunakan struktur `Map<string, Participant>`.
  - Endpoint terbatas pada login statis mock, admin overview, dan leaderboard dasar.
* **Kekurangan yang Harus Dibangun:**
  - ❌ **Belum ada driver MongoDB / Mongoose:** Belum terkoneksi ke MongoDB Atlas.
  - ❌ **Belum ada modul Presensi Harian (`/attendance`):** Endpoint check-in QR dan check-out belum dibuat.
  - ❌ **Belum ada modul Buddy & FGD (`/buddy`):** Endpoint penilaian rubrik keaktifan mahasiswa belum tersedia.
  - ❌ **Belum ada modul Dynamic Checkpoint & Question Bank:** Konfigurasi pos dan bank soal masih *hardcoded*.
  - ❌ **Belum ada modul Ormawa Expo (`/ormawa`):** Endpoint scan QR booth UKM belum ada.
  - ❌ **Belum ada Middleware Proteksi JWT:** Otentikasi belum memverifikasi token kriptografi.

---

### 2. Frontend Mahasiswa (`frontend/user/`)
* **Kondisi Saat Ini:**
  - Tampilan visual bertema Stardew Valley Retro RPG telah berfungsi sangat baik dan memikat.
  - Terdapat 7 modul mini-game interaktif yang dapat dimainkan:
    1. `TtsGame.vue` (Teka-Teki Silang)
    2. `TebakKataGame.vue` (Scramble)
    3. `KuisCepatGame.vue` (Pilihan Ganda Berwaktu)
    4. `BenarSalahGame.vue` (Binary Card)
    5. `MemoryMatchGame.vue` (Pair Flip)
    6. `TebakPosisiGame.vue` (Tebak Foto Lokasi)
    7. `BuildingMap.vue` (Peta 9 Lantai)
  - Paspor digital (`PasporView.vue`) dan papan peringkat (`LeaderboardView.vue`).
* **Kekurangan yang Harus Dibangun:**
  - ❌ **Pinia GameStore masih terisolasi:** Menggunakan `INITIAL_PARTICIPANT` di memori lokal; progres akan hilang jika halaman di-refresh tanpa backend.
  - ❌ **Belum ada Layar Presensi QR Dinamis (Hari 1-3):** Form onboarding pendaftaran profil MABA dengan scan QR gate belum terintegrasi live.
  - ❌ **Belum ada Modul Scan Ormawa Expo (Hari 3):** Halaman pemburu stand UKM dan penampil katalog Ormawa belum tersedia.
  - ❌ **Belum ada Form Kuesioner Check-Out Harian.**

---

### 3. Frontend Admin Dashboard (`frontend/admin/`)
* **Kondisi Saat Ini:**
  - Dibangun menggunakan Nuxt 3 dengan antarmuka pixel art berstandar tinggi.
  - Memiliki halaman yang sangat komprehensif:
    - `/` (Dashboard Analytics)
    - `/stages` & `/floors` (Visualisasi Lantai & Pos)
    - `/games` (Konfigurasi Engine Game)
    - `/questions` (Katalog Bank Soal)
    - `/buddies` & `/buddies/[id]` (Daftar & Detail Buddy)
    - `/participants` & `/participants/[id]` (Daftar Mahasiswa & Reset Progres)
    - `/teams` (Daftar Kelompok)
    - `/qr-center` (Pusat Cetak Kartu QR A4)
    - `/leaderboard` (Tabel Peringkat)
* **Kekurangan yang Harus Dibangun:**
  - ⚠️ **Sumber Data Masih `mockDb.ts`:** File `composables/useApi.ts` saat ini melakukan manipulasi data pada `lib/mockDb.ts` lokal di memori browser. Perlu dialihkan untuk mengirimkan request HTTP nyata (`$fetch` / `axios`) ke Backend Hono `http://localhost:3001/api/v1`.
  - ❌ **Form Penilaian FGD Buddy Perlu Dihubungkan:** Aksi input nilai rubrik FGD pada `/buddies/[id].vue` harus menembak endpoint `/api/v1/buddy/evaluations/submit`.
  - ❌ **Integrasi Dynamic Pos:** CRUD Pos pada `/stages` harus memperbarui koleksi `checkpoints` di MongoDB Atlas.

---

### 4. Shared Contract Package (`packages/shared/`)
* **Kondisi Saat Ini:**
  - Memiliki definisi TypeScript di `src/types/game.ts`, `src/types/auth.ts`, dan `src/types/api.ts`.
* **Kekurangan yang Harus Dibangun:**
  - Perlu ditambahkan interface untuk:
    - `AttendanceRecord`, `CheckInPayload`, `CheckOutPayload`
    - `FgDSession`, `FgDEvaluation`, `RubricScore`
    - `OrmawaBooth`, `OrmawaScanLog`
    - `SystemSettings`

---

## 🎯 Matriks Kebutuhan Pengembangan (Action Items)

```text
[ ] 1. BACKEND: Setup Driver MongoDB Atlas & Buat Mongoose/Document Models
[ ] 2. SHARED: Update & Ekspor Tipe Data Presensi, FGD, Ormawa, dan Pos Dinamis
[ ] 3. BACKEND: Buat Router & Controller Presensi (/api/v1/attendance)
[ ] 4. BACKEND: Buat Router & Controller Buddy FGD (/api/v1/buddy)
[ ] 5. BACKEND: Buat Router & Controller Dynamic Checkpoints & Question Bank (/api/v1/quest & /api/v1/admin)
[ ] 6. BACKEND: Buat Router & Controller UKM Expo (/api/v1/ormawa)
[ ] 7. FRONTEND USER: Integrasikan Pinia GameStore dengan REST API Backend
[ ] 8. FRONTEND USER: Buat Tampilan Presensi Onboarding H1 & Scan Ormawa H3
[ ] 9. FRONTEND ADMIN: Sambungkan useApi.ts ke Live REST API Backend
[ ] 10. SYSTEM: Uji Coba End-to-End Alur Hari 1, Hari 2, dan Hari 3
```
