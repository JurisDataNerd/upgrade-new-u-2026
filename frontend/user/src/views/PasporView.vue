<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import {
  PhIdentificationBadge,
  PhTrophy,
  PhSparkle,
  PhCheckCircle,
  PhLockKey,
  PhArrowRight,
  PhPrinter,
  PhArrowCounterClockwise,
} from '@phosphor-icons/vue';
import { FLOORS_DATA, BOOTHS_DATA, LEVEL_CONFIG, AVATAR_OPTIONS } from '@/data/mockData';
import { useGameStore } from '@/store/gameStore';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import PixelProgress from '@/components/ui/PixelProgress.vue';
import StampIcon from '@/components/ui/StampIcon.vue';
import Navbar from '@/components/layout/Navbar.vue';
import CrtScanlines from '@/components/layout/CrtScanlines.vue';
import { soundEngine } from '@/lib/sound';

const gameStore = useGameStore();

const showCertificate = ref(false);
const selectedStampPreview = ref<string | null>(null);

const completedFloors = computed(() => gameStore.getCompletedFloorsCount());
const currentLevel = computed(() => gameStore.getCurrentLevel());
const currentLevelData = computed(
  () => LEVEL_CONFIG.find((l) => l.level === currentLevel.value) || LEVEL_CONFIG[0]
);
const totalStampsCollected = computed(() => gameStore.participant.completedBooths.length);
const isAllCompleted = computed(() => completedFloors.value === 9 && totalStampsCollected.value === 18);

const selectedAvatarObj = computed(
  () => AVATAR_OPTIONS.find((a) => a.id === gameStore.participant.avatar) || AVATAR_OPTIONS[0]
);

const handlePrint = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  if (typeof window !== 'undefined') {
    window.print();
  }
};

const handleResetConfirm = () => {
  if (window.confirm('Apakah kamu yakin ingin mereset semua progres stempel?')) {
    gameStore.resetProgress();
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
    <CrtScanlines />
    <Navbar />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
      <!-- Header Title & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-pixel text-xl sm:text-2xl font-bold text-[#f0d060] flex items-center gap-2.5">
            <PhIdentificationBadge :size="28" weight="fill" class="text-[#f0d060]" />
            <span>Paspor Mahasiswa</span>
          </h1>
          <p class="font-sans text-xs sm:text-sm text-[#c4956a] mt-0.5">
            Catatan perolehan stempel dan progres orientasi kampus.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handlePrint"
            class="rpg-btn-wood py-2 px-3 text-xs font-pixel font-bold flex items-center gap-2 cursor-pointer"
          >
            <PhPrinter :size="16" weight="bold" />
            <span>Cetak</span>
          </button>
          <button
            type="button"
            @click="handleResetConfirm"
            class="rpg-btn-danger py-2 px-3 text-xs font-pixel font-bold flex items-center gap-2 cursor-pointer"
            title="Reset Progres"
          >
            <PhArrowCounterClockwise :size="16" weight="bold" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Player ID Card & Level HUD -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <!-- Identity Card -->
        <div class="lg:col-span-5">
          <div class="h-full sdv-card-gold p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b-2 border-[#5a3a18] pb-3 mb-4">
                <div class="flex items-center gap-2 font-pixel text-xs text-[#f0d060]">
                  <PhSparkle :size="16" weight="fill" />
                  <span>Kartu Mahasiswa</span>
                </div>
                <img
                  src="/unu.png"
                  alt="UNU Logo"
                  width="36"
                  height="36"
                  class="h-6 w-auto object-contain"
                />
              </div>

              <!-- Avatar & Basic Info -->
              <div class="flex items-start gap-4 mb-4">
                <div class="w-16 h-16 bg-[#170f07] border-2 border-[#f0d060] rounded-xl overflow-hidden shadow-inner shrink-0 relative">
                  <img
                    :src="selectedAvatarObj.avatarImage"
                    :alt="selectedAvatarObj.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="min-w-0 space-y-1 flex-1">
                  <h2 class="font-pixel text-sm sm:text-base font-bold text-white leading-snug break-words">
                    {{ gameStore.participant.name }}
                  </h2>
                  <p class="font-mono text-xs text-[#7ec850]">
                    NIM: {{ gameStore.participant.nim }}
                  </p>
                  <p class="font-sans text-xs text-[#f0e0c0] leading-tight break-words">
                    {{ gameStore.participant.prodi }}
                  </p>
                  <p class="font-sans text-[11px] text-[#a08060] leading-tight break-words">
                    {{ gameStore.participant.faculty }}
                  </p>
                </div>
              </div>

              <!-- Level Title & Details -->
              <div class="bg-[#170f07] p-3 border-2 border-[#5a3a18] rounded-xl mb-4 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-pixel text-[9px] text-[#a08060] uppercase">
                    Pangkat:
                  </span>
                  <PixelBadge
                    :variant="completedFloors === 9 ? 'gold' : 'emerald'"
                    size="sm"
                  >
                    {{ currentLevel }}
                  </PixelBadge>
                </div>
                <p class="font-sans text-xs text-[#c4956a] leading-relaxed">
                  {{ currentLevelData.description }}
                </p>
              </div>
            </div>

            <!-- Certificate Unlock Banner if completed -->
            <div
              v-if="isAllCompleted"
              class="bg-[#1f3a2b] border-2 border-[#7ec850] rounded-xl p-3 shadow text-center space-y-2"
            >
              <div class="font-pixel text-xs font-bold text-[#f0d060] flex items-center justify-center gap-1.5">
                <PhTrophy :size="16" weight="fill" class="text-[#f0d060]" />
                <span>Semua Lantai Selesai!</span>
              </div>
              <button
                type="button"
                @click="() => {
                  if (gameStore.soundEnabled) soundEngine.playClick();
                  showCertificate = true;
                }"
                class="w-full rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold cursor-pointer"
              >
                Buka Sertifikat Kelulusan
              </button>
            </div>
            <div
              v-else
              class="bg-[#170f07] p-2.5 border border-[#5a3a18] rounded-lg text-xs font-sans text-[#a08060] text-center"
            >
              Selesaikan {{ 9 - completedFloors }} lantai lagi untuk membuka sertifikat kelulusan.
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="lg:col-span-7">
          <div class="h-full sdv-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b-2 border-[#5a3a18] pb-3">
                <div class="font-pixel text-xs text-[#f0d060]">
                  Koleksi Stempel
                </div>
                <div class="font-pixel text-xs text-[#7ec850]">
                  {{ totalStampsCollected }} / 18 Stempel
                </div>
              </div>

              <!-- Progress bars -->
              <div class="space-y-3">
                <PixelProgress
                  :value="totalStampsCollected"
                  :max="18"
                  label="TOTAL STEMPEL"
                  :sublabel="`${totalStampsCollected} dari 18`"
                  color="emerald"
                  height="md"
                />

                <PixelProgress
                  :value="completedFloors"
                  :max="9"
                  label="LANTAI SELESAI"
                  :sublabel="`${completedFloors} dari 9`"
                  color="gold"
                  height="md"
                />
              </div>
            </div>

            <div class="border-t border-[#5a3a18] pt-3 mt-4 flex items-center justify-between">
              <span class="font-pixel text-xs text-[#f0d060]">
                Total: {{ gameStore.participant.totalXp }} XP
              </span>
              <RouterLink to="/play">
                <button
                  type="button"
                  @click="() => gameStore.soundEnabled && soundEngine.playClick()"
                  class="rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold flex items-center gap-2 cursor-pointer"
                >
                  <span>Mulai Main</span>
                  <PhArrowRight :size="14" weight="bold" />
                </button>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 18-Stamp Grid (9 Floors x 2 Booths) -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between px-1">
          <h3 class="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
            DAFTAR 18 STEMPEL (9 LANTAI)
          </h3>
          <span class="text-[10px] font-pixel text-[#a08060]">
            KLIK UNTUK DETAIL
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="floor in FLOORS_DATA"
            :key="floor.number"
            :class="[
              'sdv-card p-3.5 sm:p-4',
              Boolean(gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id] && gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id])
                ? 'border-[#7ec850] bg-[#1e3321]'
                : ''
            ]"
          >
            <div class="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-2 mb-3">
              <div class="flex items-center gap-2">
                <span class="font-pixel text-xs font-bold text-[#7ec850]">
                  Lantai {{ floor.number }}:
                </span>
                <span class="font-pixel text-xs text-white">
                  {{ floor.name.split(' - ')[1] || floor.name }}
                </span>
              </div>
              <PixelBadge
                v-if="Boolean(gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id] && gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id])"
                variant="emerald"
                size="sm"
              >
                <PhCheckCircle :size="12" weight="bold" /> 2/2 Selesai
              </PixelBadge>
              <span v-else class="font-sans text-xs text-[#a08060]">
                {{ (gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id] || gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id]) ? '1/2' : '0/2' }}
              </span>
            </div>

            <!-- 2 Stamps Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Stamp A -->
              <button
                type="button"
                @click="() => {
                  if (gameStore.soundEnabled) soundEngine.playSelect();
                  selectedStampPreview = BOOTHS_DATA[floor.boothIds[0]].id;
                }"
                :class="[
                  'w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer',
                  gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id]
                    ? 'bg-[#1a2e1a] border-[#7ec850] shadow hover:border-[#f0d060]'
                    : 'bg-[#170f07]/70 border-dashed border-[#5a3a18] hover:border-[#8b6f4e] opacity-70'
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    :class="[
                      'w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center shrink-0',
                      gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id]
                        ? 'border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018]'
                        : 'border-[#5a3a18] bg-[#23160c] text-[#5a3a18]'
                    ]"
                  >
                    <StampIcon
                      v-if="gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id]"
                      :name="BOOTHS_DATA[floor.boothIds[0]].stampIcon"
                      :size="20"
                      class="text-[#f0d060]"
                    />
                    <PhLockKey v-else :size="18" weight="bold" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span class="font-pixel text-[9px] bg-[#170f07] px-1.5 py-0.5 rounded text-[#f0d060] border border-[#5a3a18]">
                        {{ BOOTHS_DATA[floor.boothIds[0]].code }}
                      </span>
                      <span class="font-sans text-[11px] text-[#c4956a] leading-tight">
                        {{ BOOTHS_DATA[floor.boothIds[0]].badgeTag }}
                      </span>
                    </div>
                    <h4
                      :class="[
                        'font-pixel text-[9px] sm:text-[10px] leading-normal break-words',
                        gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id] ? 'text-white font-bold' : 'text-[#a08060]'
                      ]"
                    >
                      {{ BOOTHS_DATA[floor.boothIds[0]].name }}
                    </h4>
                  </div>
                </div>

                <div class="shrink-0">
                  <PhCheckCircle
                    v-if="gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[0]].id]"
                    :size="18"
                    weight="fill"
                    class="text-[#7ec850]"
                  />
                  <span v-else class="font-pixel text-[9px] text-[#f0d060] bg-[#2d1b0e] px-2 py-1 rounded border border-[#5a3a18]">
                    Buka
                  </span>
                </div>
              </button>

              <!-- Stamp B -->
              <button
                type="button"
                @click="() => {
                  if (gameStore.soundEnabled) soundEngine.playSelect();
                  selectedStampPreview = BOOTHS_DATA[floor.boothIds[1]].id;
                }"
                :class="[
                  'w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer',
                  gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id]
                    ? 'bg-[#1a2e1a] border-[#7ec850] shadow hover:border-[#f0d060]'
                    : 'bg-[#170f07]/70 border-dashed border-[#5a3a18] hover:border-[#8b6f4e] opacity-70'
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    :class="[
                      'w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center shrink-0',
                      gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id]
                        ? 'border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018]'
                        : 'border-[#5a3a18] bg-[#23160c] text-[#5a3a18]'
                    ]"
                  >
                    <StampIcon
                      v-if="gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id]"
                      :name="BOOTHS_DATA[floor.boothIds[1]].stampIcon"
                      :size="20"
                      class="text-[#f0d060]"
                    />
                    <PhLockKey v-else :size="18" weight="bold" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span class="font-pixel text-[9px] bg-[#170f07] px-1.5 py-0.5 rounded text-[#f0d060] border border-[#5a3a18]">
                        {{ BOOTHS_DATA[floor.boothIds[1]].code }}
                      </span>
                      <span class="font-sans text-[11px] text-[#c4956a] leading-tight">
                        {{ BOOTHS_DATA[floor.boothIds[1]].badgeTag }}
                      </span>
                    </div>
                    <h4
                      :class="[
                        'font-pixel text-[9px] sm:text-[10px] leading-normal break-words',
                        gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id] ? 'text-white font-bold' : 'text-[#a08060]'
                      ]"
                    >
                      {{ BOOTHS_DATA[floor.boothIds[1]].name }}
                    </h4>
                  </div>
                </div>

                <div class="shrink-0">
                  <PhCheckCircle
                    v-if="gameStore.participant.stamps[BOOTHS_DATA[floor.boothIds[1]].id]"
                    :size="18"
                    weight="fill"
                    class="text-[#7ec850]"
                  />
                  <span v-else class="font-pixel text-[9px] text-[#f0d060] bg-[#2d1b0e] px-2 py-1 rounded border border-[#5a3a18]">
                    Buka
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Stamp Detail Modal -->
    <div
      v-if="selectedStampPreview"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        v-if="BOOTHS_DATA[selectedStampPreview]"
        class="w-full max-w-md sdv-card-gold p-5 sm:p-6 text-center relative"
      >
        <!-- Stamp Graphic -->
        <div class="my-3 flex justify-center">
          <div
            :class="[
              'w-24 h-24 border-3 rounded-xl flex flex-col items-center justify-center p-2 rotate-[-2deg]',
              gameStore.participant.stamps[selectedStampPreview]
                ? 'border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018] shadow'
                : 'border-[#5a3a18] bg-[#170f07] opacity-40'
            ]"
          >
            <StampIcon
              :name="BOOTHS_DATA[selectedStampPreview].stampIcon"
              :size="28"
              :class="gameStore.participant.stamps[selectedStampPreview] ? 'text-[#f0d060]' : 'text-[#8b6f4e]'"
            />
            <span class="font-pixel text-[8px] text-[#f0d060] font-bold uppercase mt-1">
              {{ BOOTHS_DATA[selectedStampPreview].stampTitle }}
            </span>
          </div>
        </div>

        <h3 class="font-pixel text-sm font-bold text-white mb-1">
          {{ BOOTHS_DATA[selectedStampPreview].name }}
        </h3>
        <p class="font-sans text-xs text-[#c4956a] mb-4 leading-relaxed">
          {{ BOOTHS_DATA[selectedStampPreview].story }}
        </p>

        <div
          v-if="gameStore.participant.stamps[selectedStampPreview]"
          class="bg-[#170f07] p-2.5 border border-[#4a8030] rounded-lg mb-4 space-y-1 text-xs"
        >
          <div class="text-[#7ec850] font-pixel text-[9px]">
            STATUS: RESMI DISTEMPEL
          </div>
          <div class="text-[#f0d060] font-sans">
            Skor: {{ gameStore.participant.stamps[selectedStampPreview]?.score }}/{{ gameStore.participant.stamps[selectedStampPreview]?.totalQuestions }} Benar
          </div>
        </div>
        <div
          v-else
          class="bg-[#170f07] p-2.5 border border-[#5a3a18] rounded-lg mb-4 text-xs font-sans text-[#a08060]"
        >
          Kunjungi spot ini di Lantai {{ BOOTHS_DATA[selectedStampPreview].floorNumber }} untuk menyelesaikan tantangan.
        </div>

        <div class="flex gap-2">
          <RouterLink
            :to="`/play/floor/${BOOTHS_DATA[selectedStampPreview].floorNumber}/spot/${BOOTHS_DATA[selectedStampPreview].id}`"
            class="w-full"
          >
            <button
              type="button"
              @click="() => gameStore.soundEnabled && soundEngine.playClick()"
              class="rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold w-full"
            >
              {{ gameStore.participant.stamps[selectedStampPreview] ? 'Main Ulang' : 'Mainkan' }}
            </button>
          </RouterLink>
          <button
            type="button"
            @click="() => {
              if (gameStore.soundEnabled) soundEngine.playClick();
              selectedStampPreview = null;
            }"
            class="rpg-btn-wood py-2.5 px-4 text-xs font-pixel font-bold w-full cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>

    <!-- Graduation Certificate Modal -->
    <div
      v-if="showCertificate"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div class="w-full max-w-2xl bg-gradient-to-b from-[#2d1b0e] to-[#170f07] border-[4px] border-[#f0d060] rounded-2xl p-6 sm:p-8 text-center relative shadow-2xl">
        <div class="border-2 border-[#8b6f4e] rounded-xl p-6 sm:p-8 bg-[#170f07]/90 space-y-4 shadow-inner">
          <div class="flex items-center justify-center gap-3">
            <img
              src="/unu.png"
              alt="UNU Logo"
              width="56"
              height="56"
              class="h-12 w-auto object-contain"
            />
          </div>

          <div class="font-pixel text-[10px] sm:text-xs text-[#7ec850] tracking-widest uppercase">
            UNIVERSITAS NAHDLATUL ULAMA YOGYAKARTA
          </div>

          <h2 class="font-pixel text-lg sm:text-2xl font-bold text-[#f0d060]">
            SERTIFIKAT KELULUSAN ORIENTASI
          </h2>

          <p class="font-sans text-xs text-[#c4956a]">
            Menyatakan bahwa:
          </p>

          <div class="text-lg sm:text-xl font-pixel font-bold text-white border-b-2 border-dashed border-[#f0d060] pb-2 max-w-md mx-auto">
            {{ gameStore.participant.name }}
          </div>

          <div class="font-mono text-xs text-[#7ec850]">
            NIM: {{ gameStore.participant.nim }} • {{ gameStore.participant.prodi }}
          </div>

          <p class="font-sans text-xs sm:text-sm text-[#f0e6d2] max-w-lg mx-auto leading-relaxed">
            Telah berhasil menyelesaikan eksplorasi 9 lantai dan mengumpulkan seluruh 18 stempel orientasi.
          </p>

          <div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              @click="handlePrint"
              class="rpg-btn-primary py-3 px-6 text-xs font-pixel font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhPrinter :size="18" weight="bold" />
              <span>Cetak Sertifikat</span>
            </button>
            <button
              type="button"
              @click="() => {
                if (gameStore.soundEnabled) soundEngine.playClick();
                showCertificate = false;
              }"
              class="rpg-btn-wood py-3 px-6 text-xs font-pixel font-bold cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
