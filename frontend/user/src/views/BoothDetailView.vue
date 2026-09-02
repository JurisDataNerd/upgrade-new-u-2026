<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  PhArrowLeft,
  PhCheckCircle,
  PhBookOpen,
} from '@phosphor-icons/vue';
import { BOOTHS_DATA, FLOORS_DATA, AVATAR_OPTIONS } from '@/data/mockData';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import CelebrationModal from '@/components/ui/CelebrationModal.vue';
import StampIcon from '@/components/ui/StampIcon.vue';
import Navbar from '@/components/layout/Navbar.vue';
import CrtScanlines from '@/components/layout/CrtScanlines.vue';
import MiniGameContainer from '@/components/minigames/MiniGameContainer.vue';
import { soundEngine } from '@/lib/sound';
import { PlayerLevel, StampRecord } from '@/types/game';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();

const boothId = computed(() => (route.params.id as string) || '');
const booth = computed(() => BOOTHS_DATA[boothId.value]);
const floor = computed(
  () => FLOORS_DATA.find((f) => f.number === (booth.value ? booth.value.floorNumber : 1)) || FLOORS_DATA[0]
);

const isAlreadyCompleted = computed(() => gameStore.isBoothCompleted(boothId.value));
const selectedAvatarObj = computed(
  () => AVATAR_OPTIONS.find((a) => a.id === gameStore.participant.avatar) || AVATAR_OPTIONS[0]
);

const isSpot1 = computed(() => booth.value && floor.value ? booth.value.id === floor.value.boothIds[0] : true);
const nextSpotId = computed(() => isSpot1.value && floor.value ? floor.value.boothIds[1] : null);

const showStoryModal = ref(false);
const showCelebration = ref(false);
const celebrationDetails = ref<{
  stampRecord: StampRecord | null;
  isFloorCompleted: boolean;
  floorNumber: number;
  isLevelUp: boolean;
  newLevel: PlayerLevel;
}>({
  stampRecord: null,
  isFloorCompleted: false,
  floorNumber: booth.value ? booth.value.floorNumber : 1,
  isLevelUp: false,
  newLevel: 'New You',
});

const handleMiniGameComplete = (score: number, totalQuestions: number) => {
  if (!booth.value) return;
  if (gameStore.soundEnabled) soundEngine.playCorrect();

  const result = gameStore.completeBooth(booth.value.id, score, totalQuestions);

  const stampRecord: StampRecord = {
    boothId: booth.value.id,
    boothName: booth.value.name,
    floorNumber: booth.value.floorNumber,
    stampTitle: booth.value.stampTitle,
    stampIcon: booth.value.stampIcon,
    stampColor: booth.value.stampColor,
    earnedAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    score,
    totalQuestions,
  };

  celebrationDetails.value = {
    stampRecord,
    isFloorCompleted: result.isFloorCompleted,
    floorNumber: booth.value.floorNumber,
    isLevelUp: result.isLevelUp,
    newLevel: result.newLevel,
  };

  showCelebration.value = true;
};

const handleNextStep = () => {
  showCelebration.value = false;
  if (nextSpotId.value) {
    router.push(`/play/floor/${floor.value.number}/spot/${nextSpotId.value}`);
  } else {
    router.push(`/play/floor/${floor.value.number}/complete`);
  }
};
</script>

<template>
  <div v-if="booth" class="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] overflow-hidden">
    <CrtScanlines />
    <Navbar />

    <main class="max-w-2xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2.5 flex-1 flex flex-col justify-between overflow-hidden w-full gap-1.5 sm:gap-2">
      <!-- Top Spot Status Bar -->
      <div class="bg-[#1f140a] border-2 border-[#5a3a18] rounded-xl p-2 sm:p-2.5 shadow-md shrink-0 space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <RouterLink
              :to="`/play/floor/${booth.floorNumber}/intro`"
              @click="() => gameStore.soundEnabled && soundEngine.playClick()"
              class="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-pixel text-[#c4956a] hover:text-[#f0d060] transition-colors shrink-0 bg-[#170f07] px-2 py-1 rounded border border-[#5a3a18]"
            >
              <PhArrowLeft :size="12" weight="bold" />
              <span>LT {{ booth.floorNumber }}</span>
            </RouterLink>

            <span class="font-pixel text-[8px] sm:text-[9px] text-[#f0d060] bg-[#281c12] px-1.5 py-1 rounded border border-[#5a3a18]">
              {{ booth.code }}
            </span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              @click="() => {
                if (gameStore.soundEnabled) soundEngine.playSelect();
                showStoryModal = true;
              }"
              class="py-1 px-2.5 text-[8px] sm:text-[9px] font-pixel text-[#f0d060] bg-[#2d1b0e] hover:bg-[#3d2b1e] border border-[#8b6f4e] rounded-md flex items-center gap-1 cursor-pointer shadow"
            >
              <PhBookOpen :size="12" weight="fill" />
              <span>Materi</span>
            </button>

            <div v-if="isAlreadyCompleted" class="flex items-center gap-1 bg-[#14230f] border border-[#7ec850] rounded-md px-1.5 py-0.5">
              <PhCheckCircle :size="12" weight="fill" class="text-[#7ec850]" />
              <span class="font-pixel text-[8px] text-[#7ec850]">Selesai</span>
            </div>
            <PixelBadge v-else variant="gold" size="sm">
              +250 XP
            </PixelBadge>
          </div>
        </div>

        <!-- Spot Title Line with Stamp Icon -->
        <div class="flex items-center gap-2 border-t border-[#3d2b1e] pt-1.5">
          <div class="w-6 h-6 bg-[#170f07] border border-[#f0d060] rounded-md flex items-center justify-center shrink-0">
            <StampIcon :name="booth.stampIcon" :size="14" class="text-[#f0d060]" />
          </div>
          <h1 class="font-pixel text-[9px] sm:text-[11px] font-bold text-white leading-normal break-words flex-1">
            {{ booth.name }}
          </h1>
        </div>
      </div>

      <!-- Dynamic Mini-Game Arena -->
      <div class="flex-1 sdv-card p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden shadow-lg">
        <MiniGameContainer
          :booth="booth"
          :isCompleted="isAlreadyCompleted"
          @complete="handleMiniGameComplete"
        />
      </div>
    </main>

    <!-- Educational Story Lore Modal -->
    <div
      v-if="showStoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div class="w-full max-w-md bg-gradient-to-b from-[#2d1b0e] to-[#170f07] border-[3px] border-[#f0d060] rounded-2xl p-4 sm:p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-[#5a3a18] pb-2 mb-3">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <div class="w-7 h-7 bg-[#170f07] border border-[#f0d060] rounded-md flex items-center justify-center shrink-0">
              <StampIcon :name="booth.stampIcon" :size="16" class="text-[#f0d060]" />
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-[8px] font-pixel text-[#7ec850] uppercase block">
                Materi Corner • {{ booth.code }}
              </span>
              <h3 class="font-pixel text-[10px] sm:text-xs font-bold text-white leading-normal break-words">
                {{ booth.name }}
              </h3>
            </div>
          </div>

          <button
            type="button"
            @click="showStoryModal = false"
            class="text-[#a08060] hover:text-[#f0d060] p-1 font-pixel text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="flex items-start gap-3 bg-[#170f07] p-3 rounded-xl border border-[#5a3a18] mb-4">
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-[#281c12] border border-[#f0d060] shrink-0 relative">
            <img
              :src="selectedAvatarObj.avatarImage"
              :alt="selectedAvatarObj.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="min-w-0 flex-1 space-y-1">
            <span class="font-pixel text-[9px] text-[#f0d060] block">
              {{ gameStore.participant.name }}
            </span>
            <p class="font-sans text-xs text-[#f0e6d2] leading-relaxed text-justify break-words">
              {{ booth.story }}
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="() => {
            if (gameStore.soundEnabled) soundEngine.playClick();
            showStoryModal = false;
          }"
          class="w-full rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold cursor-pointer"
        >
          TUTUP & MAINKAN MISI
        </button>
      </div>
    </div>

    <!-- Stamp Award Celebration Modal -->
    <CelebrationModal
      :isOpen="showCelebration"
      :stampRecord="celebrationDetails.stampRecord"
      :isFloorCompleted="celebrationDetails.isFloorCompleted"
      :floorNumber="celebrationDetails.floorNumber"
      :isLevelUp="celebrationDetails.isLevelUp"
      :newLevel="celebrationDetails.newLevel"
      :nextActionLabel="nextSpotId ? 'Ke Spot Selanjutnya' : 'Evaluasi Lantai Tuntas'"
      @close="showCelebration = false"
      @nextAction="handleNextStep"
    />
  </div>
  <div v-else class="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
    <Navbar />
    <div class="flex-1 flex items-center justify-center p-6 text-center">
      <div class="p-8 max-w-md sdv-card-gold text-center space-y-4">
        <h2 class="font-pixel text-base font-bold text-[#ff8080]">
          BOOTH TIDAK DITEMUKAN
        </h2>
        <p class="font-sans text-sm text-[#d0c0a0]">
          Maaf, ID booth &quot;{{ boothId }}&quot; tidak terdaftar dalam gedung 9 lantai ini.
        </p>
        <RouterLink to="/peta">
          <button class="rpg-btn-primary py-3 px-6 text-xs font-pixel font-bold">
            Kembali ke Peta Gedung
          </button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
