<script setup lang="ts">
import { watch } from 'vue';
import confetti from 'canvas-confetti';
import { PhSparkle, PhTrophy, PhCheckCircle, PhArrowRight } from '@phosphor-icons/vue';
import PixelButton from './PixelButton.vue';
import PixelBadge from './PixelBadge.vue';
import StampIcon from './StampIcon.vue';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';
import { StampRecord, PlayerLevel } from '@/types/game';

interface Props {
  isOpen: boolean;
  stampRecord?: StampRecord | null;
  isFloorCompleted?: boolean;
  floorNumber?: number;
  isLevelUp?: boolean;
  newLevel?: PlayerLevel;
  nextActionLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  stampRecord: null,
  isFloorCompleted: false,
  floorNumber: 1,
  isLevelUp: false,
  newLevel: 'New You',
  nextActionLabel: 'Lanjut',
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'nextAction'): void;
}>();

const gameStore = useGameStore();

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;

    confetti({
      particleCount: props.isLevelUp ? 120 : 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7ec850', '#f0d060', '#60a8d8', '#c4956a', '#ffffff'],
    });

    if (gameStore.soundEnabled) {
      if (props.isLevelUp) {
        soundEngine.playLevelUp();
      } else {
        soundEngine.playStampSlam();
      }
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit('close');
};

const handleNext = () => {
  emit('nextAction');
};
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-200">
    <div class="w-full max-w-md bg-gradient-to-b from-[#2d1b0e] to-[#1a1008] border-[3.5px] border-[#f0d060] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
      <!-- Level Up Banner if applicable -->
      <div v-if="props.isLevelUp" class="mb-4 bg-[#14230f] border-2 border-[#7ec850] p-2.5 rounded-lg shadow-md animate-bounce">
        <div class="flex items-center justify-center gap-2 font-pixel text-xs text-[#f0d060]">
          <PhTrophy :size="16" weight="fill" class="text-[#f0d060]" />
          <span>Naik Level! → {{ props.newLevel }}</span>
        </div>
      </div>

      <!-- Floor Completed Banner -->
      <div v-else-if="props.isFloorCompleted" class="mb-4 bg-[#14230f] border-2 border-[#7ec850] p-2.5 rounded-lg shadow-md">
        <div class="flex items-center justify-center gap-1.5 font-pixel text-xs text-[#7ec850]">
          <PhSparkle :size="16" weight="fill" class="text-[#f0d060]" />
          <span>Lantai {{ props.floorNumber }} Selesai!</span>
        </div>
      </div>

      <!-- Stamp Graphic -->
      <div class="my-4 flex justify-center items-center">
        <div class="relative">
          <div class="w-28 h-28 rounded-xl border-3 border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018] shadow-md flex flex-col items-center justify-center p-2 animate-stamp-slam rotate-[-2deg]">
            <StampIcon
              :name="props.stampRecord?.stampIcon || 'Sparkle'"
              :size="34"
              className="text-[#f0d060] mb-1"
            />
            <span class="font-pixel text-[8px] text-[#f0d060] uppercase font-bold tracking-wider">
              {{ props.stampRecord?.stampTitle || 'STEMPEL RESMI' }}
            </span>
            <span class="font-mono text-[7px] text-[#e0f0d0] mt-0.5">
              GENIUS UNU YOGYA
            </span>
          </div>
        </div>
      </div>

      <!-- Text Details -->
      <h3 class="font-pixel text-sm sm:text-base font-bold text-white mb-1">
        {{ props.stampRecord?.boothName || 'Spot Selesai!' }}
      </h3>
      <p class="text-xs text-[#d0c0a0] mb-4 leading-relaxed font-sans">
        Kamu berhasil menyelesaikan tantangan dan mendapatkan stempel resmi.
      </p>

      <div class="flex items-center justify-center gap-3 mb-6">
        <PixelBadge variant="emerald" size="sm">
          <template #icon>
            <PhCheckCircle :size="14" weight="bold" />
          </template>
          Skor: {{ props.stampRecord?.score ?? 2 }}/{{ props.stampRecord?.totalQuestions ?? 2 }}
        </PixelBadge>
        <PixelBadge variant="gold" size="sm">
          +250 XP
        </PixelBadge>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <PixelButton
          variant="wood"
          size="md"
          @click="handleClose"
          className="w-full sm:w-auto"
        >
          Lihat Paspor
        </PixelButton>
        <PixelButton
          variant="primary"
          size="md"
          @click="handleNext"
          className="w-full sm:w-auto"
        >
          <template #icon>
            <PhArrowRight :size="16" weight="bold" />
          </template>
          {{ props.nextActionLabel }}
        </PixelButton>
      </div>
    </div>
  </div>
</template>
