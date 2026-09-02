<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import {
  PhSpeakerHigh,
  PhSpeakerSimpleSlash,
  PhTelevision,
  PhIdentificationBadge,
  PhBuildings,
  PhTrophy,
  PhHouse,
  PhGameController,
  PhList,
  PhX,
} from '@phosphor-icons/vue';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import { soundEngine } from '@/lib/sound';

const route = useRoute();
const gameStore = useGameStore();

const mobileMenuOpen = ref(false);

const completedFloors = computed(() => gameStore.getCompletedFloorsCount());
const totalStamps = computed(() => gameStore.getTotalStampsCount());
const currentLevel = computed(() => gameStore.getCurrentLevel());

const navLinks = [
  { href: '/', label: 'Beranda', icon: PhHouse },
  { href: '/play', label: 'Main', icon: PhGameController },
  { href: '/peta', label: 'Peta', icon: PhBuildings },
  { href: '/leaderboard', label: 'Peringkat', icon: PhTrophy },
  { href: '/paspor', label: 'Paspor', icon: PhIdentificationBadge },
];

const handleLinkClick = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  mobileMenuOpen.value = false;
};

const isLinkActive = (href: string) => {
  if (href === '/') return route.path === '/';
  if (href === '/play') return route.path.startsWith('/play') || route.path.startsWith('/booth');
  return route.path.startsWith(href);
};
</script>

<template>
  <header class="sticky top-0 z-40 w-full bg-[#1c120a] border-b-2 border-[#5a3a18] shadow-md shrink-0 h-[48px] sm:h-[52px] flex items-center">
    <div class="w-full max-w-6xl mx-auto px-2.5 sm:px-6 flex items-center justify-between">
      <!-- Brand & Logo -->
      <RouterLink
        to="/"
        @click="handleLinkClick"
        class="flex items-center gap-1.5 sm:gap-2 group shrink-0"
      >
        <div class="p-0.5 sm:p-1 bg-[#2d1b0e] border border-[#8b6f4e] rounded-md group-hover:border-[#f0d060] transition-colors flex items-center justify-center">
          <img
            src="/unu.png"
            alt="UNU"
            width="24"
            height="24"
            class="h-5 sm:h-6 w-auto object-contain"
          />
        </div>
        <div>
          <div class="font-pixel text-[11px] sm:text-xs font-bold text-[#f0d060] tracking-wider leading-none">
            GENIUS
          </div>
          <p class="text-[7px] sm:text-[8px] text-[#a08060] font-pixel leading-tight">
            UNU YOGYA
          </p>
        </div>
      </RouterLink>

      <!-- Desktop Navigation Links -->
      <nav class="hidden md:flex items-center gap-1.5">
        <RouterLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          @click="handleLinkClick"
          :class="[
            'flex items-center gap-1.5 px-2.5 py-1 text-xs font-pixel rounded-lg border transition-all',
            isLinkActive(link.href)
              ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] font-bold shadow'
              : 'bg-[#2d1b0e] text-[#f0e0c0] border-[#5a3a18] hover:border-[#8b6f4e] hover:text-[#f0d060]'
          ]"
        >
          <component :is="link.icon" :size="18" weight="bold" />
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>

      <!-- Right Controls & Mobile Menu Button -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Quick Stats (Desktop) -->
        <div class="hidden lg:flex items-center gap-2 bg-[#2d1b0e] px-2 py-0.5 border border-[#5a3a18] rounded-md text-[11px] font-pixel">
          <span class="text-[#f0d060]">{{ completedFloors }}/9 Lt</span>
          <span class="text-[#5a3a18]">•</span>
          <span class="text-[#7ec850]">{{ totalStamps }}/18 Stempel</span>
        </div>

        <div class="flex">
          <PixelBadge :variant="completedFloors === 9 ? 'gold' : 'emerald'" size="sm">
            {{ currentLevel }}
          </PixelBadge>
        </div>

        <!-- Sound Toggle -->
        <button
          type="button"
          @click="gameStore.toggleSound"
          :title="gameStore.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'"
          :class="[
            'p-1 sm:p-1.5 rounded-md border transition-all cursor-pointer',
            gameStore.soundEnabled
              ? 'bg-[#2d1b0e] text-[#7ec850] border-[#7ec850]'
              : 'bg-[#23160c] text-[#a08060] border-[#5a3a18]'
          ]"
        >
          <PhSpeakerHigh v-if="gameStore.soundEnabled" :size="16" weight="bold" />
          <PhSpeakerSimpleSlash v-else :size="16" weight="bold" />
        </button>

        <!-- CRT Toggle (Desktop) -->
        <button
          type="button"
          @click="gameStore.toggleCrt"
          title="Efek Layar"
          :class="[
            'hidden sm:block p-1 sm:p-1.5 rounded-md border transition-all cursor-pointer',
            gameStore.crtEffect
              ? 'bg-[#2d1b0e] text-[#f0d060] border-[#f0d060]'
              : 'bg-[#23160c] text-[#a08060] border-[#5a3a18]'
          ]"
        >
          <PhTelevision :size="16" weight="bold" />
        </button>

        <!-- Mobile Hamburger Button -->
        <button
          type="button"
          @click="() => {
            if (gameStore.soundEnabled) soundEngine.playClick();
            mobileMenuOpen = !mobileMenuOpen;
          }"
          class="md:hidden p-1 bg-[#2d1b0e] text-[#f0d060] border border-[#8b6f4e] hover:border-[#f0d060] rounded-md transition-all cursor-pointer flex items-center justify-center"
          aria-label="Menu Navigasi"
        >
          <PhX v-if="mobileMenuOpen" :size="18" weight="bold" />
          <PhList v-else :size="18" weight="bold" />
        </button>
      </div>
    </div>

    <!-- Mobile Modal Drawer Menu -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 top-[48px] z-50 bg-[#0d0905]/90 backdrop-blur-md p-4 flex flex-col justify-between animate-in fade-in duration-150 shadow-2xl"
      @click="mobileMenuOpen = false"
    >
      <div
        class="bg-[#1c120a] border-2 border-[#5a3a18] rounded-xl p-4 space-y-3 shadow-xl"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-[#3d2b1e] pb-2">
          <span class="text-[10px] font-pixel text-[#f0d060] uppercase">
            Menu Petualangan
          </span>
          <button
            type="button"
            @click="mobileMenuOpen = false"
            class="text-[#a08060] hover:text-[#f0d060] p-1"
          >
            <PhX :size="16" weight="bold" />
          </button>
        </div>

        <div class="space-y-2 pt-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.href"
            :to="link.href"
            @click="handleLinkClick"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-pixel text-xs border transition-all',
              isLinkActive(link.href)
                ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] font-bold shadow'
                : 'bg-[#23160c] text-[#f0e0c0] border-[#3d2b1e] hover:bg-[#2d1b0e]'
            ]"
          >
            <span class="text-[#f0d060]">
              <component :is="link.icon" :size="18" weight="bold" />
            </span>
            <span>{{ link.label }}</span>
          </RouterLink>
        </div>

        <div class="pt-3 border-t border-[#3d2b1e] flex items-center justify-between text-[11px] font-pixel text-[#a08060]">
          <span>Level: <strong class="text-[#f0d060]">{{ currentLevel }}</strong></span>
          <span class="text-[#7ec850]">{{ completedFloors }}/9 Lt • {{ totalStamps }}/18 Stempel</span>
        </div>
      </div>
    </div>
  </header>
</template>
