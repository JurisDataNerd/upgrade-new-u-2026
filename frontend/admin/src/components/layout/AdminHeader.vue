<script setup lang="ts">
import { PhMagnifyingGlass, PhBell, PhBroadcast } from '@phosphor-icons/vue';
import { useAdminStore } from '../../store/adminStore';

const store = useAdminStore();
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
    <div class="flex items-center gap-4 flex-1 max-w-md">
      <div class="relative w-full">
        <PhMagnifyingGlass :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="Cari mahasiswa (NIM, Nama, Prodi)..."
          class="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
        />
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Live Badge -->
      <div class="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-medium">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>PKKMB 2026 Live</span>
      </div>

      <!-- Quick Action / Notification -->
      <button
        class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
        title="Broadcast Pengumuman"
      >
        <PhBroadcast :size="20" />
      </button>

      <button
        class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
        title="Notifikasi"
      >
        <PhBell :size="20" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
      </button>
    </div>
  </header>
</template>
