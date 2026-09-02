# GENIUS UNU (Gedung Edukasi Navigasi Interaktif Universitas Nahdlatul Ulama Yogyakarta) 2026 — Monorepo

> **Platform Orientasi Kampus Interaktif Berbasis Gamifikasi RPG & 9 Lantai Kampus UNU Yogyakarta.**  
> *Tema: "Upgrade New U 2026"*

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Hono](https://img.shields.io/badge/Backend-Hono-E36002?style=flat-square&logo=hono)](https://hono.dev/)
[![Bun](https://img.shields.io/badge/Workspaces-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/State-Pinia-ffd54f?style=flat-square)](https://pinia.vuejs.org/)

---

## 📚 Dokumentasi Lengkap Proyek (`docs/`)

Dokumentasi arsitektur, integrasi alur rundown 3 hari kegiatan, pemodelan MongoDB Atlas, spesifikasi modul, dan roadmap telah disusun secara terstruktur di folder [`docs/`](./docs/README.md):

* 📑 [**01. Pemetaan Rundown 3 Hari ke Fitur Aplikasi**](./docs/01-RUNDOWN-DAN-EVENT-FLOW.md)
* 🏗️ [**02. Arsitektur Sistem & Spesifikasi Tech Stack**](./docs/02-ARSITEKTUR-DAN-TECH-STACK.md)
* 🍃 [**03. Skema Database NoSQL (MongoDB Atlas)**](./docs/03-SKEMA-DATABASE-MONGODB.md)
* ⚙️ [**04. Spesifikasi Fitur Utama & Logika Gamifikasi**](./docs/04-SPESIFIKASI-FITUR-UTAMA.md)
* 📡 [**05. Spesifikasi Kontrak REST API Backend**](./docs/05-SPESIFIKASI-REST-API.md)
* 🔍 [**06. Audit Status Implementasi & Gap Analysis**](./docs/06-AUDIT-PROGRESS-SAAT-INI.md)
* 🗺️ [**07. Roadmap Pengembangan Menuju Produksi**](./docs/07-ROADMAP-PENGEMBANGAN.md)

---

Proyek ini menggunakan arsitektur **Monorepo (Bun Workspaces)** yang memisahkan aplikasi mahasiswa baru, dashboard admin panitia, backend API service, dan shared domain types:

```text
genius-unu/
├── frontend/
│   ├── user/                    # [@genius-unu/user] Aplikasi Gamifikasi Mahasiswa Baru (Port 3000)
│   │   ├── src/
│   │   │   ├── components/      # UI components & mini-games (TTS, Tebak Kata, dsb)
│   │   │   ├── views/           # FloorView, BoothView, LeaderboardView, PassportView
│   │   │   ├── store/           # Pinia gameStore
│   │   │   └── data/            # Mock dataset lantai & booth
│   │   ├── public/              # Aset visual, avatar, background
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── admin/                   # [@genius-unu/admin] Dashboard Panitia & PJ Orientasi (Port 3002)
│       ├── src/
│       │   ├── views/           # DashboardView, ParticipantsView, FloorsView, LeaderboardView
│       │   ├── components/      # Admin sidebar, header, layout
│       │   └── store/           # Pinia adminStore
│       ├── vite.config.ts
│       └── package.json
│
├── backend/                     # [@genius-unu/backend] REST API Service (Hono + Bun) (Port 3001)
│   ├── src/
│   │   ├── routes/              # auth.ts, booths.ts, stamps.ts, leaderboard.ts, admin.ts
│   │   ├── data/                # In-memory mock database store
│   │   └── index.ts             # Hono server entrypoint
│   └── package.json
│
├── packages/
│   └── shared/                  # [@genius-unu/shared] Shared domain types, contracts & constants
│       ├── src/
│       │   ├── types/           # game.ts, auth.ts, api.ts
│       │   ├── constants/       # config, player levels, scoring
│       │   └── index.ts
│       └── package.json
│
├── tsconfig.base.json           # Base TypeScript configuration
├── package.json                 # Root workspace orchestrator
└── README.md
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Instalasi Seluruh Workspace
```bash
bun install
```

### 2. Menjalankan Aplikasi

| Service | Perintah | URL Lokal | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Frontend User (MABA)** | `bun run dev:user` | `http://localhost:3000` | Gamifikasi & eksplorasi 9 lantai |
| **Frontend Admin** | `bun run dev:admin` | `http://localhost:3002` | Dashboard monitoring panitia |
| **Backend API** | `bun run dev:backend` | `http://localhost:3001` | REST API (Hono) |
| **Jalankan Semua Sekaligus** | `bun run dev` | - | Menjalankan seluruh workspace paralel |

### 3. Build Semua Aplikasi
```bash
bun run build
```

---

## 🏢 Fitur & Struktur 9 Lantai (Frontend User)

1. **Lantai 1:** Ground Zero • Aswaja & Etika (TTS & Tebak Kata)
2. **Lantai 2:** Welcoming Zone & Health (Benar/Salah & Kuis Cepat)
3. **Lantai 3:** Student Lounge & Kolaborasi (Memory Match & Tebak Posisi)
4. **Lantai 4:** Ruang Aman & Solidaritas (Kuis Cepat & TTS)
5. **Lantai 5:** Knowledge Sanctuary & Library (Tebak Kata & Benar/Salah)
6. **Lantai 6:** Future Labs & Riset Kampus (Tebak Posisi & Memory Match)
7. **Lantai 7:** Technopreneur & AI Hub (TTS & Kuis Cepat)
8. **Lantai 8:** Integritas & Tata Kelola (Benar/Salah & Tebak Kata)
9. **Lantai 9:** Summit & Puncak Transformasi (Master Challenge & Ikrar Upgraded You)

---

## 🛡️ Fitur Dashboard Admin (`frontend/admin`)

- 📊 **Realtime Dashboard:** Pantau jumlah pendaftar, total stempel diterbitkan, dan rata-rata kelulusan lantai.
- 👥 **Manajemen Mahasiswa:** Pencarian NIM/Nama, verifikasi stempel, dan reset progres jika diperlukan.
- 🏢 **Pengawasan 9 Lantai & 18 Booth:** Pantau status tiap booth mini-game secara real-time.
- 🏆 **Leaderboard Panitia:** Rekap peringkat individu (MABA) dan kelompok untuk penentuan reward orientasi.
- 🔐 **Passcode Authentication:** Proteksi login panitia (Default demo: `unu2026`).

---

## 📜 Lisensi
Dikembangkan untuk Kepanitiaan Orientasi PKKMB 2026 Universitas Nahdlatul Ulama Yogyakarta.
