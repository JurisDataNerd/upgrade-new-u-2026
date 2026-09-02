<script setup lang="ts">
import CrtScanlines from '@/components/layout/CrtScanlines.vue';
import HeroSection from '@/components/landing/HeroSection.vue';
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] selection:bg-[#7ec850] selection:text-[#1b120a]">
    <CrtScanlines />
    <main class="flex-1 flex flex-col">
      <HeroSection />
    </main>
  </div>
</template>
