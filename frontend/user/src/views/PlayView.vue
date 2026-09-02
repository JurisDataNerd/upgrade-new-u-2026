<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/store/gameStore';
import { FLOORS_DATA } from '@/data/mockData';

const router = useRouter();
const gameStore = useGameStore();

onMounted(() => {
  let targetFloor = 1;
  for (const floor of FLOORS_DATA) {
    if (gameStore.getFloorStatus(floor.number) !== 'completed') {
      targetFloor = floor.number;
      break;
    }
  }

  router.replace(`/play/floor/${targetFloor}/intro`);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#2d1b0e] text-[#f0e0c0]">
    <div class="text-center space-y-3 font-pixel text-xs text-[#f0d060] animate-pulse">
      <span>MEMUAT ALUR PERMAINAN GENIUS...</span>
    </div>
  </div>
</template>
