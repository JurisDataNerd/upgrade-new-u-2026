<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  PhArrowLeft,
  PhArrowRight,
  PhPlay,
  PhCheckCircle,
  PhBuildings,
} from '@phosphor-icons/vue';
import { FLOORS_DATA, BOOTHS_DATA, AVATAR_OPTIONS } from '@/data/mockData';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import StampIcon from '@/components/ui/StampIcon.vue';
import Navbar from '@/components/layout/Navbar.vue';
import CrtScanlines from '@/components/layout/CrtScanlines.vue';
import { soundEngine } from '@/lib/sound';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();

const floorNumber = computed(() => parseInt((route.params.floorId as string) || '1', 10) || 1);
const floor = computed(() => FLOORS_DATA.find((f) => f.number === floorNumber.value) || FLOORS_DATA[0]);
const boothA = computed(() => BOOTHS_DATA[floor.value.boothIds[0]]);
const boothB = computed(() => BOOTHS_DATA[floor.value.boothIds[1]]);

const isPortalPulsing = ref(false);
const floorStatus = computed(() => gameStore.getFloorStatus(floor.value.number));

const selectedAvatar = computed(
  () => AVATAR_OPTIONS.find((a) => a.id === gameStore.participant.avatar) || AVATAR_OPTIONS[0]
);

const handleStartSpot1 = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  router.push(`/play/floor/${floor.value.number}/spot/${boothA.value.id}`);
};

const handlePortalTap = () => {
  if (gameStore.soundEnabled) soundEngine.playSelect();
  isPortalPulsing.value = true;
  setTimeout(() => (isPortalPulsing.value = false), 500);
};

const getGameTypeLabel = (type: string) => {
  switch (type) {
    case 'tts':
      return 'Teka-Teki Silang';
    case 'tebak_kata':
      return 'Tebak Kata';
    case 'tebak_posisi':
      return 'Tebak Lokasi';
    case 'memory_match':
      return 'Mencocokkan Kartu';
    case 'kuis_cepat':
      return 'Kuis Cepat';
    case 'benar_salah':
      return 'Benar / Salah';
    default:
      return 'Tantangan Mini-Game';
  }
};
</script>

<template>
  <div class="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] w-full overflow-hidden">
    <CrtScanlines />
    <Navbar />

    <main class="max-w-2xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-hidden w-full gap-2">
      <!-- Navigation Breadcrumb -->
      <div class="flex items-center justify-between shrink-0">
        <RouterLink
          to="/peta"
          @click="() => gameStore.soundEnabled && soundEngine.playClick()"
          class="inline-flex items-center gap-1.5 text-[11px] font-pixel text-[#c4956a] hover:text-[#f0d060] transition-colors"
        >
          <PhArrowLeft :size="14" weight="bold" />
          <span>Peta</span>
        </RouterLink>

        <div class="flex items-center gap-1.5">
          <PixelBadge variant="gold" size="sm">
            Lantai {{ floor.number }} dari 9
          </PixelBadge>
          <PixelBadge v-if="floorStatus === 'completed'" variant="emerald" size="sm">
            Tuntas
          </PixelBadge>
        </div>
      </div>

      <!-- Main Floor Banner Card -->
      <div class="flex-1 sdv-card-gold p-3 sm:p-5 flex flex-col justify-between overflow-hidden text-center shadow-xl">
        <!-- Header Title -->
        <div class="space-y-0.5 shrink-0">
          <div class="inline-flex items-center gap-1 font-pixel text-[8px] sm:text-[9px] text-[#7ec850] uppercase tracking-wider bg-[#170f07] px-2.5 py-0.5 rounded-full border border-[#5a3a18]">
            <PhBuildings :size="12" weight="fill" class="text-[#f0d060]" />
            <span>ZONA EKSPLORASI KAMPUS</span>
          </div>
          <h1 class="font-pixel text-sm sm:text-lg font-bold text-white tracking-wide mt-1 leading-snug break-words">
            {{ floor.name }}
          </h1>
          <p class="font-pixel text-[9px] sm:text-[10px] text-[#f0d060] leading-normal break-words">
            {{ floor.theme }}
          </p>
        </div>

        <!-- Interactive Portal + Dialogue Row -->
        <div class="my-1.5 flex items-center gap-2.5 sm:gap-4 text-left bg-[#170f07] p-2.5 sm:p-3 border-2 border-[#5a3a18] rounded-xl shadow-inner shrink-0">
          <div class="relative shrink-0">
            <button
              type="button"
              @click="handlePortalTap"
              title="Klik portal gedung"
              :class="[
                'w-14 h-14 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-b from-[#f0d060] to-[#5a3a18] shadow-md transition-transform cursor-pointer relative overflow-hidden',
                isPortalPulsing ? 'scale-105' : 'hover:scale-105'
              ]"
            >
              <div class="w-full h-full rounded-full overflow-hidden relative border-2 border-[#2d1b0e]">
                <img
                  src="/unu-hero.jpeg"
                  :alt="`Gedung Lantai ${floor.number}`"
                  class="w-full h-full object-cover object-center filter brightness-[0.9]"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#1c120a]/80 via-transparent to-black/30" />
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="font-pixel text-[7px] sm:text-[9px] text-[#f0d060] font-black bg-[#170f07]/90 px-1.5 py-0.5 rounded border border-[#f0d060]">
                    L{{ floor.number }}
                  </span>
                </div>
              </div>
            </button>

            <div
              v-if="floorStatus === 'completed'"
              class="absolute -top-1 -right-1 bg-[#7ec850] text-[#1b120a] p-0.5 rounded-full shadow border border-[#1c120a]"
            >
              <PhCheckCircle :size="14" weight="fill" />
            </div>
          </div>

          <!-- Character Dialogue Quote -->
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <div class="w-5 h-5 rounded-md overflow-hidden bg-[#281c12] border border-[#f0d060] shrink-0 relative">
                <img
                  :src="selectedAvatar.avatarImage"
                  :alt="selectedAvatar.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="font-pixel text-[9px] text-[#f0d060] font-bold">
                {{ gameStore.participant.name }}
              </span>
              <span class="text-[8px] font-pixel text-[#7ec850]">• Misi Lantai</span>
            </div>
            <p class="font-sans text-[11px] sm:text-xs text-[#d0c0a0] leading-relaxed text-justify break-words">
              &ldquo;{{ floor.storyIntro?.narrative || floor.description }}&rdquo;
            </p>
          </div>
        </div>

        <!-- 2 Spots Grid Preview -->
        <div class="space-y-1.5 text-left py-1">
          <div class="flex items-center justify-between px-1">
            <span class="font-pixel text-[8px] sm:text-[9px] text-[#a08060] uppercase">
              Tantangan di Lantai Ini:
            </span>
            <span class="font-pixel text-[8px] sm:text-[9px] text-[#7ec850]">
              Total: +500 XP & 2 Stempel
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <!-- Spot 1 -->
            <div
              :class="[
                'p-2 rounded-xl border transition-all',
                gameStore.participant.completedBooths.includes(boothA.id)
                  ? 'bg-[#1a2e1a] border-[#7ec850]'
                  : 'bg-[#170f07] border-[#5a3a18]'
              ]"
            >
              <div class="flex items-center justify-between gap-1 mb-1">
                <div class="flex items-center gap-1.5 min-w-0">
                  <div class="w-6 h-6 rounded-md bg-[#281c12] border border-[#f0d060] flex items-center justify-center shrink-0">
                    <StampIcon :name="boothA.stampIcon" :size="14" class="text-[#f0d060]" />
                  </div>
                  <span class="font-pixel text-[8px] text-[#7ec850] font-bold">
                    {{ boothA.code }}
                  </span>
                </div>

                <PhCheckCircle
                  v-if="gameStore.participant.completedBooths.includes(boothA.id)"
                  :size="14"
                  weight="fill"
                  class="text-[#7ec850] shrink-0"
                />
                <span v-else class="text-[8px] font-pixel text-[#f0d060] bg-[#281c12] px-1 py-0.5 rounded border border-[#5a3a18]">
                  +250 XP
                </span>
              </div>

              <h4 class="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-normal break-words mt-0.5">
                {{ boothA.name }}
              </h4>
              <div class="text-[9px] font-sans text-[#c4956a] mt-0.5">
                {{ getGameTypeLabel(boothA.tipe_game) }}
              </div>
            </div>

            <!-- Spot 2 -->
            <div
              :class="[
                'p-2 rounded-xl border transition-all',
                gameStore.participant.completedBooths.includes(boothB.id)
                  ? 'bg-[#1a2e1a] border-[#7ec850]'
                  : 'bg-[#170f07] border-[#5a3a18]'
              ]"
            >
              <div class="flex items-center justify-between gap-1 mb-1">
                <div class="flex items-center gap-1.5 min-w-0">
                  <div class="w-6 h-6 rounded-md bg-[#281c12] border border-[#f0d060] flex items-center justify-center shrink-0">
                    <StampIcon :name="boothB.stampIcon" :size="14" class="text-[#f0d060]" />
                  </div>
                  <span class="font-pixel text-[8px] text-[#f0d060] font-bold">
                    {{ boothB.code }}
                  </span>
                </div>

                <PhCheckCircle
                  v-if="gameStore.participant.completedBooths.includes(boothB.id)"
                  :size="14"
                  weight="fill"
                  class="text-[#7ec850] shrink-0"
                />
                <span v-else class="text-[8px] font-pixel text-[#f0d060] bg-[#281c12] px-1 py-0.5 rounded border border-[#5a3a18]">
                  +250 XP
                </span>
              </div>

              <h4 class="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-normal break-words mt-0.5">
                {{ boothB.name }}
              </h4>
              <div class="text-[9px] font-sans text-[#c4956a] mt-0.5">
                {{ getGameTypeLabel(boothB.tipe_game) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Action CTA Button -->
        <div class="pt-1 shrink-0">
          <button
            type="button"
            @click="handleStartSpot1"
            class="w-full rpg-btn-primary py-2.5 sm:py-3.5 px-4 text-xs sm:text-sm font-pixel font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <PhPlay :size="16" weight="fill" />
            <span>MASUK KE SPOT 1 ({{ boothA.code }})</span>
            <PhArrowRight :size="16" weight="bold" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
