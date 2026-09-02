# UNU Genius 2026 — Monorepo Rules & Stack

## Monorepo Architecture (Bun Workspaces)

### 1. `frontend/user` (`@genius-unu/user`)
* **Purpose:** Aplikasi eksplorasi gamifikasi interaktif untuk Mahasiswa Baru PKKMB UNU Yogyakarta 2026.
* **Tech Stack:** Vue 3 (Composition API `<script setup lang="ts">`), Vite 6 + `@tailwindcss/vite`, Vue Router 4, Pinia, `@phosphor-icons/vue`, Tailwind CSS v4 + Stardew Valley Retro RPG Theme.
* **Port:** `http://localhost:3000`

### 2. `frontend/admin` (`@genius-unu/admin`)
* **Purpose:** Dashboard admin & panitia PKKMB untuk memonitor progres 9 lantai, 18 booth, data mahasiswa, stempel, dan leaderboard.
* **Tech Stack:** Vue 3, Vite 6 + `@tailwindcss/vite`, Vue Router 4, Pinia, `@phosphor-icons/vue`, Tailwind CSS v4.
* **Port:** `http://localhost:3002`

### 3. `backend` (`@genius-unu/backend`)
* **Purpose:** REST API backend service untuk otentikasi, verifikasi stempel, leaderboard, dan data management.
* **Tech Stack:** Hono Framework, Bun runtime / Node.js, TypeScript.
* **Port:** `http://localhost:3001`

### 4. `packages/shared` (`@genius-unu/shared`)
* **Purpose:** Shared TypeScript domain types (Participant, Floor, Booth, Stamp, Leaderboard, Admin), API response contracts, and constants.

## Key Commands
```bash
# Install dependencies
bun install

# Run user frontend (Port 3000)
bun run dev:user

# Run admin dashboard (Port 3002)
bun run dev:admin

# Run backend API (Port 3001)
bun run dev:backend

# Run all packages concurrently
bun run dev

# Build all packages
bun run build
```
