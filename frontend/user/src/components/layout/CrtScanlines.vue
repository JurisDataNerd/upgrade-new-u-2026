<script setup lang="ts">
import { useGameStore } from '@/store/gameStore';

const gameStore = useGameStore();
</script>

<template>
  <div
    v-if="gameStore.crtEffect"
    aria-hidden="true"
    class="fixed inset-0 pointer-events-none z-50 crt-overlay opacity-60 mix-blend-overlay"
  />
</template>
