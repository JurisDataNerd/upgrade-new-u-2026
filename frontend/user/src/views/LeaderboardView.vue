<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import {
  PhTrophy,
  PhUsersThree,
  PhUser,
  PhMagnifyingGlass,
  PhArrowRight,
  PhCaretDown,
  PhCaretUp,
} from '@phosphor-icons/vue';
import Navbar from '@/components/layout/Navbar.vue';
import CrtScanlines from '@/components/layout/CrtScanlines.vue';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import { useGameStore } from '@/store/gameStore';
import {
  INITIAL_LEADERBOARD_USERS,
  INITIAL_LEADERBOARD_GROUPS,
  AVATAR_OPTIONS,
} from '@/data/mockData';
import { soundEngine } from '@/lib/sound';
import { LeaderboardUser, LeaderboardGroup } from '@/types/game';

const gameStore = useGameStore();

const activeTab = ref<'individu' | 'kelompok'>('individu');
const searchQuery = ref<string>('');
const expandedGroupId = ref<string | null>('group-03');

const getAvatarImage = (avatarId: string) => {
  const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return opt ? opt.avatarImage : '/character-cowok-avatar.png';
};

// Compute live individual leaderboard including current user
const individualList = computed<LeaderboardUser[]>(() => {
  const currentUserEntry: LeaderboardUser = {
    id: 'current-user',
    rank: 0,
    name: `${gameStore.participant.name} (Kamu)`,
    nim: gameStore.participant.nim,
    faculty: gameStore.participant.faculty,
    prodi: gameStore.participant.prodi,
    avatar: gameStore.participant.avatar,
    totalXp: gameStore.participant.totalXp,
    stampsCount: gameStore.participant.completedBooths.length,
    completedFloors: Math.floor(gameStore.participant.completedBooths.length / 2),
    isCurrentUser: true,
    groupId: gameStore.participant.groupId || 'group-03',
    groupName: 'Genius 03',
  };

  const others = INITIAL_LEADERBOARD_USERS.filter((u) => u.nim !== gameStore.participant.nim);
  const combined = [...others, currentUserEntry];
  combined.sort((a, b) => b.totalXp - a.totalXp);

  return combined.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
});

// Compute live group leaderboard
const groupList = computed<LeaderboardGroup[]>(() => {
  const groups = INITIAL_LEADERBOARD_GROUPS.map((group) => {
    const updatedMembers = group.members.map((member) => {
      if (member.isCurrentUser || member.nim === gameStore.participant.nim) {
        return {
          ...member,
          name: `${gameStore.participant.name} (Kamu)`,
          nim: gameStore.participant.nim,
          totalXp: gameStore.participant.totalXp,
          stampsCount: gameStore.participant.completedBooths.length,
          avatar: gameStore.participant.avatar,
          isCurrentUser: true,
        };
      }
      return member;
    });

    const totalXp = updatedMembers.reduce((acc, m) => acc + m.totalXp, 0);
    const avgXp = Math.round(totalXp / updatedMembers.length);
    const totalStamps = updatedMembers.reduce((acc, m) => acc + m.stampsCount, 0);
    const totalStampsAvg = Number((totalStamps / updatedMembers.length).toFixed(1));

    return {
      ...group,
      members: updatedMembers,
      totalXp,
      avgXp,
      totalStampsAvg,
    };
  });

  groups.sort((a, b) => b.avgXp - a.avgXp);
  return groups.map((g, index) => ({
    ...g,
    rank: index + 1,
  }));
});

const filteredIndividuals = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return individualList.value.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.nim.toLowerCase().includes(query) ||
      user.prodi.toLowerCase().includes(query) ||
      user.faculty.toLowerCase().includes(query)
  );
});

const currentUserRankInfo = computed(() => {
  return individualList.value.find((u) => u.isCurrentUser);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0] w-full overflow-x-hidden">
    <CrtScanlines />
    <Navbar />

    <main class="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 space-y-4 overflow-x-hidden">
      <!-- Simple Header -->
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="font-pixel text-lg sm:text-2xl font-bold text-[#f0d060] flex items-center gap-2">
            <PhTrophy :size="24" weight="fill" class="text-[#f0d060] shrink-0" />
            <span>Papan Peringkat</span>
          </h1>
          <p class="font-sans text-xs text-[#c4956a] mt-0.5">
            Peringkat perolehan poin orientasi kampus.
          </p>
        </div>

        <RouterLink to="/play" class="shrink-0">
          <button
            type="button"
            @click="() => gameStore.soundEnabled && soundEngine.playClick()"
            class="rpg-btn-primary py-2 px-3 text-xs font-pixel font-bold flex items-center gap-1.5"
          >
            <span>Main</span>
            <PhArrowRight :size="14" weight="bold" />
          </button>
        </RouterLink>
      </div>

      <!-- Current User Highlight Card -->
      <div
        v-if="currentUserRankInfo"
        class="sdv-card-gold p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-12 h-12 rounded-lg overflow-hidden bg-[#170f07] border-2 border-[#f0d060] shrink-0 relative">
            <img
              :src="getAvatarImage(gameStore.participant.avatar)"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-pixel text-[9px] text-[#7ec850] uppercase">
                Posisi Kamu:
              </span>
              <PixelBadge variant="gold" size="sm">
                #{{ currentUserRankInfo.rank }}
              </PixelBadge>
            </div>
            <h3 class="font-pixel text-xs sm:text-sm font-bold text-white leading-snug break-words">
              {{ gameStore.participant.name }}
            </h3>
            <p class="font-sans text-[11px] text-[#c4956a] leading-tight break-words">
              {{ gameStore.participant.nim }} • {{ gameStore.participant.prodi }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 sm:border-l border-[#5a3a18] pt-2 sm:pt-0 sm:pl-4">
          <div class="text-center">
            <div class="font-pixel text-xs text-[#f0d060] font-bold">
              {{ gameStore.participant.totalXp }} XP
            </div>
            <div class="text-[9px] font-sans text-[#a08060]">Poin</div>
          </div>
          <div class="w-[1px] h-6 bg-[#5a3a18]" />
          <div class="text-center">
            <div class="font-pixel text-xs text-[#7ec850] font-bold">
              {{ gameStore.participant.completedBooths.length }}/18
            </div>
            <div class="text-[9px] font-sans text-[#a08060]">Stempel</div>
          </div>
        </div>
      </div>

      <!-- Tab Selector -->
      <div class="grid grid-cols-2 gap-2 w-full">
        <button
          type="button"
          @click="() => {
            activeTab = 'individu';
            if (gameStore.soundEnabled) soundEngine.playSelect();
          }"
          :class="[
            'w-full py-2.5 px-3 rounded-lg font-pixel text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'individu'
              ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] shadow'
              : 'bg-[#170f07] text-[#a08060] border-[#5a3a18] hover:border-[#8b6f4e]'
          ]"
        >
          <PhUser :size="16" weight="bold" />
          <span>Individu</span>
        </button>

        <button
          type="button"
          @click="() => {
            activeTab = 'kelompok';
            if (gameStore.soundEnabled) soundEngine.playSelect();
          }"
          :class="[
            'w-full py-2.5 px-3 rounded-lg font-pixel text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'kelompok'
              ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] shadow'
              : 'bg-[#170f07] text-[#a08060] border-[#5a3a18] hover:border-[#8b6f4e]'
          ]"
        >
          <PhUsersThree :size="16" weight="bold" />
          <span>Kelompok</span>
        </button>
      </div>

      <!-- TAB 1: INDIVIDU -->
      <div v-if="activeTab === 'individu'" class="space-y-3 w-full">
        <!-- Search Bar -->
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari nama, NIM, prodi..."
            class="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-lg px-3 py-2 pl-9 text-xs text-white font-sans outline-none"
          />
          <PhMagnifyingGlass
            :size="16"
            weight="bold"
            class="absolute left-3 top-2.5 text-[#8b6f4e]"
          />
        </div>

        <!-- List Cards -->
        <div class="space-y-2 w-full">
          <div
            v-for="user in filteredIndividuals"
            :key="user.id"
            :class="[
              'p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all w-full',
              user.isCurrentUser
                ? 'bg-[#1f3a2b] border-[#f0d060] shadow'
                : 'bg-[#170f07] border-[#3d2b1e] hover:border-[#5a3a18]'
            ]"
          >
            <!-- Left: Rank & Avatar & Info -->
            <div class="flex items-center gap-2.5 min-w-0">
              <span
                v-if="user.rank === 1"
                class="w-7 h-7 rounded-md bg-[#f0d060] text-[#1b120a] flex items-center justify-center font-pixel text-xs font-black shrink-0"
              >
                1
              </span>
              <span
                v-else-if="user.rank === 2"
                class="w-7 h-7 rounded-md bg-[#d4d4d8] text-[#18181b] flex items-center justify-center font-pixel text-xs font-black shrink-0"
              >
                2
              </span>
              <span
                v-else-if="user.rank === 3"
                class="w-7 h-7 rounded-md bg-[#d97706] text-white flex items-center justify-center font-pixel text-xs font-black shrink-0"
              >
                3
              </span>
              <span
                v-else
                class="w-7 h-7 rounded-md bg-[#170f07] text-[#a08060] border border-[#5a3a18] flex items-center justify-center font-pixel text-xs font-bold shrink-0"
              >
                {{ user.rank }}
              </span>

              <div class="w-9 h-9 rounded-lg overflow-hidden bg-[#281c12] border border-[#8b6f4e] shrink-0 relative">
                <img
                  :src="getAvatarImage(user.avatar)"
                  :alt="user.name"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4
                    :class="[
                      'font-pixel text-[10px] sm:text-xs font-bold leading-normal break-words',
                      user.isCurrentUser ? 'text-white' : 'text-[#f0e0c0]'
                    ]"
                  >
                    {{ user.name }}
                  </h4>
                  <PixelBadge v-if="user.isCurrentUser" variant="gold" size="sm">
                    KAMU
                  </PixelBadge>
                </div>
                <p class="font-sans text-[10px] text-[#a08060] leading-tight break-words">
                  {{ user.prodi }}
                </p>
              </div>
            </div>

            <!-- Right: Points & Stamp count -->
            <div class="text-right shrink-0">
              <div class="font-pixel text-xs text-[#f0d060] font-bold">
                {{ user.totalXp }} XP
              </div>
              <div class="font-sans text-[10px] text-[#7ec850]">
                {{ user.stampsCount }}/18 Stempel
              </div>
            </div>
          </div>

          <div
            v-if="filteredIndividuals.length === 0"
            class="p-6 text-center bg-[#170f07] border border-[#5a3a18] rounded-xl font-sans text-xs text-[#a08060]"
          >
            Tidak ada peserta yang cocok.
          </div>
        </div>
      </div>

      <!-- TAB 2: KELOMPOK -->
      <div v-if="activeTab === 'kelompok'" class="space-y-2.5 w-full">
        <div
          v-for="group in groupList"
          :key="group.id"
          :class="[
            'sdv-card transition-all overflow-hidden w-full',
            group.members.some((m) => m.isCurrentUser) ? 'border-[#f0d060]' : ''
          ]"
        >
          <!-- Accordion Header -->
          <button
            type="button"
            @click="() => {
              expandedGroupId = expandedGroupId === group.id ? null : group.id;
              if (gameStore.soundEnabled) soundEngine.playSelect();
            }"
            class="w-full p-3 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
          >
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <span
                v-if="group.rank === 1"
                class="w-7 h-7 rounded-md bg-[#f0d060] text-[#1b120a] flex items-center justify-center font-pixel text-xs font-black shrink-0"
              >
                1
              </span>
              <span
                v-else-if="group.rank === 2"
                class="w-7 h-7 rounded-md bg-[#d4d4d8] text-[#18181b] flex items-center justify-center font-pixel text-xs font-black shrink-0"
              >
                2
              </span>
              <span
                v-else-if="group.rank === 3"
                class="w-7 h-7 rounded-md bg-[#d97706] text-white flex items-center justify-center font-pixel text-xs font-black shrink-0"
              >
                3
              </span>
              <span
                v-else
                class="w-7 h-7 rounded-md bg-[#170f07] text-[#a08060] border border-[#5a3a18] flex items-center justify-center font-pixel text-xs font-bold shrink-0"
              >
                {{ group.rank }}
              </span>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h3 class="font-pixel text-[10px] sm:text-xs font-bold text-white leading-normal break-words">
                    {{ group.name }}
                  </h3>
                  <PixelBadge v-if="group.members.some((m) => m.isCurrentUser)" variant="gold" size="sm">
                    KAMU
                  </PixelBadge>
                </div>
                <p class="font-sans text-[11px] text-[#a08060]">
                  {{ group.members.length }} Anggota
                </p>
              </div>
            </div>

            <!-- Right Stats & Expand Icon -->
            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <div class="font-pixel text-xs font-bold text-[#f0d060]">
                  {{ group.avgXp }} XP
                </div>
                <div class="font-sans text-[9px] text-[#7ec850]">
                  Rata-rata
                </div>
              </div>

              <div class="p-1 bg-[#170f07] border border-[#5a3a18] rounded text-[#f0d060]">
                <PhCaretUp v-if="expandedGroupId === group.id" :size="14" weight="bold" />
                <PhCaretDown v-else :size="14" weight="bold" />
              </div>
            </div>
          </button>

          <!-- Accordion Content -->
          <div
            v-if="expandedGroupId === group.id"
            class="bg-[#170f07] border-t border-[#5a3a18] p-3 space-y-2 animate-in fade-in"
          >
            <div class="text-[9px] font-pixel text-[#a08060] uppercase border-b border-[#3d2b1e] pb-1">
              Anggota Kelompok:
            </div>

            <div class="space-y-1.5">
              <div
                v-for="member in group.members"
                :key="member.id"
                :class="[
                  'p-2 rounded-lg border flex items-center justify-between gap-2',
                  member.isCurrentUser
                    ? 'bg-[#1f3a2b] border-[#7ec850] text-[#f0ffd0]'
                    : 'bg-[#23160c] border-[#3d2b1e] text-[#e0d0b0]'
                ]"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <div class="w-7 h-7 rounded-md overflow-hidden bg-[#170f07] border border-[#8b6f4e] shrink-0 relative">
                    <img
                      :src="getAvatarImage(member.avatar)"
                      :alt="member.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="font-pixel text-[9px] sm:text-[10px] font-bold leading-normal break-words">
                      {{ member.name }}
                    </div>
                    <div class="font-sans text-[9px] text-[#a08060] leading-tight break-words">
                      {{ member.prodi }}
                    </div>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <div class="font-pixel text-[10px] text-[#f0d060] font-bold">
                    {{ member.totalXp }} XP
                  </div>
                  <div class="font-sans text-[9px] text-[#7ec850]">
                    {{ member.stampsCount }} Stempel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
