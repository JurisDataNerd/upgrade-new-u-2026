<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import {
  PhSparkle,
  PhGameController,
  PhIdentificationBadge,
  PhInfo,
  PhBuildings,
  PhCheckCircle,
  PhX,
  PhSpeakerHigh,
  PhSpeakerSimpleSlash,
  PhTelevision,
  PhGenderMale,
  PhGenderFemale,
  PhCrown,
  PhTrophy,
  PhCalendarCheck,
  PhQrCode,
  PhStorefront,
} from '@phosphor-icons/vue';
import { useGameStore } from '@/store/gameStore';
import { AVATAR_OPTIONS, UNU_FACULTIES } from '@/data/mockData';
import { soundEngine } from '@/lib/sound';

const gameStore = useGameStore();

const completedFloors = computed(() => gameStore.getCompletedFloorsCount());
const totalStamps = computed(() => gameStore.getTotalStampsCount());
const currentLevel = computed(() => gameStore.getCurrentLevel());
const isCheckedInToday = computed(() => gameStore.isDayCheckedIn(gameStore.activeDay || 1));

import MabaAuthModal from '@/components/auth/MabaAuthModal.vue';

// Auth / Profile Onboarding Modal State
const isAuthModalOpen = ref(
  !gameStore.isLoggedIn || !gameStore.participant.isRegistered || !gameStore.participant.name
);
const authInitialStep = ref<'login' | 'profile'>(
  gameStore.isLoggedIn ? 'profile' : 'login'
);

const openLoginModal = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  authInitialStep.value = 'login';
  isAuthModalOpen.value = true;
};

const openProfileModal = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  authInitialStep.value = 'profile';
  isAuthModalOpen.value = true;
};

const handleAuthComplete = () => {
  isAuthModalOpen.value = false;
};

const handleSelectQuickAvatar = (avatarId: string) => {
  gameStore.setParticipantInfo({ avatar: avatarId });
  if (gameStore.soundEnabled) soundEngine.playSelect();
};
</script>

<template>
  <div class="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden select-none">
    <!-- Background Image: Bright & Clearly Visible UNU Campus 9 Floors Building -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <img
        src="/unu-hero.jpeg"
        alt="Gedung Kampus UNU Yogyakarta 9 Lantai"
        class="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] saturate-[1.05] animate-ken-burns"
      />
      <!-- Soft, translucent warm gradient overlay so building stays clearly visible -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#120b06]/75 via-transparent to-[#160d07]/90 pointer-events-none" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(18,11,6,0.4)_100%)] pointer-events-none" />
    </div>

    <!-- Top Bar: Institutional Logo & Audio Controls -->
    <div class="relative z-20 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 flex items-center justify-between gap-2 shrink-0">
      <!-- Partner / Institution Badge -->
      <div class="backdrop-blur-md bg-[#140e0a]/85 border border-[#f0d060]/50 rounded-full px-3 sm:px-5 py-1 sm:py-1.5 flex items-center gap-2 sm:gap-3 shadow-lg">
        <img
          src="/unu.png"
          alt="Logo UNU Yogyakarta"
          width="90"
          height="32"
          class="h-6 sm:h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        />
        <div class="w-[1px] h-4 sm:h-6 bg-[#f0d060]/40" />
        <div class="flex flex-col text-left leading-none">
          <span class="font-pixel text-[8px] sm:text-[10px] text-[#f0d060] font-bold tracking-wider">
            UNU YOGYAKARTA
          </span>
          <span class="font-sans text-[8px] sm:text-[11px] text-[#a0d870] font-medium pt-0.5">
            Orientasi Mahasiswa Baru
          </span>
        </div>
      </div>

      <!-- Top Right Quick Controls & Student Profile -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Student Identity Pill (Click to edit profile) -->
        <button
          type="button"
          @click="openProfileModal"
          class="backdrop-blur-md bg-[#140e0a]/85 border border-[#8b6f4e] hover:border-[#f0d060] rounded-full px-2 sm:px-3 py-1 flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
          title="Lihat & Ubah Profil Mahasiswa"
        >
          <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#f0d060] overflow-hidden bg-black/40 shrink-0">
            <img
              :src="gameStore.participant.avatar === 'character_cewek' ? '/character-cewek-avatar.png' : '/character-cowok-avatar.png'"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="text-left leading-tight hidden xs:block">
            <span class="font-pixel text-[7.5px] sm:text-[8.5px] text-[#fef08a] block truncate max-w-[100px]">
              {{ gameStore.participant.name || 'Mahasiswa' }}
            </span>
          </div>
        </button>

        <!-- Switch Account / Re-login Button -->
        <button
          type="button"
          @click="openLoginModal"
          class="px-2 py-1.5 bg-[#2d1b0e]/90 border border-[#8b6f4e] hover:border-[#f0d060] text-[#f0d060] rounded-lg text-[8px] sm:text-[8.5px] font-pixel transition-all shadow-md active:scale-95 cursor-pointer"
          title="Ganti Akun Maba / Masuk Kembali"
        >
          GANTI
        </button>

        <button
          type="button"
          @click="gameStore.toggleSound"
          :title="gameStore.soundEnabled ? 'Matikan Suara 8-Bit' : 'Nyalakan Suara 8-Bit'"
          class="p-1.5 sm:p-2 bg-[#2d1b0e]/90 border border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <PhSpeakerHigh v-if="gameStore.soundEnabled" :size="16" weight="bold" />
          <PhSpeakerSimpleSlash v-else :size="16" weight="bold" />
        </button>

        <button
          type="button"
          @click="gameStore.toggleCrt"
          :title="gameStore.crtEffect ? 'Matikan Layar CRT' : 'Nyalakan Layar CRT'"
          class="p-1.5 sm:p-2 bg-[#2d1b0e]/90 border border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <PhTelevision :size="16" weight="bold" />
        </button>

        <RouterLink to="/bantuan" class="inline-block">
          <button
            type="button"
            @click="() => gameStore.soundEnabled && soundEngine.playClick()"
            class="p-1.5 sm:p-2 bg-[#2d1b0e]/90 border border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
            title="Panduan Petualang"
          >
            <PhInfo :size="16" weight="bold" />
          </button>
        </RouterLink>
      </div>
    </div>

    <!-- Main Menu Center Content -->
    <div class="relative z-10 w-full max-w-lg mx-auto px-3 sm:px-6 my-auto flex flex-col items-center justify-center text-center">
      <!-- Top Announcement Badge -->
      <div class="mb-1.5 sm:mb-2 inline-block">
        <div class="backdrop-blur-md bg-[#14230f]/90 border border-[#7ec850] text-[#7ec850] font-pixel text-[8px] sm:text-[10px] px-3 py-1 rounded-full tracking-widest uppercase shadow-md flex items-center gap-1.5">
          <PhSparkle :size="12" weight="fill" class="text-[#f0d060] animate-spin" />
          <span>ORIENTASI MAHASISWA BARU 2026</span>
        </div>
      </div>

      <!-- Grand Title -->
      <div class="space-y-0.5 sm:space-y-1 mb-2.5 sm:mb-4">
        <h1
          class="font-pixel text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#f0d060] tracking-[4px] sm:tracking-[10px] animate-title-pulse drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
          style="text-shadow: 2px 2px 0 #6b4f2e, 4px 4px 0 #1b120a, 0 0 20px rgba(240, 208, 96, 0.4);"
        >
          GENIUS
        </h1>
        <div
          class="font-pixel text-xs sm:text-xl md:text-2xl text-white tracking-[2px] sm:tracking-[4px]"
          style="text-shadow: 1px 1px 0 #2d1b0e, 0 2px 8px rgba(0,0,0,0.9);"
        >
          UPGRADE NEW YOU
        </div>
        <p
          class="font-pixel text-[8px] sm:text-[10px] text-[#a0d870] tracking-[1px] pt-0.5"
          style="text-shadow: 1px 1px 3px rgba(0,0,0,0.9);"
        >
          EKSPLORASI GEDUNG 9 LANTAI • 18 CORNER KARAKTER
        </p>
      </div>

      <!-- Character Quick-Select Bar -->
      <div class="backdrop-blur-md bg-[#19120c]/90 border border-[#8b6f4e] rounded-xl p-2 mb-2.5 sm:mb-3 max-w-sm w-full shadow-md">
        <div class="flex items-center justify-between gap-2 px-1 mb-1.5">
          <div class="min-w-0 text-left">
            <span class="font-pixel text-[8px] text-[#f0d060] uppercase block">
              Karakter Petualang:
            </span>
            <span class="text-[9.5px] text-[#86efac] font-bold truncate block">
              {{ gameStore.participant.name || 'Mahasiswa Baru' }}
            </span>
          </div>
          <button
            type="button"
            @click="openProfileModal"
            class="text-[8.5px] font-pixel text-[#f0d060] hover:text-white bg-[#3d2b1e] border border-[#8b6f4e] hover:border-[#f0d060] px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
          >
            UBAH PROFIL
          </button>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="av in AVATAR_OPTIONS"
            :key="av.id"
            type="button"
            @click="handleSelectQuickAvatar(av.id)"
            :class="[
              'p-1.5 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer',
              gameStore.participant.avatar === av.id
                ? 'bg-gradient-to-r from-[#3d7828] to-[#255018] border-[#f0d060] shadow-[0_0_10px_rgba(126,200,80,0.4)]'
                : 'bg-[#170f07]/80 border-[#5a3a18] hover:border-[#8b6f4e]'
            ]"
          >
            <div class="w-8 h-8 rounded-md overflow-hidden bg-[#170f07] border border-[#f0d060] shrink-0 relative">
              <img
                :src="av.avatarImage"
                :alt="av.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="min-w-0">
              <div class="font-pixel text-[8px] text-white font-bold flex items-center gap-1">
                <span>{{ av.gender === 'pria' ? 'Cowok' : 'Cewek' }}</span>
                <PhGenderMale v-if="av.gender === 'pria'" :size="10" weight="bold" class="text-[#60a8d8]" />
                <PhGenderFemale v-else :size="10" weight="bold" class="text-[#ff8080]" />
              </div>
              <div class="font-sans text-[9px] text-[#c4956a]">
                {{ av.gender === 'pria' ? 'Peci & Jas' : 'Hijab & Jas' }}
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Main Action Buttons Stack -->
      <div class="w-full max-w-sm flex flex-col items-center gap-2">
        <!-- Primary Action Button -->
        <RouterLink to="/play" class="w-full">
          <button
            type="button"
            @click="() => gameStore.soundEnabled && soundEngine.playClick()"
            class="w-full py-2.5 sm:py-3.5 px-4 text-xs sm:text-sm font-pixel font-bold uppercase tracking-wider rpg-btn-primary flex items-center justify-center gap-2 shadow-lg"
          >
            <PhGameController :size="18" weight="bold" />
            <span>{{ totalStamps > 0 ? 'LANJUTKAN PENJELAJAHAN' : 'MULAI PERJALANAN' }}</span>
          </button>
        </RouterLink>

        <!-- Secondary Buttons Grid: Presensi, Ormawa, Paspor & Leaderboard -->
        <div class="grid grid-cols-4 gap-1.5 w-full">
          <!-- Presensi Button -->
          <RouterLink to="/presensi" class="w-full">
            <button
              type="button"
              @click="() => gameStore.soundEnabled && soundEngine.playClick()"
              :class="[
                'w-full py-2 px-1 text-[8px] sm:text-[9px] font-pixel font-bold uppercase tracking-wider rounded-lg border-2 flex flex-col items-center justify-center gap-1 shadow transition-all active:scale-95 cursor-pointer',
                isCheckedInToday
                  ? 'bg-[#183915] border-[#22c55e] text-[#86efac]'
                  : 'bg-[#b45309] border-[#f59e0b] text-white hover:bg-[#d97706]'
              ]"
            >
              <PhCalendarCheck :size="15" weight="fill" :class="isCheckedInToday ? 'text-[#86efac]' : 'text-[#fef08a]'" />
              <span>{{ isCheckedInToday ? 'HADIR' : 'PRESENSI' }}</span>
            </button>
          </RouterLink>

          <!-- Ormawa Expo Button -->
          <RouterLink to="/ormawa" class="w-full">
            <button
              type="button"
              @click="() => gameStore.soundEnabled && soundEngine.playClick()"
              class="w-full py-2 px-1 text-[8px] sm:text-[9px] font-pixel font-bold uppercase tracking-wider bg-[#1f1629] border-2 border-[#a855f7] hover:border-[#c084fc] rounded-lg text-[#e9d5ff] flex flex-col items-center justify-center gap-1 shadow transition-all active:scale-95 cursor-pointer"
            >
              <PhStorefront :size="15" weight="fill" class="text-[#c084fc]" />
              <span>ORMAWA</span>
            </button>
          </RouterLink>

          <!-- Paspor Digital Button -->
          <RouterLink to="/paspor" class="w-full">
            <button
              type="button"
              @click="() => gameStore.soundEnabled && soundEngine.playClick()"
              class="w-full py-2 px-1 text-[8px] sm:text-[9px] font-pixel font-bold uppercase tracking-wider rpg-btn-wood flex flex-col items-center justify-center gap-1 shadow active:scale-95 cursor-pointer"
            >
              <PhIdentificationBadge :size="15" weight="bold" class="text-[#facc15]" />
              <span>PASPOR</span>
            </button>
          </RouterLink>

          <!-- Leaderboard Button -->
          <RouterLink to="/leaderboard" class="w-full">
            <button
              type="button"
              @click="() => gameStore.soundEnabled && soundEngine.playClick()"
              class="w-full py-2 px-1 text-[8px] sm:text-[9px] font-pixel font-bold uppercase tracking-wider bg-[#2d1b0e]/90 border-2 border-[#5a3a18] rounded-lg text-[#f0d060] hover:border-[#f0d060] flex flex-col items-center justify-center gap-1 shadow active:scale-95 cursor-pointer"
            >
              <PhTrophy :size="15" weight="fill" class="text-[#facc15]" />
              <span>PERINGKAT</span>
            </button>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Bottom Footer & Campus Stats Card -->
    <div class="relative z-20 w-full max-w-4xl mx-auto px-3 sm:px-6 pb-2 sm:pb-3 shrink-0">
      <div class="backdrop-blur-md bg-[#19120c]/90 border border-[#8b6f4e] rounded-xl p-2 sm:p-2.5 text-center shadow-lg space-y-1">
        <!-- Badges Row -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 font-sans text-[10px] sm:text-xs">
          <div class="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
            <PhBuildings :size="12" weight="fill" class="text-[#7ec850]" />
            <span><strong>9 Lantai</strong></span>
          </div>

          <div class="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
            <PhSparkle :size="12" weight="fill" class="text-[#f0d060]" />
            <span><strong>18 Corner</strong></span>
          </div>

          <div class="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
            <PhCrown :size="12" weight="fill" class="text-[#f0d060]" />
            <span>Level: <strong class="text-[#f0d060]">{{ currentLevel }}</strong></span>
          </div>

          <div class="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
            <PhCheckCircle :size="12" weight="fill" class="text-[#7ec850]" />
            <span>{{ completedFloors }}/9 Tuntas</span>
          </div>
        </div>

        <div class="font-pixel text-[7px] sm:text-[8px] text-[#8b6f4e] uppercase tracking-wider">
          UNU YOGYAKARTA © 2026 • GENIUS PROTOTYPE
        </div>
      </div>
    </div>

    <!-- Modal Login & Profile Setup Mahasiswa Baru (Onboarding Flow) -->
    <MabaAuthModal
      :isOpen="isAuthModalOpen"
      :initialStep="authInitialStep"
      @close="isAuthModalOpen = false"
      @complete="handleAuthComplete"
    />
  </div>
</template>
