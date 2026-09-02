<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  PhSparkle,
  PhCheckCircle,
  PhXCircle,
  PhMapPin,
  PhArrowRight,
  PhCheck,
  PhBuildings,
} from '@phosphor-icons/vue';
import { TebakPosisiContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';

interface Props {
  content?: TebakPosisiContent;
  isCompleted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
});

const emit = defineEmits<{
  (e: 'complete', score: number, totalQuestions: number): void;
}>();

const gameStore = useGameStore();
const items = computed(() => props.content?.items || []);

const currentIndex = ref<number>(0);
const selectedOptionIndex = ref<number | null>(null);
const isRoundSubmitted = ref<boolean>(false);
const totalScore = ref<number>(0);

const currentItem = computed(() => items.value[currentIndex.value]);

const isSelectedCorrect = computed(() => {
  return currentItem.value && selectedOptionIndex.value === currentItem.value.correctOptionIndex;
});

const handleSelectOption = (idx: number) => {
  if (isRoundSubmitted.value) return;
  if (gameStore.soundEnabled) soundEngine.playSelect();
  selectedOptionIndex.value = idx;
};

const handleCheckAnswer = () => {
  if (selectedOptionIndex.value === null || !currentItem.value) return;

  const isCorrect = selectedOptionIndex.value === currentItem.value.correctOptionIndex;
  isRoundSubmitted.value = true;

  if (isCorrect) {
    if (gameStore.soundEnabled) soundEngine.playCorrect();
    totalScore.value += 1;
  } else {
    if (gameStore.soundEnabled) soundEngine.playWrong();
  }
};

const handleNextRound = () => {
  if (currentIndex.value < items.value.length - 1) {
    currentIndex.value += 1;
    selectedOptionIndex.value = null;
    isRoundSubmitted.value = false;
    if (gameStore.soundEnabled) soundEngine.playClick();
  } else {
    const finalScore = isSelectedCorrect.value ? totalScore.value + 1 : totalScore.value;
    emit('complete', finalScore, items.value.length);
  }
};
</script>

<template>
  <div v-if="currentItem" class="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
      <div class="flex items-center gap-1.5">
        <div class="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
          <PhMapPin :size="14" weight="fill" />
        </div>
        <div>
          <h3 class="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
            TEBAK POSISI
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <PixelBadge variant="cyan" size="sm">
          Spot {{ currentIndex + 1 }}/{{ items.length }}
        </PixelBadge>
      </div>
    </div>

    <!-- Visual Photo & Prompt Card -->
    <div class="sdv-card-elevated overflow-hidden p-2 sm:p-2.5 space-y-1.5 shrink-0">
      <div class="relative w-full h-24 sm:h-32 rounded-lg overflow-hidden border border-[#8b6f4e] shadow bg-[#120b06]">
        <img
          :src="currentItem.imageUrl || '/unu-hero.jpeg'"
          :alt="currentItem.imageAlt || 'Spot Kampus UNU'"
          class="w-full h-full object-cover object-center filter brightness-[0.95]"
        />
        <div class="absolute top-1.5 left-1.5 bg-[#120b06]/85 backdrop-blur-md px-1.5 py-0.5 rounded border border-[#f0d060] text-[8px] font-pixel text-[#f0d060] flex items-center gap-1 shadow">
          <PhBuildings :size="10" weight="fill" class="text-[#7ec850]" />
          <span>KAMPUS UNU</span>
        </div>
      </div>

      <!-- Prompt -->
      <h4 class="font-sans text-[11px] sm:text-xs font-bold text-white leading-relaxed text-justify break-words">
        {{ currentItem.prompt }}
      </h4>
    </div>

    <!-- Multiple Choice Options (2x2 grid) -->
    <div class="grid grid-cols-2 gap-1.5 flex-1 overflow-y-auto py-0.5">
      <button
        v-for="(option, optIdx) in currentItem.options"
        :key="optIdx"
        type="button"
        @click="handleSelectOption(optIdx)"
        :disabled="isRoundSubmitted"
        :class="[
          'p-2 sm:p-2.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer',
          isRoundSubmitted
            ? optIdx === currentItem.correctOptionIndex
              ? 'bg-[#1f3a2b] border-[#7ec850] text-[#e0f0d0] shadow-md font-medium'
              : selectedOptionIndex === optIdx && !isSelectedCorrect
              ? 'bg-[#3a1814] border-[#d44040] text-[#ffd0d0] shadow-md'
              : 'bg-[#170f07] border-[#5a3a18] text-[#f0e0c0]'
            : selectedOptionIndex === optIdx
            ? 'bg-[#2d1b0e] border-[#f0d060] text-white shadow-md font-medium'
            : 'bg-[#170f07] border-[#5a3a18] text-[#f0e0c0] hover:border-[#8b6f4e]'
        ]"
      >
        <span class="font-pixel text-[9px] w-5 h-5 flex items-center justify-center rounded bg-[#281c12] text-[#f0d060] border border-[#5a3a18] shrink-0 font-bold">
          {{ String.fromCharCode(65 + optIdx) }}
        </span>
        <span class="font-sans text-[11px] sm:text-xs leading-tight flex-1 break-words">
          {{ option }}
        </span>
        <PhCheckCircle
          v-if="isRoundSubmitted && optIdx === currentItem.correctOptionIndex"
          :size="16"
          weight="fill"
          class="text-[#7ec850] shrink-0"
        />
        <PhXCircle
          v-if="isRoundSubmitted && selectedOptionIndex === optIdx && !isSelectedCorrect"
          :size="16"
          weight="fill"
          class="text-[#ff8080] shrink-0"
        />
      </button>
    </div>

    <!-- Feedback Card -->
    <div
      v-if="isRoundSubmitted"
      :class="[
        'p-2 rounded-lg border space-y-0.5 animate-in fade-in shrink-0',
        isSelectedCorrect
          ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
          : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
      ]"
    >
      <div class="flex items-center gap-1 font-pixel text-[10px] font-bold">
        <template v-if="isSelectedCorrect">
          <PhCheckCircle :size="14" weight="fill" class="text-[#7ec850]" />
          <span class="text-[#7ec850]">Lokasi Tepat Sekali!</span>
        </template>
        <template v-else>
          <PhXCircle :size="14" weight="fill" class="text-[#ff8080]" />
          <span class="text-[#ff8080]">Lokasi Belum Tepat</span>
        </template>
      </div>
      <p class="font-sans text-[10px] sm:text-[11px] leading-relaxed text-justify break-words">
        {{ currentItem.explanation }}
      </p>
    </div>

    <!-- Footer Actions -->
    <div class="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
      <div class="text-[10px] font-sans text-[#a08060]">
        {{ selectedOptionIndex !== null ? '1 lokasi dipilih' : 'Pilih 1 lokasi' }}
      </div>

      <div class="shrink-0">
        <button
          v-if="!isRoundSubmitted"
          type="button"
          @click="handleCheckAnswer"
          :disabled="selectedOptionIndex === null"
          class="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
        >
          <PhCheck :size="14" weight="bold" />
          <span>PILIH LOKASI</span>
        </button>
        <button
          v-else
          type="button"
          @click="handleNextRound"
          class="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
        >
          <span>
            {{ currentIndex < items.length - 1 ? 'Lanjut Spot' : 'Selesai' }}
          </span>
          <PhArrowRight :size="14" weight="bold" />
        </button>
      </div>
    </div>
  </div>
  <div v-else class="p-6 text-center font-sans text-xs text-[#c4956a]">
    Data soal Tebak Posisi tidak ditemukan.
  </div>
</template>
