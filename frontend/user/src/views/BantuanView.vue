<script setup lang="ts">
import { RouterLink } from 'vue-router';
import {
  PhInfo,
  PhSparkle,
  PhCards,
  PhLightning,
  PhShieldCheck,
  PhMapPin,
  PhGameController,
  PhPlay,
  PhIdentificationBadge,
} from '@phosphor-icons/vue';
import Navbar from '@/components/layout/Navbar.vue';
import CrtScanlines from '@/components/layout/CrtScanlines.vue';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';

const gameStore = useGameStore();
</script>

<template>
  <div class="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] overflow-hidden">
    <CrtScanlines />
    <Navbar />

    <main class="max-w-2xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-hidden w-full gap-2">
      <!-- Simple Header -->
      <div class="text-center space-y-0.5 shrink-0">
        <div class="inline-flex items-center gap-1 bg-[#14230f] border border-[#7ec850] rounded-full px-2.5 py-0.5 text-[8px] sm:text-[9px] font-pixel text-[#7ec850]">
          <PhInfo :size="12" weight="bold" />
          <span>PANDUAN SINGKAT</span>
        </div>
        <h1 class="font-pixel text-sm sm:text-lg font-bold text-[#f0d060] mt-0.5 leading-snug break-words">
          CARA BERMAIN GENIUS
        </h1>
        <p class="font-sans text-[11px] sm:text-xs text-[#c4956a] leading-snug break-words">
          Jelajahi 9 lantai gedung kampus UNU dan kumpulkan 18 stempel digital.
        </p>
      </div>

      <!-- 3 Simple Steps Grid -->
      <div class="grid grid-cols-3 gap-1.5 shrink-0">
        <div class="bg-[#170f07] p-2 rounded-xl border border-[#5a3a18] space-y-1 text-center">
          <div class="w-6 h-6 rounded-md bg-[#23160c] border border-[#7ec850] text-[#7ec850] font-pixel text-[10px] font-bold flex items-center justify-center mx-auto">
            1
          </div>
          <h3 class="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-tight break-words">
            Prolog Lantai
          </h3>
          <p class="font-sans text-[9px] sm:text-[10px] text-[#a08060] leading-tight break-words">
            Buka tema & misi karakter.
          </p>
        </div>

        <div class="bg-[#170f07] p-2 rounded-xl border border-[#5a3a18] space-y-1 text-center">
          <div class="w-6 h-6 rounded-md bg-[#23160c] border border-[#f0d060] text-[#f0d060] font-pixel text-[10px] font-bold flex items-center justify-center mx-auto">
            2
          </div>
          <h3 class="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-tight break-words">
            2 Spot Game
          </h3>
          <p class="font-sans text-[9px] sm:text-[10px] text-[#a08060] leading-tight break-words">
            Mainkan TTS, Kuis, Memory.
          </p>
        </div>

        <div class="bg-[#170f07] p-2 rounded-xl border border-[#5a3a18] space-y-1 text-center">
          <div class="w-6 h-6 rounded-md bg-[#23160c] border border-[#60a8d8] text-[#60a8d8] font-pixel text-[10px] font-bold flex items-center justify-center mx-auto">
            3
          </div>
          <h3 class="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-tight break-words">
            18 Stempel
          </h3>
          <p class="font-sans text-[9px] sm:text-[10px] text-[#a08060] leading-tight break-words">
            Klaim paspor & sertifikat.
          </p>
        </div>
      </div>

      <!-- 6 Mini-Game Types Compact List -->
      <div class="flex-1 sdv-card p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden shadow-lg">
        <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-pixel text-[#f0d060] border-b border-[#5a3a18] pb-1.5 shrink-0">
          <PhGameController :size="14" weight="bold" />
          <span>6 TIPE MINI-GAME</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] sm:text-xs font-sans py-1">
          <div class="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
            <PhSparkle :size="12" weight="fill" class="text-[#7ec850] shrink-0" />
            <span class="text-[#f0e0c0] leading-tight break-words">TTS Kampus</span>
          </div>
          <div class="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
            <PhSparkle :size="12" weight="fill" class="text-[#f0d060] shrink-0" />
            <span class="text-[#f0e0c0] leading-tight break-words">Tebak Kata</span>
          </div>
          <div class="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
            <PhMapPin :size="12" weight="fill" class="text-[#60a8d8] shrink-0" />
            <span class="text-[#f0e0c0] leading-tight break-words">Tebak Posisi</span>
          </div>
          <div class="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
            <PhCards :size="12" weight="fill" class="text-[#f0a030] shrink-0" />
            <span class="text-[#f0e0c0] leading-tight break-words">Memory Match</span>
          </div>
          <div class="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
            <PhLightning :size="12" weight="fill" class="text-[#e0a040] shrink-0" />
            <span class="text-[#f0e0c0] leading-tight break-words">Kuis Cepat</span>
          </div>
          <div class="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
            <PhShieldCheck :size="12" weight="fill" class="text-[#7ec850] shrink-0" />
            <span class="text-[#f0e0c0] leading-tight break-words">Benar / Salah</span>
          </div>
        </div>

        <div class="text-[9px] font-sans text-[#a08060] text-center border-t border-[#3d2b1e] pt-1 shrink-0">
          Setiap tantangan yang selesai akan otomatis menambahkan stempel & XP!
        </div>
      </div>

      <!-- Quick Actions CTA -->
      <div class="flex gap-2 pt-0.5 shrink-0">
        <RouterLink to="/play" class="flex-1">
          <button
            type="button"
            @click="() => gameStore.soundEnabled && soundEngine.playClick()"
            class="w-full rpg-btn-primary py-2.5 px-3 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PhPlay :size="14" weight="fill" />
            <span>Mulai Main</span>
          </button>
        </RouterLink>

        <RouterLink to="/paspor" class="flex-1">
          <button
            type="button"
            @click="() => gameStore.soundEnabled && soundEngine.playClick()"
            class="w-full rpg-btn-wood py-2.5 px-3 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PhIdentificationBadge :size="14" weight="bold" />
            <span>Lihat Paspor</span>
          </button>
        </RouterLink>
      </div>
    </main>
  </div>
</template>
