# GENIUS UNU — Production Tracker

Living checklist — update as items close. Roadmap & rationale: see `../plan.md`.

## Track A — Public demo

- [x] Git + GitHub (repo already existed: `JurisDataNerd/upgrade-new-u-2026`)
- [x] Persist localStorage (`genius_unu_game_state_v1` — Zustand `persist` + `StoreHydrator`, `skipHydration` untuk SSR)
- [x] Registration gate (nama + NIM wajib; gate di tombol landing, `/play`, intro lantai, dan spot mini-game)
- [x] Kelompok picker (`Genius 01`–`Genius 10` dari `GENIUS_GROUPS` di modal profil)
- [x] Error/404 pages (`src/app/error.tsx`, `src/app/not-found.tsx`)
- [x] Print CSS (paspor `.print-area`, sertifikat `.print-certificate`, A4 portrait, warna dipertahankan)
- [x] Meta/OG + drop "PROTOTYPE" (OpenGraph/Twitter, `robots.txt`, `app/icon.svg`, footer landing)
- [x] README sync (kode `B1-A`…`B9-B`, nama lantai, pasangan mini-game, URL repo)
- [ ] Vercel deploy (perlu: push GitHub + import project di akun Vercel)
- [ ] Phone QA (Android Chrome + iOS Safari: fit-to-screen, audio unlock, print, refresh → progres tetap)

## Track B — PKKMB event (mulai setelah Track A live)

- [ ] Backend + identity (MongoDB Atlas + Next.js Route Handlers + driver `mongodb`; login by NIM)
- [ ] Live leaderboard (polling `/api/leaderboard` tiap 5–10 s)
- [ ] Admin export (cari NIM, lihat progres, reset 1 mahasiswa, CSV)
- [ ] Real spot photos (Tebak Posisi, 6+ spot kampus asli)
- [ ] Content sign-off (panitia PKKMB / Aswaja / Satgas PPKS)
- [ ] (Optional) QR unlock per corner (`/booth/[id]?token=...`)
- [ ] PWA + offline cache aset statis
- [ ] CI + smoke tests (`lint` + `build` on PR; Playwright register → stempel L1)

## Known issues (pre-existing, non-blocking)

- `npm run lint`: 2 error aturan `react-hooks` (setState sinkron dalam effect) di `KuisCepatGame.tsx:49` dan `MemoryMatchGame.tsx:75` — efek inisialisasi yang sah (reset timer / build deck), perilaku gameplay normal, build produksi lolos. Rapikan sebelum item CI Track B diaktifkan.
- ±29 warning `no-unused-vars` di komponen minigame/booth. Kosmetik.

## Environment variables

| Var | Kapan | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | opsional | URL kanonik untuk OG metadata (default: `https://upgrade-new-u-2026.vercel.app`) |
| `MONGODB_URI` | Track B | Connection string MongoDB Atlas |

## Deploy quickstart (Track A)

1. Commit & push: `git push origin main`
2. Vercel → **Add New Project** → import `JurisDataNerd/upgrade-new-u-2026` → **Deploy** (zero config untuk Next.js)
3. QA di ponsel: buka URL, daftar (nama + NIM + kelompok), selesaikan Lantai 1, refresh → progres harus tetap ada; cetak paspor → hasil A4 rapi.
