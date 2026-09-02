<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  PhSquaresFour,
  PhUsersThree,
  PhBuildings,
  PhTrophy,
  PhSignOut,
  PhShieldCheck,
} from '@phosphor-icons/vue';
import { useAdminStore } from '../../store/adminStore';

const route = useRoute();
const store = useAdminStore();

const navItems = [
  { name: 'Dashboard', path: '/', icon: PhSquaresFour },
  { name: 'Data Mahasiswa', path: '/participants', icon: PhUsersThree },
  { name: 'Lantai & Booth', path: '/floors', icon: PhBuildings },
  { name: 'Leaderboard', path: '/leaderboard', icon: PhTrophy },
];

const currentPath = computed(() => route.path);
</script>

<template>
  <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 min-h-[100dvh]">
    <!-- Brand Header -->
    <div class="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
      <div class="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
        <PhShieldCheck :size="22" weight="bold" />
      </div>
      <div>
        <div class="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
          GENIUS UNU
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">2026</span>
        </div>
        <div class="text-[11px] text-slate-400">Admin & Panitia Panel</div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-3 py-6 space-y-1">
      <div class="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Menu Utama
      </div>
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          currentPath === item.path
            ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20 font-semibold'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
        ]"
      >
        <component :is="item.icon" :size="20" :weight="currentPath === item.path ? 'fill' : 'regular'" />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- Admin Profile / Logout Footer -->
    <div class="p-4 border-t border-slate-800/80 bg-slate-950/30">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
            AD
          </div>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-white truncate">Super Admin</div>
            <div class="text-[10px] text-slate-400 truncate">Panitia PKKMB</div>
          </div>
        </div>
        <button
          @click="store.logout()"
          title="Keluar"
          class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <PhSignOut :size="18" weight="bold" />
        </button>
      </div>
    </div>
  </aside>
</template>
