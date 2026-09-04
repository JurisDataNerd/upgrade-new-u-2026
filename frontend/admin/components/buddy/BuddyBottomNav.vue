<template>
  <nav class="fixed bottom-0 inset-x-0 z-40 bg-[#2d1b0e]/98 border-t-3 border-[#5a3a18] backdrop-blur px-2 py-1.5 flex items-center justify-around shadow-[0_-8px_25px_rgba(0,0,0,0.7)] select-none">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :class="[
        'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[64px]',
        isActive(item.to)
          ? 'text-[#f0d060] font-bold scale-105 bg-[#1a1008] border-2 border-[#f0d060] shadow-[0_0_12px_rgba(240,208,96,0.25)]'
          : 'text-[#c4956a] hover:text-[#f0e0c0]'
      ]"
    >
      <component
        :is="item.icon"
        :class="[
          'h-4 w-4 transition-colors',
          isActive(item.to) ? 'text-[#f0d060]' : 'text-[#c4956a]'
        ]"
      />
      <span class="font-pixel text-[7.5px] sm:text-[8.5px] mt-0.5 uppercase tracking-wider">
        {{ item.label }}
      </span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { Users, FileEdit, Gift, Trophy } from "lucide-vue-next";

const route = useRoute();

const navItems = [
  { label: "Anggota", to: "/buddy", icon: Users },
  { label: "Nilai FGD", to: "/buddy/fgd", icon: FileEdit },
  { label: "Bonus H3", to: "/buddy/bonus", icon: Gift },
  { label: "Leaderboard", to: "/buddy/leaderboard", icon: Trophy },
];

const isActive = (to: string) => {
  if (to === "/buddy") return route.path === "/buddy";
  return route.path.startsWith(to);
};
</script>
