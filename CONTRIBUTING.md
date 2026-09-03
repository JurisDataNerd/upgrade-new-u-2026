# 🤝 Panduan Kontribusi Pengembang — UNU Genius 2026

Selamat datang di repositori monorepo **UNU Genius 2026**! Dokumen ini memandu Anda dan rekan pengembang agar dapat bekerja sama secara kolaboratif, rapi, dan mematuhi standar arsitektur sistem.

---

## 🏗️ Struktur Monorepo (Bun Workspaces)

```text
genius_project/
├── backend/                  # REST API & WebSocket (Elysia.js + Drizzle ORM) [Port 3001]
├── frontend/
│   ├── user/                 # Web Mahasiswa Baru (Vue 3 + Vite + RPG Theme) [Port 3000]
│   └── admin/                # Dashboard Panitia & Buddy (Nuxt 3) [Port 3002]
├── packages/
│   └── shared/               # Domain Types, Interfaces, & Game Constants (@genius-unu/shared)
├── tasks/                    # Task Tracker & Roadmap Pengerjaan Menuju MVP
└── docs/                     # Dokumentasi Lengkap Arsitektur, Event Flow, & Panduan
```

---

## ⚡ Alur Menjalankan Project di Lokal

Pastikan mesin Anda telah terpasang **[Bun](https://bun.sh)** dan **Docker Desktop**.

```bash
# 1. Install seluruh dependensi monorepo
bun install

# 2. Jalankan database PostgreSQL di Docker
docker compose -f docker-compose.dev.yml up -d

# 3. Jalankan semua paket secara bersamaan
bun run dev

# Atau jalankan service tertentu:
bun run dev:backend   # API di http://localhost:3001
bun run dev:user      # Maba di http://localhost:3000
bun run dev:admin     # Admin di http://localhost:3002
```

---

## 🎮 Ingin Menambah Modul Game Pos Baru?

Arsitektur game di `frontend/user` bersifat **Plug-and-Play (Zero-Coupling)**. Game baru tidak boleh mengotori state global secara langsung.

Ikuti panduan lengkap 5 langkah di:
👉 [**`docs/08-PANDUAN-MODUL-GAME-DAN-KONTRIBUSI.md`**](./docs/08-PANDUAN-MODUL-GAME-DAN-KONTRIBUSI.md)

### Ringkasan Aturan Game Baru:
1. **Daftarkan Tipe:** Tambahkan `GameType` baru dan interface kontennya di `packages/shared/src/types/game.ts`.
2. **Buat Komponen:** Letakkan di `frontend/user/src/components/minigames/[NamaGame]Game.vue`.
3. **Kontrak Interface:** Wajib menerima `props: { content, isCompleted }` dan memancarkan `emit('complete', score, totalQuestions)`.
4. **Hubungkan Container:** Daftarkan cabang baru di `MiniGameContainer.vue`.
5. **Estetika:** Gunakan palet retro *Stardew Valley* (Border `#3a2818`, Bg `#fbf6e9`, Green `#38761d`) dan audio feedback dari `useAudio()`.

---

## 🛡️ Aturan Standar Kode (Coding Guidelines)

* **TypeScript Strict:** Jangan gunakan `any` tanpa alasan kuat. Manfaatkan tipe bersama dari `@genius-unu/shared`.
* **Vue 3 Composition API:** Selalu gunakan `<script setup lang="ts">`.
* **Port Standar:**
  * Backend API: `3001`
  * Frontend Maba: `3000`
  * Frontend Admin: `3002`
  * PostgreSQL: `5432`

---

## ✅ Quality Gate Sebelum Commit / PR

Sebelum mengirimkan perubahan, jalankan pengujian berikut di root repositori:

```bash
# 1. Validasi tipe TypeScript bebas error
bun run typecheck

# 2. Validasi seluruh paket berhasil dibuild
bun run build
```
Jika kedua perintah di atas keluar dengan kode `0`, kode Anda dinyatakan **valid dan aman untuk digabungkan!**
