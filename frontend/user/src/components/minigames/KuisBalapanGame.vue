<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  PhFlagCheckered,
  PhTimer,
  PhCheckCircle,
  PhXCircle,
  PhCheck,
  PhArrowRight,
  PhCar,
  PhLightning,
} from '@phosphor-icons/vue';
import { KuisBalapanContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';

interface Props {
  content?: KuisBalapanContent;
  isCompleted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
});

const emit = defineEmits<{
  (e: 'complete', score: number, totalQuestions: number): void;
}>();

const gameStore = useGameStore();
const questions = computed(() => props.content?.questions || []);
const rivalIntervalSeconds = computed(() => props.content?.rivalIntervalSeconds || 8);

const currentIndex = ref<number>(0);
const selectedOptionIndex = ref<number | null>(null);
const isRoundSubmitted = ref<boolean>(false);
const totalScore = ref<number>(0);

// Race Progress State
const playerSteps = ref<number>(0);
const rivalSteps = ref<number>(0);
const timerRemainingMs = ref<number>((props.content?.rivalIntervalSeconds || 8) * 1000);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const totalSteps = computed(() => Math.max(1, questions.value.length));

const isSelectedCorrect = computed(() => {
  return currentQuestion.value && selectedOptionIndex.value === currentQuestion.value.correctAnswerIndex;
});

// Calculate Percentage Position on Track (from 6% to 92%)
const playerPct = computed(() => {
  const ratio = Math.min(1, playerSteps.value / totalSteps.value);
  return 6 + ratio * 86;
});

const rivalPct = computed(() => {
  const ratio = Math.min(1, rivalSteps.value / totalSteps.value);
  return 6 + ratio * 86;
});

const rivalTimerPct = computed(() => {
  const totalMs = rivalIntervalSeconds.value * 1000;
  return Math.max(0, Math.min(100, (timerRemainingMs.value / totalMs) * 100));
});

const rivalSecondsLeft = computed(() => {
  return Math.ceil(timerRemainingMs.value / 1000);
});

// Timer Runner
const startRivalTimer = () => {
  stopRivalTimer();
  timerRemainingMs.value = rivalIntervalSeconds.value * 1000;

  timerInterval = setInterval(() => {
    // Pause rival timer while reviewing submitted answer
    if (isRoundSubmitted.value) return;

    timerRemainingMs.value -= 100;
    if (timerRemainingMs.value <= 0) {
      // Rival advances 1 step!
      rivalSteps.value += 1;
      timerRemainingMs.value = rivalIntervalSeconds.value * 1000;
    }
  }, 100);
};

const stopRivalTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

onMounted(() => {
  startRivalTimer();
});

onUnmounted(() => {
  stopRivalTimer();
});

const handleSelectOption = (idx: number) => {
  if (isRoundSubmitted.value) return;
  if (gameStore.soundEnabled) soundEngine.playSelect();
  selectedOptionIndex.value = idx;
};

const handleCheckAnswer = () => {
  if (selectedOptionIndex.value === null || !currentQuestion.value) return;

  const isCorrect = selectedOptionIndex.value === currentQuestion.value.correctAnswerIndex;
  isRoundSubmitted.value = true;

  if (isCorrect) {
    if (gameStore.soundEnabled) soundEngine.playCorrect();
    totalScore.value += 1;
    playerSteps.value += 1;
  } else {
    if (gameStore.soundEnabled) soundEngine.playWrong();
  }
};

const handleNextRound = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1;
    selectedOptionIndex.value = null;
    isRoundSubmitted.value = false;
    timerRemainingMs.value = rivalIntervalSeconds.value * 1000;
    if (gameStore.soundEnabled) soundEngine.playClick();
  } else {
    stopRivalTimer();
    emit('complete', totalScore.value, questions.value.length);
  }
};
</script>

<template>
  <div v-if="currentQuestion" class="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none font-sans">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
      <div class="flex items-center gap-1.5">
        <div class="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
          <PhFlagCheckered :size="14" weight="fill" />
        </div>
        <div>
          <h3 class="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
            KUIS BALAPAN
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <PixelBadge variant="cyan" size="sm">
          Soal {{ currentIndex + 1 }}/{{ questions.length }}
        </PixelBadge>
      </div>
    </div>

    <!-- Race Track Container -->
    <div class="sdv-card-elevated p-2 sm:p-2.5 space-y-1.5 shrink-0">
      <div class="relative w-full h-20 sm:h-24 rounded-lg overflow-hidden border border-[#8b6f4e] bg-[#140d07] shadow-inner">
        <!-- Asphalt track lines -->
        <div class="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_20px,#5a3a18_20px,#5a3a18_32px)]" />

        <!-- Lane Divider -->
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[repeating-linear-gradient(90deg,#f0d060_0px,#f0d060_10px,transparent_10px,transparent_18px)] opacity-60" />

        <!-- Checkered Finish Line (Right) -->
        <div class="absolute right-0 top-0 bottom-0 w-4 bg-[repeating-linear-gradient(45deg,#f0d060_0px,#f0d060_4px,#1b120a_4px,#1b120a_8px)] opacity-80" />
        <PhFlagCheckered :size="16" weight="fill" class="absolute right-5 top-1 text-[#facc15] drop-shadow" />

        <!-- Player Lane (Top Lane) -->
        <div
          class="absolute top-1 -translate-x-1/2 transition-all duration-500 ease-out flex items-center gap-1 z-10"
          :style="{ left: `${playerPct}%` }"
        >
          <div class="px-1 py-0.5 rounded bg-[#1f3a2b] border border-[#7ec850] text-[#7ec850] font-pixel text-[7px] font-bold shadow">
            KAMU
          </div>
          <div class="w-6 h-6 rounded-md bg-[#255018] border border-[#7ec850] flex items-center justify-center text-[#86efac] shadow-[0_0_8px_rgba(126,200,80,0.5)]">
            <PhCar :size="14" weight="fill" />
          </div>
        </div>

        <!-- Rival Lane (Bottom Lane) -->
        <div
          class="absolute bottom-1 -translate-x-1/2 transition-all duration-500 ease-out flex items-center gap-1 z-10"
          :style="{ left: `${rivalPct}%` }"
        >
          <div class="px-1 py-0.5 rounded bg-[#3a1814] border border-[#d44040] text-[#f87171] font-pixel text-[7px] font-bold shadow">
            RIVAL
          </div>
          <div class="w-6 h-6 rounded-md bg-[#501a14] border border-[#d44040] flex items-center justify-center text-[#fca5a5] shadow-[0_0_8px_rgba(212,64,64,0.5)]">
            <PhCar :size="14" weight="fill" />
          </div>
        </div>
      </div>

      <!-- Rival Countdown Bar -->
      <div class="flex items-center gap-1.5 px-0.5">
        <PhTimer :size="12" weight="bold" class="text-[#f0d060] shrink-0" />
        <div class="flex-1 h-2 bg-[#170f07] border border-[#5a3a18] rounded-full overflow-hidden">
          <div
            :class="[
              'h-full rounded-full transition-all duration-100 ease-linear',
              rivalTimerPct > 40
                ? 'bg-[#7ec850]'
                : rivalTimerPct > 20
                  ? 'bg-[#f0d060]'
                  : 'bg-[#d44040] animate-pulse'
            ]"
            :style="{ width: `${rivalTimerPct}%` }"
          />
        </div>
        <span class="font-pixel text-[8px] text-[#c4956a] shrink-0 w-14 text-right">
          {{ rivalSecondsLeft }} dtk
        </span>
      </div>
    </div>

    <!-- Question Card -->
    <div class="sdv-card-elevated p-2 sm:p-2.5 shrink-0">
      <h4 class="font-sans text-[11px] sm:text-xs font-bold text-white leading-relaxed text-justify break-words">
        {{ currentQuestion.text }}
      </h4>
    </div>

    <!-- Multiple Choice Options (2x2 Grid) -->
    <div class="grid grid-cols-2 gap-1.5 flex-1 overflow-y-auto py-0.5 custom-scrollbar">
      <button
        v-for="(option, optIdx) in currentQuestion.options"
        :key="optIdx"
        type="button"
        @click="handleSelectOption(optIdx)"
        :disabled="isRoundSubmitted"
        :class="[
          'p-2 sm:p-2.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer active:scale-98',
          isRoundSubmitted
            ? optIdx === currentQuestion.correctAnswerIndex
              ? 'bg-[#1f3a2b] border-[#7ec850] text-[#e0f0d0] shadow-md font-medium'
              : selectedOptionIndex === optIdx
                ? 'bg-[#3a1814] border-[#d44040] text-[#ffd0d0] shadow-md'
                : 'bg-[#170f07] border-[#5a3a18] text-[#8b6f4e] opacity-60'
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
          v-if="isRoundSubmitted && optIdx === currentQuestion.correctAnswerIndex"
          :size="16"
          weight="fill"
          class="text-[#7ec850] shrink-0"
        />
        <PhXCircle
          v-else-if="isRoundSubmitted && selectedOptionIndex === optIdx && !isSelectedCorrect"
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
          <PhLightning :size="14" weight="fill" class="text-[#7ec850]" />
          <span class="text-[#7ec850]">Tepat Sekali! Mobilmu melaju cepat!</span>
        </template>
        <template v-else>
          <PhXCircle :size="14" weight="fill" class="text-[#ff8080]" />
          <span class="text-[#ff8080]">Belum Tepat! Mobilmu tertahan!</span>
        </template>
      </div>
      <p class="font-sans text-[10px] sm:text-[11px] leading-relaxed text-justify break-words">
        {{ currentQuestion.explanation }}
      </p>
    </div>

    <!-- Footer Actions -->
    <div class="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
      <div class="text-[10px] font-sans text-[#a08060]">
        {{ isRoundSubmitted
          ? `${totalScore}/${questions.length} benar`
          : selectedOptionIndex !== null
            ? '1 pilihan dipilih'
            : `Rival melaju dalam ${rivalSecondsLeft} dtk`
        }}
      </div>

      <div class="shrink-0">
        <button
          v-if="!isRoundSubmitted"
          type="button"
          @click="handleCheckAnswer"
          :disabled="selectedOptionIndex === null"
          class="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <PhCheck :size="14" weight="bold" />
          <span>PACU MOBIL</span>
        </button>
        <button
          v-else
          type="button"
          @click="handleNextRound"
          class="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{{ currentIndex < questions.length - 1 ? 'Lanjut Balapan' : 'Selesai' }}</span>
          <PhArrowRight :size="14" weight="bold" />
        </button>
      </div>
    </div>
  </div>
</template>
