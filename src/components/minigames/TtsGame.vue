<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  PhCheck,
  PhArrowCounterClockwise,
  PhSparkle,
  PhLightbulb,
} from '@phosphor-icons/vue';
import { TtsContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';

interface Props {
  content?: TtsContent;
  isCompleted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
});

const emit = defineEmits<{
  (e: 'complete', score: number, totalQuestions: number): void;
}>();

const gameStore = useGameStore();

const clues = computed(() => props.content?.clues || []);
const rows = computed(() => props.content?.gridRows || 6);
const cols = computed(() => props.content?.gridCols || 8);

const activeClueId = ref<string>('');
const gridAnswers = ref<Record<string, string>>({});
const isSubmitted = ref<boolean>(props.isCompleted);
const correctClueIds = ref<string[]>([]);
const showHint = ref<boolean>(false);

watch(
  clues,
  (newClues) => {
    if (newClues.length > 0 && !activeClueId.value) {
      activeClueId.value = newClues[0].id;
    }
  },
  { immediate: true }
);

const activeClue = computed(() => {
  return clues.value.find((c) => c.id === activeClueId.value) || clues.value[0];
});

const validCellsMap = computed(() => {
  const map: Record<string, { clueNumber?: number; clueIds: string[] }> = {};
  clues.value.forEach((clue) => {
    const len = clue.answer.length;
    for (let i = 0; i < len; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      const key = `${r}-${c}`;
      if (!map[key]) {
        map[key] = { clueIds: [] };
      }
      if (i === 0 && !map[key].clueNumber) {
        map[key].clueNumber = clue.number;
      }
      map[key].clueIds.push(clue.id);
    }
  });
  return map;
});

const handleCellChange = (r: number, c: number, value: string) => {
  if (isSubmitted.value) return;
  const char = value.slice(-1).toUpperCase();
  if (char && !/^[A-Z]$/.test(char)) return;

  if (gameStore.soundEnabled && char) soundEngine.playClick();

  const key = `${r}-${c}`;
  gridAnswers.value[key] = char;
};

const checkSolution = () => {
  let correctCount = 0;
  const newCorrectClueIds: string[] = [];

  clues.value.forEach((clue) => {
    let isClueCorrect = true;
    const len = clue.answer.length;
    for (let i = 0; i < len; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      const key = `${r}-${c}`;
      const inputChar = gridAnswers.value[key] || '';
      if (inputChar.toUpperCase() !== clue.answer[i].toUpperCase()) {
        isClueCorrect = false;
        break;
      }
    }

    if (isClueCorrect) {
      correctCount += 1;
      newCorrectClueIds.push(clue.id);
    }
  });

  correctClueIds.value = newCorrectClueIds;
  isSubmitted.value = true;

  if (correctCount === clues.value.length) {
    if (gameStore.soundEnabled) soundEngine.playCorrect();
    emit('complete', correctCount, clues.value.length);
  } else {
    if (gameStore.soundEnabled) soundEngine.playWrong();
  }
};

const handleReset = () => {
  gridAnswers.value = {};
  isSubmitted.value = false;
  correctClueIds.value = [];
  if (gameStore.soundEnabled) soundEngine.playClick();
};

const handleFillSampleHint = () => {
  if (!activeClue.value) return;
  const key = `${activeClue.value.row}-${activeClue.value.col}`;
  gridAnswers.value[key] = activeClue.value.answer[0];
  showHint.value = true;
  if (gameStore.soundEnabled) soundEngine.playSelect();
};
</script>

<template>
  <div class="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
      <div class="flex items-center gap-1.5">
        <div class="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
          <PhSparkle :size="14" weight="fill" />
        </div>
        <div>
          <h3 class="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
            TEKA-TEKI SILANG
          </h3>
        </div>
      </div>

      <PixelBadge variant="emerald" size="sm">
        {{ clues.length }} Kata Kunci
      </PixelBadge>
    </div>

    <!-- Main Interactive Grid -->
    <div class="flex-1 flex flex-col items-center justify-center overflow-hidden py-0.5">
      <div class="bg-[#170f07] p-1.5 sm:p-2.5 border border-[#5a3a18] rounded-xl shadow-inner inline-block overflow-x-auto max-w-full">
        <div
          class="grid gap-1 select-none"
          :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
        >
          <template v-for="r in Array.from({ length: rows }).map((_, i) => i)" :key="`row-${r}`">
            <template v-for="c in Array.from({ length: cols }).map((_, i) => i)" :key="`cell-${r}-${c}`">
              <div
                v-if="!validCellsMap[`${r}-${c}`]"
                class="w-7 h-7 sm:w-8 sm:h-8 bg-[#120b06] border border-[#2d1b0e]/60 rounded opacity-30"
              />
              <div
                v-else
                @click="() => {
                  if (validCellsMap[`${r}-${c}`].clueIds.length > 0) {
                    activeClueId = validCellsMap[`${r}-${c}`].clueIds[0];
                    if (gameStore.soundEnabled) soundEngine.playSelect();
                  }
                }"
                :class="[
                  'relative w-7 h-7 sm:w-8 sm:h-8 rounded border transition-all flex items-center justify-center cursor-pointer',
                  activeClueId && validCellsMap[`${r}-${c}`].clueIds.includes(activeClueId)
                    ? 'bg-[#3d2b1e] border-[#f0d060] shadow-[0_0_6px_rgba(240,208,96,0.5)]'
                    : 'bg-[#281c12] border-[#5a3a18] hover:border-[#8b6f4e]'
                ]"
              >
                <span
                  v-if="validCellsMap[`${r}-${c}`].clueNumber"
                  class="absolute top-0.5 left-0.5 text-[7px] font-pixel text-[#f0d060] leading-none pointer-events-none"
                >
                  {{ validCellsMap[`${r}-${c}`].clueNumber }}
                </span>

                <input
                  type="text"
                  maxlength="1"
                  :value="gridAnswers[`${r}-${c}`] || ''"
                  :disabled="isSubmitted"
                  @input="(e) => handleCellChange(r, c, (e.target as HTMLInputElement).value)"
                  @focus="() => {
                    if (validCellsMap[`${r}-${c}`].clueIds.length > 0) {
                      activeClueId = validCellsMap[`${r}-${c}`].clueIds[0];
                    }
                  }"
                  class="w-full h-full text-center bg-transparent font-pixel text-xs sm:text-sm font-bold text-white uppercase outline-none"
                />
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- Active Clue Focus & Clue Navigation -->
    <div class="space-y-1 shrink-0">
      <div v-if="activeClue" class="sdv-card-elevated p-2 border border-[#f0d060] space-y-0.5">
        <div class="flex items-center justify-between text-[8px] font-pixel">
          <span class="text-[#7ec850] uppercase">
            #{{ activeClue.number }} ({{ activeClue.direction === 'across' ? 'Mendatar →' : 'Menurun ↓' }})
          </span>
          <span class="text-[#f0d060]">
            {{ activeClue.answer.length }} Huruf
          </span>
        </div>
        <p class="font-sans text-[11px] sm:text-xs text-white font-medium leading-relaxed text-justify break-words">
          {{ activeClue.clue }}
        </p>
      </div>

      <!-- Clue Quick Switches -->
      <div class="flex items-center gap-1 overflow-x-auto py-0.5">
        <button
          v-for="clue in clues"
          :key="clue.id"
          type="button"
          @click="() => {
            activeClueId = clue.id;
            if (gameStore.soundEnabled) soundEngine.playSelect();
          }"
          :class="[
            'py-0.5 px-2 rounded font-pixel text-[8px] border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0',
            clue.id === activeClueId
              ? 'bg-[#f0d060] text-[#1c120a] border-[#f0d060] font-bold'
              : 'bg-[#170f07] text-[#c4956a] border-[#5a3a18]'
          ]"
        >
          <span>{{ clue.number }} {{ clue.direction === 'across' ? '→' : '↓' }}</span>
          <PhCheck v-if="isSubmitted && correctClueIds.includes(clue.id)" :size="10" weight="bold" class="text-[#7ec850]" />
        </button>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-1.5 shrink-0">
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="handleFillSampleHint"
          :disabled="isSubmitted"
          class="py-1 px-2 text-[9px] font-pixel text-[#f0d060] bg-[#2d1b0e] border border-[#8b6f4e] rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <PhLightbulb :size="12" weight="bold" />
          <span>Bantuan</span>
        </button>

        <button
          type="button"
          @click="handleReset"
          class="py-1 px-2 text-[9px] font-pixel text-[#c4956a] bg-[#170f07] border border-[#5a3a18] rounded transition-colors flex items-center gap-1 cursor-pointer"
        >
          <PhArrowCounterClockwise :size="12" weight="bold" />
          <span>Reset</span>
        </button>
      </div>

      <button
        type="button"
        @click="checkSolution"
        class="rpg-btn-primary py-1.5 px-3 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
      >
        <PhCheck :size="14" weight="bold" />
        <span>PERIKSA TTS</span>
      </button>
    </div>
  </div>
</template>
