# GENIUS UNU (Gedung Edukasi Navigasi Interaktif Universitas Nahdlatul Ulama Yogyakarta)

> **Platform Orientasi Kampus Interaktif Berbasis Gamifikasi RPG 8-Bit & 9 Lantai Gedung Kampus UNU Yogyakarta.**
> *Tema: "Upgrade New U 2026"*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand_v5-orange?style=flat-square)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer_Motion_v13-magenta?style=flat-square&logo=framer)](https://www.framer.com/motion/)

---

## 📌 Daftar Isi
- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Struktur 9 Lantai & 18 Corner](#-struktur-9-lantai--18-corner)
- [6 Tipe Mini-Game](#-6-tipe-mini-game)
- [Teknologi & Arsitektur](#-teknologi--arsitektur)
- [Struktur Folder](#-struktur-folder)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Audio Engine (Web Audio API)](#-audio-engine-web-audio-api)
- [Mobile-First & Fit-to-Screen](#-mobile-first--fit-to-screen)
- [Lisensi](#-lisensi)

---

## 🎮 Tentang Proyek

**GENIUS UNU** adalah web application interaktif bertema retro RPG pixel-art yang dirancang khusus untuk memfasilitasi masa orientasi mahasiswa baru (PKKMB / Ta'aruf Kampus) di **Universitas Nahdlatul Ulama Yogyakarta**.

Aplikasi ini mengubah pengenalan fasilitas gedung, nilai Aswaja An-Nahdliyyah, tata krama akademik, riset, integritas, dan visi kebangsaan menjadi petualangan gamifikasi seru di gedung 9 lantai ikonik UNU Yogyakarta. Mahasiswa menyelesaikan tantangan di 18 spot edukasi (*corner*), mengoleksi stempel digital, meningkatkan level karakter, bersaing di papan peringkat, dan mencetak Paspor Digital serta Sertifikat Kelulusan Orientasi.

---

## 🌟 Fitur Utama

- 🏛️ **Eksplorasi 9 Lantai Interaktif:** Peta visual gedung 9 lantai dengan indikator progres tuntas secara *real-time*.
- 🎯 **18 Corner & Materi Edukasi:** Setiap lantai memiliki 2 spot corner lengkap dengan materi pengenalan kampus dan mini-game edukatif.
- 🕹️ **6 Engine Mini-Game Unik:** Teka-Teki Silang (TTS), Tebak Kata, Tebak Posisi Ruangan, Memory Match, Kuis Cepat Berwaktu, dan Benar/Salah.
- 📜 **Paspor Digital & Kartu Mahasiswa (KTM):** Kartu identitas RPG dengan nama, NIM, fakultas, prodi, koleksi 18 stempel digital, serta tombol cetak sertifikat.
- 🏆 **Papan Peringkat (Leaderboard):** Sistem peringkat individu dan kelompok berdasarkan perolehan Total XP dan jumlah stempel.
- 🔐 **Registrasi & Pemilihan Kelompok:** Nama + NIM wajib diisi sebelum bermain (*registration gate*), lengkap dengan pemilih Kelompok Genius (`Genius 01`–`Genius 10`).
- 💾 **Progres Tersimpan:** Seluruh progres (profil, stempel, XP, preferensi suara/CRT) dipersistenkan ke `localStorage` — aman meski halaman di-*refresh*.
- 🖨️ **Cetak Paspor & Sertifikat:** *Print stylesheet* khusus A4 untuk Paspor Digital dan Sertifikat Kelulusan.
- 🎵 **8-Bit Synthesizer Sound Engine:** Efek suara retro dinamis berbasis browser Web Audio API tanpa ketergantungan file audio eksternal (klik, benar, salah, level-up, fanfar selebrasi).
- 📱 **Mobile-First & Fit-to-Screen (100dvh):** Antarmuka responsif penuh yang pas di satu layar ponsel tanpa *scrolling* yang mengganggu selama *gameplay*.

---

## 🏢 Struktur 9 Lantai & 18 Corner

| Lantai | Nama Zona & Tema | Kode & Nama Spot 1 | Kode & Nama Spot 2 | Tipe Game |
| :--- | :--- | :--- | :--- | :--- |
| **L1** | Welcome Hall & Karakter Kampus | `B1-A` Corner Nilai Dasar & Aswaja An-Nahdliyyah | `B1-B` Corner Budaya Akademik & Etika Mahasiswa | Tebak Kata & Benar/Salah |
| **L2** | Kesehatan & Ketahanan Mahasiswa | `B2-A` Corner Klinik Kampus & Konseling Sebaya | `B2-B` Corner Kampus Bersinar (Bersih Narkoba) | Tebak Posisi & Kuis Cepat |
| **L3** | Ruang Kolaborasi & Soft Skills | `B3-A` Corner Dinamika Kelompok & Komunikasi Asertif | `B3-B` Corner Kepemimpinan Inklusif & Organisasi | TTS & Memory Match |
| **L4** | Student Hub & Satgas PPKS | `B4-A` Corner Ruang Aman & Satgas PPKS | `B4-B` Corner Anti-Perundungan & Solidaritas | Benar/Salah & Tebak Posisi |
| **L5** | Perpustakaan & Knowledge Hub | `B5-A` Corner Perpustakaan Modern & Jurnal Digital | `B5-B` Corner Kejujuran Akademik & Anti-Plagiarisme | TTS & Tebak Kata |
| **L6** | Laboratorium Riset & Inovasi | `B6-A` Corner Fasilitas Laboratorium Terpadu | `B6-B` Corner Riset Berkelanjutan & Green Campus | Memory Match & Kuis Cepat |
| **L7** | Inkubator Kreatif & Technopreneur | `B7-A` Corner Inkubator Startup & Technopreneur | `B7-B` Corner Creative Hub & AI Studio | Tebak Kata & Tebak Posisi |
| **L8** | Zona Integritas & Good Governance | `B8-A` Corner Zona Integritas & Good Governance | `B8-B` Corner Tolak Gratifikasi & Suap | TTS & Benar/Salah |
| **L9** | Auditorium Cakrawala & Puncak GENIUS | `B9-A` Corner Visi Kebangsaan & UNU 2045 | `B9-B` Corner Ikrar & Puncak Transformasi "Upgraded You" | Memory Match & Kuis Cepat |

> Kode spot (`B1-A` … `B9-B`) dan pasangan mini-game di atas disinkronkan langsung
> dari `src/data/mockData.ts` (`FLOORS_DATA` & `BOOTHS_DATA`).

---

## 🎲 6 Tipe Mini-Game

1. **TTS Kampus (`TtsGame.tsx`):**
   - Teka-teki silang kotak huruf interaktif dengan navigasi nomor soal mendatar & menurun.
2. **Tebak Kata (`TebakKataGame.tsx`):**
   - Menyusun huruf dari kumpulan tile acak (*scrambled tiles*) dengan sistem slot jawaban dan tombol bantuan *hint*.
3. **Tebak Posisi (`TebakPosisiGame.tsx`):**
   - Menentukan lokasi atau ruang gedung yang tepat berdasarkan foto spot kampus dan pertanyaan situasi.
4. **Memory Match (`MemoryMatchGame.tsx`):**
   - Mencocokkan 4 pasang kartu istilah kampus dalam susunan grid 8 kartu retro.
5. **Kuis Cepat (`KuisCepatGame.tsx`):**
   - Kuis pilihan ganda dengan *countdown timer progress bar* dinamis dan pembahasannya.
6. **Benar / Salah (`BenarSalahGame.tsx`):**
   - Evaluasi pernyataan etika dan nilai kampus dengan tombol taktil besar BENAR atau SALAH.

---

## 💻 Teknologi & Arsitektur

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) dengan skema tema RPG retro (`#2d1b0e` kayu, `#f0d060` emas, `#7ec850` emerald)
- **State Management:** [Zustand v5](https://github.com/pmndrs/zustand) dengan *localStorage persistence* (`genius_unu_game_state_v1`)
- **Animasi & Interaksi:** [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Icons:** [Phosphor Icons (`@phosphor-icons/react`)](https://phosphoricons.com/)
- **Audio:** Web Audio API Native Synthesizer (Tanpa aset MP3 eksternal)
- **Font Stack:** Pixel Font (`Press Start 2P`) & Sans Font (`Plus Jakarta Sans`)

---

## 📁 Struktur Folder

```text
upgrade-new-u-2026/
├── public/                     # Aset gambar & ilustrasi karakter avatar
│   ├── character-cewek-avatar.png
│   ├── character-cowok-avatar.png
│   ├── unu-hero.jpeg
│   └── unu.png
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── layout.tsx          # Root Layout & Viewport config
│   │   ├── page.tsx            # Halaman Utama (Landing Hero)
│   │   ├── peta/               # Peta Gedung 9 Lantai
│   │   ├── paspor/             # Paspor Digital & Sertifikat
│   │   ├── leaderboard/        # Papan Peringkat Individu & Kelompok
│   │   ├── bantuan/            # Panduan Singkat Cara Bermain
│   │   ├── booth/[id]/         # Detail Booth / Corner Akses Cepat
│   │   └── play/
│   │       ├── floor/[floorId]/intro/      # Prolog & Misi Lantai
│   │       ├── floor/[floorId]/spot/[id]/  # Arena Mini-Game Spot
│   │       └── floor/[floorId]/complete/   # Selebrasi Penyelesaian Lantai
│   ├── components/
│   │   ├── landing/            # Komponen Landing Page (HeroSection)
│   │   ├── layout/             # Navbar, Footer, CRT Scanlines
│   │   ├── map/                # BuildingMap & SpotMiniCard
│   │   ├── minigames/          # 6 Engine Mini-Game & Container
│   │   └── ui/                 # PixelBadge, PixelProgress, StampIcon
│   ├── data/
│   │   └── mockData.ts         # Data master 9 Lantai, 18 Booth, Pertanyaan, & Level
│   ├── lib/
│   │   ├── sound.ts            # 8-Bit Web Audio Synthesizer Engine
│   │   └── utils.ts            # Utility functions (cn, clsx)
│   ├── store/
│   │   └── useGameStore.ts     # Zustand Store (Progres, XP, Stempel, State)
│   └── types/
│       └── game.ts             # Definisi tipe TypeScript
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Prasyarat
Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) versi 18.18+ atau 20+
- Package manager: `npm`, `pnpm`, atau `yarn`

### 2. Kloning Repositori
```bash
git clone https://github.com/JurisDataNerd/upgrade-new-u-2026.git
cd upgrade-new-u-2026
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 5. Build untuk Produksi
```bash
npm run build
npm run start
```

---

## 🔊 Audio Engine (Web Audio API)

Aplikasi ini menggunakan synthesizer audio retro prosedural yang dibuat dengan Web Audio API murni ([`src/lib/sound.ts`](src/lib/sound.ts)):
- **Click Sound:** Osilator triangle frekuensi 600Hz -> 300Hz.
- **Success Tone:** Harmoni arpeggio 523Hz -> 659Hz -> 784Hz -> 1046Hz.
- **Error Tone:** Frekuensi rendah sawtooth 180Hz -> 110Hz.
- **Stamp Sound:** Efek perkusi retro dengan kombinasi square wave & noise generator.
- **Victory Fanfare:** Rangkaian melodi kemenangan retro lengkap saat menyelesaikan lantai atau membuka paspor.

*Pengguna dapat membisukan/mengaktifkan suara kapan saja melalui tombol audio di Navbar.*

---

## 📱 Mobile-First & Fit-to-Screen

- Menggunakan unit modern `100dvh` dan `overflow-hidden` pada alur *gameplay* utama agar pas di layar ponsel pintar tanpa *scrolling* ganda.
- Penataan teks dinamis dengan `break-words` dan tipografi adaptif mencegah teks terpotong (*no ellipsis truncation*).
- Pengecualian pada halaman **Leaderboard** dan **Paspor** yang tetap menyediakan *scrolling* vertikal penuh agar nyaman membaca daftar panjang stempel dan peringkat.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT.

---

<p align="center">
  Dibuat dengan semangat inovasi untuk Orientasi Mahasiswa Baru <strong>Universitas Nahdlatul Ulama Yogyakarta</strong> (UNU Jogja)
</p>
