<script setup lang="ts">
import { computed } from 'vue';
import { Booth } from '@/types/game';
import TtsGame from './TtsGame.vue';
import TebakKataGame from './TebakKataGame.vue';
import TebakPosisiGame from './TebakPosisiGame.vue';
import MemoryMatchGame from './MemoryMatchGame.vue';
import KuisCepatGame from './KuisCepatGame.vue';
import BenarSalahGame from './BenarSalahGame.vue';

interface Props {
  booth: Booth;
  isCompleted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
});

const emit = defineEmits<{
  (e: 'complete', score: number, totalQuestions: number): void;
}>();

const gameType = computed(() => props.booth.tipe_game || props.booth.type || 'kuis_cepat');

const handleComplete = (score: number, totalQuestions: number) => {
  emit('complete', score, totalQuestions);
};
</script>

<template>
  <TtsGame
    v-if="gameType === 'tts'"
    :content="props.booth.ttsContent"
    :isCompleted="props.isCompleted"
    @complete="handleComplete"
  />
  <TebakKataGame
    v-else-if="gameType === 'tebak_kata'"
    :content="props.booth.tebakKataContent"
    :isCompleted="props.isCompleted"
    @complete="handleComplete"
  />
  <TebakPosisiGame
    v-else-if="gameType === 'tebak_posisi'"
    :content="props.booth.tebakPosisiContent"
    :isCompleted="props.isCompleted"
    @complete="handleComplete"
  />
  <MemoryMatchGame
    v-else-if="gameType === 'memory_match'"
    :content="props.booth.memoryMatchContent"
    :isCompleted="props.isCompleted"
    @complete="handleComplete"
  />
  <BenarSalahGame
    v-else-if="gameType === 'benar_salah'"
    :content="props.booth.benarSalahContent"
    :isCompleted="props.isCompleted"
    @complete="handleComplete"
  />
  <KuisCepatGame
    v-else
    :content="props.booth.kuisCepatContent"
    :fallbackQuestions="props.booth.questions"
    :isCompleted="props.isCompleted"
    @complete="handleComplete"
  />
</template>
