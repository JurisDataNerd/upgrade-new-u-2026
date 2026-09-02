<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import {
  PhTimer,
  PhCheckCircle,
  PhXCircle,
  PhArrowRight,
  PhCheck,
  PhLightning,
} from '@phosphor-icons/vue';
import { KuisCepatContent, Question } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';

interface Props {
  content?: KuisCepatContent;
  fallbackQuestions?: Question[];
  isCompleted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
});

const emit = defineEmits<{
  (e: 'complete', score: number, totalQuestions: number): void;
}>();

const gameStore = useGameStore();
const questions = computed(() => props.content?.questions || props.fallbackQuestions || []);
const timeLimit = computed(() => props.content?.timeLimitSeconds || 18);

const currentIndex = ref<number>(0);
const timeLeft = ref<number>(timeLimit.value);
const selectedOptionIndex = ref<number | null>(null);
const isQuestionSubmitted = ref<boolean>(false);
const isTimeUp = ref<boolean>(false);
const totalScore = ref<number>(0);

let timerInterval: any = null;

const currentQuestion = computed(() => questions.value[currentIndex.value]);

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const startTimer = () => {
  clearTimer();
  if (isQuestionSubmitted.value || props.isCompleted || !currentQuestion.value) return;

  timeLeft.value = timeLimit.value;
  isTimeUp.value = false;

  timerInterval = setInterval(() => {
    if (timeLeft.value <= 1) {
      clearTimer();
      timeLeft.value = 0;
      isTimeUp.value = true;
      isQuestionSubmitted.value = true;
      if (gameStore.soundEnabled) soundEngine.playWrong();
    } else {
      timeLeft.value -= 1;
    }
  }, 1000);
};

watch(
  [currentIndex, isQuestionSubmitted, () => props.isCompleted],
  () => {
    if (!isQuestionSubmitted.value && !props.isCompleted) {
      startTimer();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  clearTimer();
});

const handleSelectOption = (index: number) => {
  if (isQuestionSubmitted.value || isTimeUp.value) return;
  if (gameStore.soundEnabled) soundEngine.playSelect();
  selectedOptionIndex.value = index;
};

const handleCheckAnswer = () => {
  if (selectedOptionIndex.value === null || isQuestionSubmitted.value || !currentQuestion.value) return;

  clearTimer();
  isQuestionSubmitted.value = true;

  const isCorrect = selectedOptionIndex.value === currentQuestion.value.correctAnswerIndex;
  if (isCorrect) {
    if (gameStore.soundEnabled) soundEngine.playCorrect();
    totalScore.value += 1;
  } else {
    if (gameStore.soundEnabled) soundEngine.playWrong();
  }
};

const handleNextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1;
    selectedOptionIndex.value = null;
    isQuestionSubmitted.value = false;
    isTimeUp.value = false;
    if (gameStore.soundEnabled) soundEngine.playClick();
  } else {
    emit('complete', totalScore.value, questions.value.length);
  }
};

const isCurrentCorrect = computed(() => {
  return currentQuestion.value && selectedOptionIndex.value === currentQuestion.value.correctAnswerIndex;
});

const timerPercentage = computed(() => {
  return (timeLeft.value / timeLimit.value) * 100;
});

const timerColorClass = computed(() => {
  if (timeLeft.value > timeLimit.value * 0.5) return 'bg-[#7ec850]';
  if (timeLeft.value > timeLimit.value * 0.25) return 'bg-[#f0d060]';
  return 'bg-[#d44040] animate-pulse';
});
</script>

<template>
  <div v-if="currentQuestion" class="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
    <!-- Top Compact Timer & Question Count Header -->
    <div class="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
      <div class="flex items-center gap-1.5">
        <div class="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
          <PhLightning :size="14" weight="fill" />
        </div>
        <div>
          <h3 class="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
            KUIS CEPAT
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Timer Display -->
        <div class="flex items-center gap-1 bg-[#170f07] border border-[#5a3a18] px-2 py-0.5 rounded-md text-[10px] font-pixel">
          <PhTimer :size="12" weight="bold" class="text-[#f0d060]" />
          <span
            :class="[
              'font-mono font-bold',
              timeLeft <= 5 ? 'text-[#ff8080] animate-bounce' : 'text-[#7ec850]'
            ]"
          >
            {{ timeLeft }}s
          </span>
        </div>

        <PixelBadge variant="gold" size="sm">
          {{ currentIndex + 1 }}/{{ questions.length }}
        </PixelBadge>
      </div>
    </div>

    <!-- Countdown Timer Line Bar -->
    <div class="w-full h-1.5 bg-[#120b06] border border-[#5a3a18] rounded-full overflow-hidden shrink-0">
      <div
        :class="['h-full transition-all duration-1000', timerColorClass]"
        :style="{ width: `${timerPercentage}%` }"
      />
    </div>

    <!-- Question Card -->
    <div class="sdv-card-elevated p-2.5 sm:p-3 border border-[#5a3a18] shrink-0">
      <span class="font-pixel text-[8px] text-[#7ec850] uppercase tracking-wider block mb-1">
        SOAL #{{ currentIndex + 1 }}:
      </span>
      <h4 class="font-sans text-xs sm:text-sm font-bold text-white leading-relaxed text-justify break-words">
        {{ currentQuestion.text }}
      </h4>
    </div>

    <!-- Multiple Choice Options -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1 overflow-y-auto py-0.5">
      <button
        v-for="(option, optIdx) in currentQuestion.options"
        :key="optIdx"
        type="button"
        @click="handleSelectOption(optIdx)"
        :disabled="isQuestionSubmitted || isTimeUp"
        :class="[
          'w-full text-left p-2 sm:p-2.5 rounded-lg border transition-all flex items-center gap-2 cursor-pointer',
          (isQuestionSubmitted || isTimeUp)
            ? optIdx === currentQuestion.correctAnswerIndex
              ? 'bg-[#1f3a2b] border-[#7ec850] text-[#e0f0d0] shadow-md font-medium'
              : selectedOptionIndex === optIdx && !isCurrentCorrect
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
        <span class="font-sans text-[11px] sm:text-xs leading-tight flex-1">
          {{ option }}
        </span>
        <PhCheckCircle
          v-if="(isQuestionSubmitted || isTimeUp) && optIdx === currentQuestion.correctAnswerIndex"
          :size="16"
          weight="fill"
          class="text-[#7ec850] shrink-0"
        />
        <PhXCircle
          v-if="isQuestionSubmitted && selectedOptionIndex === optIdx && !isCurrentCorrect"
          :size="16"
          weight="fill"
          class="text-[#ff8080] shrink-0"
        />
      </button>
    </div>

    <!-- Feedback Alert Card -->
    <div
      v-if="isQuestionSubmitted || isTimeUp"
      :class="[
        'p-2 rounded-lg border text-left animate-in fade-in shrink-0',
        isCurrentCorrect
          ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
          : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
      ]"
    >
      <div class="flex items-center gap-1.5 font-pixel text-[10px] font-bold">
        <template v-if="isTimeUp && selectedOptionIndex === null">
          <PhTimer :size="14" weight="fill" class="text-[#ff8080]" />
          <span class="text-[#ff8080]">Waktu Habis!</span>
        </template>
        <template v-else-if="isCurrentCorrect">
          <PhCheckCircle :size="14" weight="fill" class="text-[#7ec850]" />
          <span class="text-[#7ec850]">Jawaban Tepat!</span>
        </template>
        <template v-else>
          <PhXCircle :size="14" weight="fill" class="text-[#ff8080]" />
          <span class="text-[#ff8080]">Kurang Tepat!</span>
        </template>
      </div>
      <p class="font-sans text-[10px] sm:text-[11px] leading-relaxed mt-0.5 text-justify break-words">
        {{ currentQuestion.explanation }}
      </p>
    </div>

    <!-- Footer Actions -->
    <div class="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
      <div class="text-[10px] font-sans text-[#a08060]">
        {{ selectedOptionIndex !== null ? 'Siap dikirim' : 'Pilih 1 jawaban' }}
      </div>

      <div class="shrink-0">
        <button
          v-if="!isQuestionSubmitted && !isTimeUp"
          type="button"
          @click="handleCheckAnswer"
          :disabled="selectedOptionIndex === null"
          class="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
        >
          <PhCheck :size="14" weight="bold" />
          <span>KIRIM JAWABAN</span>
        </button>
        <button
          v-else
          type="button"
          @click="handleNextQuestion"
          class="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
        >
          <span>
            {{ currentIndex < questions.length - 1 ? 'Lanjut Soal' : 'Selesai' }}
          </span>
          <PhArrowRight :size="14" weight="bold" />
        </button>
      </div>
    </div>
  </div>
  <div v-else class="p-6 text-center font-sans text-xs text-[#c4956a]">
    Data soal Kuis Cepat tidak ditemukan.
  </div>
</template>
