<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  PhSparkle,
  PhCards,
  PhCheckCircle,
  PhArrowCounterClockwise,
  PhStar,
} from '@phosphor-icons/vue';
import { MemoryMatchContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';

interface Props {
  content?: MemoryMatchContent;
  isCompleted?: boolean;
}

interface CardItem {
  uid: string;
  pairId: string;
  type: 'A' | 'B';
  text: string;
  tag?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
});

const emit = defineEmits<{
  (e: 'complete', score: number, totalQuestions: number): void;
}>();

const gameStore = useGameStore();
const pairs = computed(() => props.content?.pairs || []);

const cards = ref<CardItem[]>([]);
const flippedIndices = ref<number[]>([]);
const matchedPairIds = ref<string[]>([]);
const movesCount = ref<number>(0);
const isProcessing = ref<boolean>(false);
const isFinished = ref<boolean>(props.isCompleted);

const initCards = () => {
  if (pairs.value.length === 0) return;

  const deck: CardItem[] = [];
  pairs.value.forEach((pair) => {
    deck.push({
      uid: `${pair.id}-A`,
      pairId: pair.id,
      type: 'A',
      text: pair.labelA,
      tag: pair.tag,
    });
    deck.push({
      uid: `${pair.id}-B`,
      pairId: pair.id,
      type: 'B',
      text: pair.labelB,
      tag: pair.tag,
    });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  cards.value = deck;
  flippedIndices.value = [];
  matchedPairIds.value = [];
  movesCount.value = 0;
  isProcessing.value = false;
  isFinished.value = false;
};

watch(
  () => props.content,
  () => {
    initCards();
  },
  { immediate: true }
);

const handleCardClick = (index: number) => {
  if (isProcessing.value || isFinished.value) return;
  if (flippedIndices.value.includes(index)) return;
  const clickedCard = cards.value[index];
  if (matchedPairIds.value.includes(clickedCard.pairId)) return;

  if (gameStore.soundEnabled) soundEngine.playSelect();

  const newFlipped = [...flippedIndices.value, index];
  flippedIndices.value = newFlipped;

  if (newFlipped.length === 2) {
    movesCount.value += 1;
    isProcessing.value = true;

    const firstCard = cards.value[newFlipped[0]];
    const secondCard = cards.value[newFlipped[1]];

    if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
      setTimeout(() => {
        if (gameStore.soundEnabled) soundEngine.playCorrect();
        matchedPairIds.value.push(firstCard.pairId);
        flippedIndices.value = [];
        isProcessing.value = false;

        if (matchedPairIds.value.length === pairs.value.length) {
          isFinished.value = true;
          emit('complete', pairs.value.length, pairs.value.length);
        }
      }, 500);
    } else {
      setTimeout(() => {
        if (gameStore.soundEnabled) soundEngine.playWrong();
        flippedIndices.value = [];
        isProcessing.value = false;
      }, 900);
    }
  }
};

const handleResetGame = () => {
  initCards();
  if (gameStore.soundEnabled) soundEngine.playClick();
};
</script>

<template>
  <div class="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
      <div class="flex items-center gap-1.5">
        <div class="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
          <PhCards :size="14" weight="fill" />
        </div>
        <div>
          <h3 class="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
            MEMORY MATCH
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <PixelBadge variant="gold" size="sm">
          {{ matchedPairIds.length }}/{{ pairs.length }} Cocok
        </PixelBadge>
        <PixelBadge variant="wood" size="sm">
          {{ movesCount }} Coba
        </PixelBadge>
      </div>
    </div>

    <!-- 8 Cards Grid -->
    <div class="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1 items-center select-none py-1">
      <button
        v-for="(card, idx) in cards"
        :key="card.uid"
        type="button"
        @click="handleCardClick(idx)"
        :disabled="flippedIndices.includes(idx) || matchedPairIds.includes(card.pairId) || isProcessing"
        :class="[
          'h-20 sm:h-28 rounded-lg sm:rounded-xl border p-1.5 sm:p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden active:scale-95',
          matchedPairIds.includes(card.pairId)
            ? 'bg-gradient-to-b from-[#235736] to-[#14331e] border-[#7ec850] text-[#f0ffd0] shadow-[0_0_8px_rgba(126,200,80,0.3)]'
            : flippedIndices.includes(idx)
            ? 'bg-gradient-to-b from-[#4d3b2e] to-[#2d1b0e] border-[#f0d060] text-white shadow'
            : 'bg-gradient-to-b from-[#281c12] to-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e] text-[#a08060]'
        ]"
      >
        <div v-if="flippedIndices.includes(idx) || matchedPairIds.includes(card.pairId)" class="flex flex-col items-center justify-between h-full w-full py-0.5">
          <span v-if="card.tag" class="font-pixel text-[7px] text-[#f0d060] bg-[#120b06]/80 px-1 py-0.2 rounded border border-[#5a3a18] break-words">
            {{ card.tag }}
          </span>

          <p class="font-sans text-[10px] sm:text-xs font-semibold leading-tight my-auto px-0.5 break-words">
            {{ card.text }}
          </p>

          <div v-if="matchedPairIds.includes(card.pairId)" class="flex items-center gap-0.5 text-[7px] font-pixel text-[#7ec850]">
            <PhCheckCircle :size="10" weight="fill" />
            <span>COCOK</span>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center gap-1">
          <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#120b06] border border-[#8b6f4e] flex items-center justify-center text-[#f0d060] shadow-inner">
            <PhStar :size="14" weight="fill" class="opacity-80" />
          </div>
          <span class="font-pixel text-[7px] sm:text-[8px] text-[#8b6f4e]">
            #{{ idx + 1 }}
          </span>
        </div>
      </button>
    </div>

    <!-- Completion Banner -->
    <div v-if="isFinished" class="bg-[#14230f] border border-[#7ec850] p-2 rounded-lg text-center space-y-0.5 animate-in fade-in shrink-0">
      <div class="flex items-center justify-center gap-1.5 font-pixel text-[10px] sm:text-xs text-[#7ec850] font-bold">
        <PhCheckCircle :size="14" weight="fill" />
        <span>SEMUA KARTU COCOK DITEMUKAN!</span>
      </div>
      <p class="font-sans text-[10px] text-[#e0f0d0]">
        Tuntas dalam {{ movesCount }} percobaan.
      </p>
    </div>

    <!-- Action Footer -->
    <div class="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
      <div class="text-[10px] font-sans text-[#a08060]">
        Cocokkan 4 pasang kartu istilah
      </div>

      <button
        type="button"
        @click="handleResetGame"
        class="rpg-btn-wood py-1.5 px-3 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <PhArrowCounterClockwise :size="12" weight="bold" />
        <span>Kocok Ulang</span>
      </button>
    </div>
  </div>
</template>
