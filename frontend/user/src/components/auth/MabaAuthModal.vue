<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  PhX,
  PhCheck,
  PhUser,
  PhLockKey,
  PhIdentificationCard,
  PhArrowLeft,
  PhSignIn,
  PhGenderMale,
  PhGenderFemale,
  PhCheckCircle,
} from '@phosphor-icons/vue';
import { useGameStore } from '@/store/gameStore';
import { AVATAR_OPTIONS, UNU_FACULTIES } from '@/data/mockData';
import { soundEngine } from '@/lib/sound';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    initialStep?: 'login' | 'profile';
  }>(),
  {
    initialStep: 'login',
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'complete'): void;
}>();

const gameStore = useGameStore();

// Flow step: 'login' -> 'profile' -> finish (Landing Page)
const currentStep = ref<'login' | 'profile'>(props.initialStep);

// Login Form State
const loginNim = ref(gameStore.participant.nim || '');
const loginPassword = ref('');
const loginError = ref('');

// Profile Form State
const profileName = ref(gameStore.participant.name || '');
const profileNim = ref(gameStore.participant.nim || '');
const profileFaculty = ref(gameStore.participant.faculty || UNU_FACULTIES[1].name);
const profileProdi = ref(gameStore.participant.prodi || 'Informatika');
const profileAvatar = ref(gameStore.participant.avatar || 'character_cowok');

// If user is already registered, they can close the modal
const canDismiss = computed(() => {
  return Boolean(
    gameStore.isLoggedIn &&
    gameStore.participant?.isRegistered &&
    gameStore.participant?.name
  );
});

const handleFacultyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  profileFaculty.value = target.value;
  const facObj = UNU_FACULTIES.find((f) => f.name === target.value);
  if (facObj && facObj.prodi.length > 0) {
    profileProdi.value = facObj.prodi[0];
  }
};

const handleLoginSubmit = (e: Event) => {
  e.preventDefault();
  if (!loginNim.value.trim()) {
    loginError.value = 'Mohon masukkan NIM Mahasiswa Baru';
    return;
  }
  loginError.value = '';
  if (gameStore.soundEnabled) soundEngine.playClick();

  // Sinkronkan NIM ke profile form
  profileNim.value = loginNim.value.trim();

  // Lanjut ke Langkah 2: Mengisi Profil
  currentStep.value = 'profile';
};

const handleProfileSubmit = (e: Event) => {
  e.preventDefault();
  if (!profileName.value.trim()) return;

  gameStore.completeProfile({
    name: profileName.value.trim(),
    nim: profileNim.value.trim() || '2611101',
    faculty: profileFaculty.value,
    prodi: profileProdi.value,
    avatar: profileAvatar.value,
  });

  if (gameStore.soundEnabled) soundEngine.playCorrect();

  emit('complete');
  emit('close');
};

const selectAvatar = (avId: string) => {
  profileAvatar.value = avId;
  if (gameStore.soundEnabled) soundEngine.playSelect();
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans"
  >
    <div
      class="w-full max-w-lg max-h-[94dvh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#2d1b0e] to-[#1a1008] border-[3.5px] border-[#f0d060] rounded-2xl p-4 sm:p-6 shadow-[inset_0_0_0_2px_#6b4f2e,0_16px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(240,208,96,0.3)] relative text-[#f0e0c0]"
    >
      <!-- Close button only if already registered -->
      <button
        v-if="canDismiss"
        type="button"
        @click="emit('close')"
        class="absolute top-3.5 right-3.5 text-[#f0d060] hover:text-white bg-[#3d2b1e] border border-[#8b6f4e] hover:border-[#f0d060] rounded-lg w-7 h-7 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer font-pixel text-xs"
        title="Tutup"
      >
        <PhX :size="14" weight="bold" />
      </button>

      <!-- Top Steps Indicator Pill -->
      <div class="flex items-center justify-center gap-2 mb-3">
        <div
          :class="[
            'px-2.5 py-0.5 rounded-full font-pixel text-[8px] uppercase tracking-wider flex items-center gap-1 border',
            currentStep === 'login'
              ? 'bg-[#f0d060] text-[#1b120a] border-[#f0d060] font-bold shadow'
              : 'bg-[#1e130a] text-[#86efac] border-[#22c55e]'
          ]"
        >
          <span>1. MASUK MABA</span>
          <PhCheckCircle v-if="currentStep === 'profile'" :size="11" weight="fill" class="text-[#22c55e]" />
        </div>
        <div class="w-4 h-[2px] bg-[#5a3a18]" />
        <div
          :class="[
            'px-2.5 py-0.5 rounded-full font-pixel text-[8px] uppercase tracking-wider flex items-center gap-1 border',
            currentStep === 'profile'
              ? 'bg-[#f0d060] text-[#1b120a] border-[#f0d060] font-bold shadow'
              : 'bg-[#1e130a] text-[#a08060] border-[#5a3a18]'
          ]"
        >
          <span>2. ISI PROFIL &amp; KARAKTER</span>
        </div>
      </div>

      <!-- ======================================================= -->
      <!-- STEP 1: MODAL LOGIN MAHASISWA BARU                     -->
      <!-- ======================================================= -->
      <div v-if="currentStep === 'login'" class="space-y-4">
        <!-- Header -->
        <div class="text-center space-y-1">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1e130a] border-2 border-[#f0d060] shadow-md p-1 mx-auto mb-1">
            <img src="/unu.png" alt="UNU Logo" class="h-full w-auto object-contain" />
          </div>
          <h2 class="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold tracking-wide uppercase">
            PORTAL LOGIN MAHASISWA BARU
          </h2>
          <p class="text-[10px] text-[#c4956a]">
            Selamat datang di PKKMB UNU Yogyakarta 2026. Masuk untuk memulai petualangan.
          </p>
        </div>

        <!-- Manual Login Form -->
        <form @submit="handleLoginSubmit" class="space-y-3 font-mono">
          <div v-if="loginError" class="p-2 rounded bg-red-950/80 border border-red-600 text-red-300 text-xs text-center">
            {{ loginError }}
          </div>

          <div class="space-y-1">
            <label class="block font-pixel text-[8px] text-[#c4956a] uppercase">
              NIM / NOMOR PENDAFTARAN
            </label>
            <div class="relative">
              <PhIdentificationCard :size="16" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0d060]" />
              <input
                type="text"
                v-model="loginNim"
                required
                placeholder="Contoh: 2611101"
                class="w-full pl-8 pr-3 py-2 bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg text-xs text-white outline-none"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block font-pixel text-[8px] text-[#c4956a] uppercase">
              KATA SANDI (PIN / DEFAULT)
            </label>
            <div class="relative">
              <PhLockKey :size="16" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0d060]" />
              <input
                type="password"
                v-model="loginPassword"
                required
                placeholder="••••••••"
                class="w-full pl-8 pr-3 py-2 bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg text-xs text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            class="rpg-btn-primary w-full py-3 px-4 font-pixel text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
          >
            <PhSignIn :size="16" weight="bold" />
            <span>MASUK &amp; LANJUT KE PROFIL ▶</span>
          </button>
        </form>
      </div>

      <!-- ======================================================= -->
      <!-- STEP 2: MODAL PENGISIAN PROFIL MAHASISWA BARU           -->
      <!-- ======================================================= -->
      <div v-else-if="currentStep === 'profile'" class="space-y-3.5">
        <!-- Header -->
        <div class="text-center space-y-1">
          <div class="inline-block bg-[#14230f] border border-[#7ec850] text-[#7ec850] font-pixel text-[8px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            LANGKAH 2 DARI 2
          </div>
          <h2 class="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold tracking-wide uppercase">
            PENGISIAN PROFIL PETUALANG
          </h2>
          <p class="text-[10px] text-[#c4956a]">
            Pilih karakter dan pastikan data diri Anda sesuai sebelum ke Landing Page.
          </p>
        </div>

        <form @submit="handleProfileSubmit" class="space-y-3 font-sans">
          <!-- 1. Character Selection (Official Portrait Cards) -->
          <div>
            <label class="block font-pixel text-[8.5px] text-[#f0d060] mb-1.5 uppercase flex items-center gap-1">
              <span>PILIH KARAKTER RPG (COWOK / CEWEK):</span>
            </label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="av in AVATAR_OPTIONS"
                :key="av.id"
                type="button"
                @click="selectAvatar(av.id)"
                :class="[
                  'p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all flex flex-col items-center gap-2 cursor-pointer relative shadow',
                  profileAvatar === av.id
                    ? 'bg-gradient-to-b from-[#3d7828] to-[#255018] border-[#f0d060] shadow-[0_0_15px_rgba(126,200,80,0.5)] scale-[1.01]'
                    : 'bg-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e]'
                ]"
              >
                <!-- Selected Badge -->
                <div
                  v-if="profileAvatar === av.id"
                  class="absolute top-1.5 right-1.5 bg-[#f0d060] text-[#1b120a] rounded-full p-0.5 shadow"
                >
                  <PhCheck :size="10" weight="bold" />
                </div>

                <!-- Portrait Container -->
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#120a05] border-2 border-[#f0d060] shrink-0 relative shadow-inner">
                  <img
                    :src="av.avatarImage"
                    :alt="av.name"
                    class="w-full h-full object-cover object-top"
                  />
                </div>

                <!-- Identity Label -->
                <div class="text-center w-full min-w-0">
                  <div class="font-pixel text-[9px] text-white font-bold flex items-center justify-center gap-1">
                    <span>{{ av.gender === 'pria' ? 'Cowok' : 'Cewek' }}</span>
                    <PhGenderMale v-if="av.gender === 'pria'" :size="12" weight="bold" class="text-[#60a8d8]" />
                    <PhGenderFemale v-else :size="12" weight="bold" class="text-[#ff8080]" />
                  </div>
                  <span class="text-[9px] text-[#fef08a] block truncate font-mono mt-0.5">
                    {{ av.gender === 'pria' ? 'Peci & Jas UNU' : 'Hijab & Jas UNU' }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. Form Inputs: Nama, NIM, Fakultas, Prodi -->
          <div class="space-y-2 bg-[#20140c] p-3 rounded-xl border border-[#5a3a18]">
            <!-- Nama -->
            <div>
              <label class="block font-pixel text-[8px] text-[#c4956a] mb-1 uppercase">
                Nama Lengkap Mahasiswa:
              </label>
              <div class="relative">
                <PhUser :size="15" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0d060]" />
                <input
                  type="text"
                  v-model="profileName"
                  required
                  placeholder="Ahmad Dahlan"
                  class="w-full pl-8 pr-3 py-1.5 bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-lg text-xs text-white font-sans outline-none"
                />
              </div>
            </div>

            <!-- NIM -->
            <div>
              <label class="block font-pixel text-[8px] text-[#c4956a] mb-1 uppercase">
                NIM (Nomor Induk Mahasiswa):
              </label>
              <div class="relative">
                <PhIdentificationCard :size="15" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0d060]" />
                <input
                  type="text"
                  v-model="profileNim"
                  required
                  placeholder="2611101"
                  class="w-full pl-8 pr-3 py-1.5 bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-lg text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <!-- Fakultas & Prodi -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block font-pixel text-[8px] text-[#c4956a] mb-1 uppercase">
                  Fakultas:
                </label>
                <select
                  :value="profileFaculty"
                  @change="handleFacultyChange"
                  class="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none cursor-pointer"
                >
                  <option v-for="fac in UNU_FACULTIES" :key="fac.name" :value="fac.name">
                    {{ fac.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-pixel text-[8px] text-[#c4956a] mb-1 uppercase">
                  Program Studi:
                </label>
                <select
                  v-model="profileProdi"
                  class="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none cursor-pointer"
                >
                  <option
                    v-for="p in (UNU_FACULTIES.find((f) => f.name === profileFaculty)?.prodi || [])"
                    :key="p"
                    :value="p"
                  >
                    {{ p }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-2 pt-1 font-pixel">
            <button
              type="button"
              @click="currentStep = 'login'"
              class="py-2.5 px-3 rounded-lg border-2 border-[#5a3a18] bg-[#1e130a] hover:bg-[#2d1b0e] text-[#c4956a] hover:text-[#f0d060] text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <PhArrowLeft :size="12" weight="bold" />
              <span>LOGIN</span>
            </button>

            <button
              type="submit"
              class="rpg-btn-primary flex-1 py-3 px-3 text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <span>SIMPAN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
