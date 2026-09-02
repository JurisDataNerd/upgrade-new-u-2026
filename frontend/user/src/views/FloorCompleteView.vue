<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import confetti from 'canvas-confetti';
import {
  PhTrophy,
  PhSparkle,
  PhArrowRight,
  PhBuildings,
} from '@phosphor-icons/vue';
import { FLOORS_DATA, BOOTHS_DATA, LEVEL_CONFIG } from '@/data/mockData';
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

const stampA = computed(() => gameStore.participant.stamps[boothA.value.id]);
const stampB = computed(() => gameStore.participant.stamps[boothB.value.id]);

const currentLevel = computed(() => gameStore.getCurrentLevel());
const completedFloors = computed(() => gameStore.getCompletedFloorsCount());
const currentLevelData = computed(
  () => LEVEL_CONFIG.find((l) => l.level === currentLevel.value) || LEVEL_CONFIG[0]
);

const hasNextFloor = computed(() => floorNumber.value < 9);
const nextFloorNumber = computed(() => floorNumber.value + 1);

onMounted(() => {
  confetti({
    particleCount: 100,
    spread: 90,
    origin: { y: 0.5 },
    colors: ['#7ec850', '#f0d060', '#60a8d8', '#c4956a', '#ffffff'],
  });

  if (gameStore.soundEnabled) {
    soundEngine.playLevelUp();
  }
});

const handleNextAction = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  if (hasNextFloor.value) {
    router.push(`/play/floor/${nextFloorNumber.value}/intro`);
  } else {
    router.push('/paspor');
  }
};
</script>

<template>
  <div class="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] overflow-hidden">
    <CrtScanlines />
    <Navbar />

    <main class="max-w-2xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex-1 flex flex-col justify-between items-center text-center overflow-hidden w-full gap-2">
      <!-- Victory Badge -->
      <div class="inline-flex items-center gap-1.5 bg-[#14230f] border-2 border-[#7ec850] rounded-full px-3 py-1 shadow-md shrink-0">
        <PhSparkle :size="14" weight="fill" class="text-[#f0d060]" />
        <span class="font-pixel text-[9px] text-[#7ec850] font-bold uppercase tracking-wider">
          Lantai {{ floor.number }} Selesai!
        </span>
      </div>

      <!-- Grand Card -->
      <div class="w-full flex-1 sdv-card-gold p-3 sm:p-5 flex flex-col justify-between text-center overflow-hidden shadow-2xl">
        <!-- Header Title -->
        <div class="space-y-1 shrink-0">
          <h1 class="font-pixel text-sm sm:text-xl font-bold text-[#f0d060] tracking-wide leading-snug break-words">
            {{ hasNextFloor ? `LANTAI ${floor.number} TUNTAS!` : 'SEMUA LANTAI TUNTAS!' }}
          </h1>
          <p class="font-sans text-[11px] sm:text-xs text-[#f0e6d2] max-w-md mx-auto leading-snug break-words">
            2 stempel di <strong>{{ floor.name }}</strong> berhasil dikumpulkan!
          </p>
        </div>

        <!-- 2 Collected Stamps Showcase -->
        <div class="grid grid-cols-2 gap-2 my-1">
          <!-- Stamp 1 -->
          <div class="bg-[#170f07] p-2 rounded-xl border-2 border-[#7ec850] flex items-center gap-2 shadow-inner">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-b from-[#3d7828] to-[#255018] border border-[#f0d060] flex items-center justify-center shrink-0 shadow">
              <StampIcon :name="boothA.stampIcon" :size="16" class="text-[#f0d060]" />
            </div>
            <div class="text-left min-w-0 flex-1">
              <span class="font-pixel text-[7px] text-[#7ec850] uppercase block">
                {{ boothA.code }} • Stempel
              </span>
              <h4 class="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-normal break-words mt-0.5">
                {{ boothA.name }}
              </h4>
              <span class="font-mono text-[9px] text-[#f0d060] block mt-0.5">
                Skor: {{ stampA?.score ?? 2 }}/{{ stampA?.totalQuestions ?? 2 }} Benar
              </span>
            </div>
          </div>

          <!-- Stamp 2 -->
          <div class="bg-[#170f07] p-2 rounded-xl border-2 border-[#7ec850] flex items-center gap-2 shadow-inner">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-b from-[#3d7828] to-[#255018] border border-[#f0d060] flex items-center justify-center shrink-0 shadow">
              <StampIcon :name="boothB.stampIcon" :size="16" class="text-[#f0d060]" />
            </div>
            <div class="text-left min-w-0 flex-1">
              <span class="font-pixel text-[7px] text-[#7ec850] uppercase block">
                {{ boothB.code }} • Stempel
              </span>
              <h4 class="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-normal break-words mt-0.5">
                {{ boothB.name }}
              </h4>
              <span class="font-mono text-[9px] text-[#f0d060] block mt-0.5">
                Skor: {{ stampB?.score ?? 2 }}/{{ stampB?.totalQuestions ?? 2 }} Benar
              </span>
            </div>
          </div>
        </div>

        <!-- Level Progress Banner -->
        <div class="bg-[#281c12] p-2 sm:p-2.5 rounded-xl border border-[#8b6f4e] flex items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 sm:w-8 sm:h-8 bg-[#170f07] border border-[#f0d060] rounded-lg flex items-center justify-center text-base shrink-0">
              <PhTrophy :size="16" weight="fill" class="text-[#f0d060]" />
            </div>
            <div class="text-left min-w-0">
              <div class="font-pixel text-[10px] sm:text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span class="text-[#f0d060]">{{ currentLevel }}</span>
                <span class="text-[#a08060]">•</span>
                <span class="text-[#7ec850]">{{ completedFloors }}/9 Lt</span>
              </div>
            </div>
          </div>

          <PixelBadge variant="gold" size="sm">
            {{ gameStore.participant.totalXp }} XP
          </PixelBadge>
        </div>

        <!-- Action CTAs -->
        <div class="pt-1 flex items-center justify-center gap-2 shrink-0">
          <button
            type="button"
            @click="handleNextAction"
            class="flex-1 rpg-btn-primary py-2.5 sm:py-3 px-4 text-xs font-pixel font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <span>
              {{ hasNextFloor ? `Lanjut L${nextFloorNumber}` : 'Buka Paspor' }}
            </span>
            <PhArrowRight :size="14" weight="bold" />
          </button>

          <RouterLink to="/peta" class="shrink-0">
            <button
              type="button"
              @click="() => gameStore.soundEnabled && soundEngine.playClick()"
              class="rpg-btn-wood py-2.5 sm:py-3 px-3 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhBuildings :size="14" weight="bold" />
              <span>Peta</span>
            </button>
          </RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>
