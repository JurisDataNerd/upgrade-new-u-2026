<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  PhStorefront,
  PhQrCode,
  PhMagnifyingGlass,
  PhCheckCircle,
  PhMapPin,
  PhSparkle,
  PhInfo,
  PhX,
  PhInstagramLogo,
  PhPhone,
  PhListChecks,
  PhFlag,
  PhArrowsClockwise,
} from '@phosphor-icons/vue';
import { useGameStore } from '@/store/gameStore';
import { ORMAWA_STANDS } from '@/data/ormawaData';
import { OrmawaStand } from '@/types/ormawa';
import QrScannerModal from '@/components/common/QrScannerModal.vue';
import PixelCard from '@/components/ui/PixelCard.vue';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import { soundEngine } from '@/lib/sound';

const gameStore = useGameStore();

const selectedFloor = ref<number | 'ALL'>('ALL');
const searchQuery = ref('');
const showScanner = ref(false);
const activeStandDetail = ref<OrmawaStand | null>(null);
const scanToast = ref<{ message: string; success: boolean; xp: number } | null>(null);

// Preset QR codes untuk testing/demo di lapangan
const ormawaPresets = computed(() => {
  return ORMAWA_STANDS.map((s) => ({
    label: `${s.shortName} (Lt ${s.floor})`,
    code: s.qrToken,
    description: s.name,
  }));
});

const filteredStands = computed(() => {
  let list = ORMAWA_STANDS;

  if (selectedFloor.value !== 'ALL') {
    list = list.filter((s) => s.floor === selectedFloor.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }

  return list;
});

const visitedCount = computed(() => gameStore.visitedOrmawaCount);
const xpEarned = computed(() => gameStore.ormawaXpEarned);
const isCapped = computed(() => gameStore.isOrmawaCapped);

const handleScanResult = (scannedCode: string) => {
  showScanner.value = false;
  const result = gameStore.scanOrmawa(scannedCode);

  scanToast.value = {
    message: result.message,
    success: result.success,
    xp: result.xpEarned,
  };

  setTimeout(() => {
    scanToast.value = null;
  }, 4500);
};

const openStandDetail = (stand: OrmawaStand) => {
  if (gameStore.soundEnabled) soundEngine.playSelect();
  activeStandDetail.value = stand;
};

const closeStandDetail = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  activeStandDetail.value = null;
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'BELA_DIRI':
      return 'Bela Diri';
    case 'TEKNOLOGI':
      return 'Teknologi & AI';
    case 'SENI_BUDAYA':
      return 'Seni & Budaya';
    case 'SOSIAL_KEMANUSIAAN':
      return 'Sosial & Relawan';
    case 'OLAHRAGA':
      return 'Olahraga';
    case 'PENALARAN_KEISLAMAN':
      return 'Penalaran & Aswaja';
    default:
      return category;
  }
};
</script>

<template>
  <div class="min-h-[100dvh] bg-[#140e08] text-amber-100 pb-16 pt-2 px-3 sm:px-6">
    <div class="max-w-4xl mx-auto space-y-4">
      <!-- Top Hero Header -->
      <PixelCard variant="gold" class="p-4 sm:p-5 relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <PixelBadge variant="warning" class="text-[9px] font-pixel uppercase tracking-widest">
                HARI KE-3 &bull; EXPO KAMPUS
              </PixelBadge>
              <span class="text-[10px] text-amber-300/80 font-mono">Selasar Lt 3, 4, 5</span>
            </div>
            <h1 class="font-pixel text-base sm:text-xl text-[#f0d060] font-bold tracking-wide">
              ORMAWA EXPO DISCOVERY
            </h1>
            <p class="font-sans text-xs text-amber-200/90 leading-relaxed max-w-xl">
              Kunjungi stan Unit Kegiatan Mahasiswa (UKM) & Lembaga Kampus UNU Yogyakarta. Pindai QR stand untuk mengoleksi lencana dan memperoleh hingga +750 XP!
            </p>
          </div>

          <!-- Quick QR Trigger CTA -->
          <div class="shrink-0 flex items-center">
            <PixelButton
              variant="primary"
              size="md"
              class="w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg"
              @click="showScanner = true"
            >
              <PhQrCode :size="18" weight="bold" />
              <span>PINDAI QR STAN</span>
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      <!-- Toast Feedback -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="scanToast"
          :class="[
            'p-3 rounded-lg border-2 flex items-center justify-between gap-3 text-xs font-mono shadow-xl',
            scanToast.success
              ? 'bg-[#142314] border-[#22c55e] text-[#86efac]'
              : 'bg-[#291717] border-[#ef4444] text-[#fca5a5]'
          ]"
        >
          <div class="flex items-center gap-2">
            <PhCheckCircle v-if="scanToast.success" :size="18" weight="fill" class="shrink-0 text-[#4ade80]" />
            <PhInfo v-else :size="18" weight="fill" class="shrink-0 text-[#f87171]" />
            <span>{{ scanToast.message }}</span>
          </div>
          <button
            type="button"
            @click="scanToast = null"
            class="text-gray-400 hover:text-white shrink-0 p-1"
          >
            <PhX :size="14" />
          </button>
        </div>
      </transition>

      <!-- XP Capping Live HUD Meter -->
      <div class="p-3.5 bg-[#1c130b] border-2 border-[#5a3a18] rounded-xl space-y-2.5 shadow-md font-mono">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <PhSparkle :size="16" weight="fill" class="text-[#facc15]" />
            <span class="font-bold text-amber-200 uppercase tracking-wider text-[11px]">
              XP Capping Stand Progress
            </span>
          </div>
          <div class="text-right">
            <span class="font-pixel text-[#86efac] font-bold text-xs sm:text-sm">
              {{ visitedCount }}/10 STAN
            </span>
            <span class="text-amber-300/80 text-[10px] ml-1.5">
              (+{{ xpEarned }}/750 XP)
            </span>
          </div>
        </div>

        <!-- Visual Progress Bar -->
        <div class="w-full bg-[#100a06] h-3 rounded-full border border-[#3d2613] p-0.5 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#ca8a04] via-[#eab308] to-[#22c55e]"
            :style="{ width: `${Math.min(100, (visitedCount / 10) * 100)}%` }"
          ></div>
        </div>

        <!-- Capping Status Notice -->
        <div class="flex items-center justify-between text-[10px] text-amber-300/70 pt-0.5">
          <span v-if="!isCapped">
            Tiap stan baru memberikan <strong>+75 XP</strong> (Maksimal 10 stan).
          </span>
          <span v-else class="text-[#86efac] font-bold">
            Batas Maksimum XP (10 Stan / +750 XP) Tercapai! Kunjungan stan selanjutnya tetap tercatat di paspor.
          </span>

          <span class="text-gray-400">
            Total Stan di Kampus: {{ ORMAWA_STANDS.length }}
          </span>
        </div>
      </div>

      <!-- Filters & Floor Selector Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <!-- Floor Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-pixel text-[9px] sm:text-[10px]">
          <button
            type="button"
            @click="selectedFloor = 'ALL'"
            :class="[
              'px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer',
              selectedFloor === 'ALL'
                ? 'bg-[#ca8a04] text-[#140e08] font-bold border-[#facc15]'
                : 'bg-[#1f150c] text-amber-200 border-[#5a3a18] hover:border-[#8b6538]'
            ]"
          >
            SEMUA STAN ({{ ORMAWA_STANDS.length }})
          </button>
          <button
            type="button"
            v-for="floorNum in [3, 4, 5]"
            :key="floorNum"
            @click="selectedFloor = floorNum"
            :class="[
              'px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer',
              selectedFloor === floorNum
                ? 'bg-[#ca8a04] text-[#140e08] font-bold border-[#facc15]'
                : 'bg-[#1f150c] text-amber-200 border-[#5a3a18] hover:border-[#8b6538]'
            ]"
          >
            LANTAI {{ floorNum }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari stan UKM, robotika, seni..."
            class="w-full bg-[#1b1209] border border-[#5a3a18] focus:border-[#facc15] rounded-lg pl-8 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-200/40 outline-none font-mono"
          />
          <PhMagnifyingGlass :size="14" class="text-amber-400/60 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <!-- Stands Grid (2-Column Responsive Layout) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div
          v-for="stand in filteredStands"
          :key="stand.id"
          :class="[
            'p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between space-y-3',
            gameStore.isStandVisited(stand.id)
              ? 'bg-[#172216] border-[#22c55e]/60 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
              : 'bg-[#1b1209] border-[#442c17] hover:border-[#78512b]'
          ]"
        >
          <!-- Top Row: Badges & Floor -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-[#2b1c11] border border-[#ca8a04]/40 text-[8px] font-pixel text-[#facc15]">
                  LT {{ stand.floor }}
                </span>
                <span class="px-2 py-0.5 rounded bg-[#101824] border border-[#0284c7]/40 text-[8px] font-mono text-[#38bdf8]">
                  {{ getCategoryLabel(stand.category) }}
                </span>
              </div>

              <!-- Visited Status Indicator -->
              <span
                v-if="gameStore.isStandVisited(stand.id)"
                class="px-2 py-0.5 rounded bg-[#142314] border border-[#22c55e] text-[8px] font-pixel text-[#86efac] flex items-center gap-1 shrink-0"
              >
                <PhCheckCircle :size="11" weight="fill" />
                <span>TERVERIFIKASI</span>
              </span>
              <span
                v-else
                class="text-[8px] text-amber-400/60 font-mono italic shrink-0"
              >
                Belum Dikunjungi
              </span>
            </div>

            <!-- Stand Title & Tagline -->
            <div>
              <h3 class="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold leading-snug">
                {{ stand.name }}
              </h3>
              <p class="font-sans text-[11px] text-amber-200/70 italic mt-0.5">
                "{{ stand.tagline }}"
              </p>
            </div>

            <!-- Location info -->
            <div class="flex items-center gap-1 text-[10px] text-gray-300 font-mono pt-1">
              <PhMapPin :size="13" class="text-[#f59e0b] shrink-0" />
              <span class="line-clamp-1">{{ stand.location }}</span>
            </div>
          </div>

          <!-- Bottom Row: Action Buttons -->
          <div class="pt-2 border-t border-[#3d2613] grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="openStandDetail(stand)"
              class="h-8 px-2 bg-[#2a1d12] hover:bg-[#3d2919] border border-[#6b4724] text-amber-200 font-pixel text-[9px] rounded flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-95"
            >
              <PhInfo :size="13" />
              <span>DETAIL STAN</span>
            </button>

            <button
              type="button"
              @click="handleScanResult(stand.qrToken)"
              :disabled="gameStore.isStandVisited(stand.id)"
              :class="[
                'h-8 px-2 font-pixel text-[9px] font-bold rounded flex items-center justify-center gap-1 transition-all',
                gameStore.isStandVisited(stand.id)
                  ? 'bg-[#182a17] text-[#86efac] opacity-70 cursor-default'
                  : 'bg-[#ca8a04] hover:bg-[#eab308] text-[#140e08] cursor-pointer shadow active:scale-95'
              ]"
            >
              <PhQrCode :size="13" weight="bold" />
              <span>{{ gameStore.isStandVisited(stand.id) ? 'TERCATAT' : 'PINDAI STAN' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty Filter State -->
      <div
        v-if="filteredStands.length === 0"
        class="p-8 text-center bg-[#1b1209] border-2 border-dashed border-[#5a3a18] rounded-xl space-y-2 font-mono"
      >
        <PhStorefront :size="32" class="text-amber-400 mx-auto opacity-40" />
        <p class="text-xs text-amber-200">Tidak ada stan ormawa yang cocok dengan pencarian.</p>
        <button
          type="button"
          @click="searchQuery = ''; selectedFloor = 'ALL'"
          class="text-[10px] text-[#facc15] underline cursor-pointer"
        >
          Reset Filter &amp; Pencarian
        </button>
      </div>
    </div>

    <!-- Stand Detail Modal -->
    <div
      v-if="activeStandDetail"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      @click.self="closeStandDetail"
    >
      <div class="w-full max-w-lg bg-[#1a1109] border-2 border-[#f59e0b] rounded-xl shadow-2xl p-4 sm:p-5 space-y-4 max-h-[90vh] overflow-y-auto font-sans">
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-3 border-b border-[#3d2613] pb-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-[#2b1c11] border border-[#ca8a04]/40 text-[8px] font-pixel text-[#facc15]">
                LANTAI {{ activeStandDetail.floor }}
              </span>
              <span class="text-[10px] text-gray-400 font-mono">
                {{ getCategoryLabel(activeStandDetail.category) }}
              </span>
            </div>
            <h2 class="font-pixel text-sm sm:text-base text-[#fef08a] font-bold">
              {{ activeStandDetail.name }}
            </h2>
            <p class="text-xs text-amber-200/80 italic">
              "{{ activeStandDetail.tagline }}"
            </p>
          </div>

          <button
            type="button"
            @click="closeStandDetail"
            class="p-1 rounded bg-[#2a1d12] hover:bg-[#3d2919] text-gray-300 hover:text-white shrink-0 cursor-pointer"
          >
            <PhX :size="18" />
          </button>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <span class="text-[10px] text-gray-400 font-mono font-bold uppercase block">
            TENTANG UKM / ORGANISASI
          </span>
          <p class="text-xs text-amber-100/90 leading-relaxed">
            {{ activeStandDetail.description }}
          </p>
        </div>

        <!-- Kegiatan Rutin -->
        <div class="space-y-1.5">
          <span class="text-[10px] text-gray-400 font-mono font-bold uppercase flex items-center gap-1">
            <PhListChecks :size="14" class="text-[#facc15]" />
            <span>KEGIATAN UTAMA &amp; AGENDA</span>
          </span>
          <ul class="space-y-1 text-xs text-amber-100/85">
            <li
              v-for="(act, idx) in activeStandDetail.activities"
              :key="idx"
              class="flex items-start gap-2 bg-[#120b06] p-2 rounded border border-[#2e1d0f]"
            >
              <span class="text-[#facc15] font-bold">&bull;</span>
              <span>{{ act }}</span>
            </li>
          </ul>
        </div>

        <!-- Syarat Pendaftaran -->
        <div class="space-y-1.5">
          <span class="text-[10px] text-gray-400 font-mono font-bold uppercase flex items-center gap-1">
            <PhFlag :size="14" class="text-[#38bdf8]" />
            <span>SYARAT BERGABUNG</span>
          </span>
          <ul class="space-y-1 text-xs text-amber-100/85">
            <li
              v-for="(req, idx) in activeStandDetail.requirements"
              :key="idx"
              class="flex items-start gap-2 bg-[#120b06] p-2 rounded border border-[#2e1d0f]"
            >
              <span class="text-[#38bdf8] font-bold">&bull;</span>
              <span>{{ req }}</span>
            </li>
          </ul>
        </div>

        <!-- Social & Narahubung -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div class="flex items-center gap-2 p-2 bg-[#120b06] rounded border border-[#2e1d0f] text-gray-300">
            <PhInstagramLogo :size="16" class="text-pink-400 shrink-0" />
            <span>{{ activeStandDetail.instagram }}</span>
          </div>

          <div
            v-if="activeStandDetail.contactPerson"
            class="flex items-center gap-2 p-2 bg-[#120b06] rounded border border-[#2e1d0f] text-gray-300"
          >
            <PhPhone :size="16" class="text-green-400 shrink-0" />
            <span>{{ activeStandDetail.contactPerson }}</span>
          </div>
        </div>

        <!-- Modal CTA -->
        <div class="pt-2 border-t border-[#3d2613] flex items-center justify-between gap-2">
          <span class="text-[10px] text-gray-400 font-mono">
            Kode: <code class="text-[#facc15]">{{ activeStandDetail.qrToken }}</code>
          </span>

          <button
            type="button"
            @click="handleScanResult(activeStandDetail.qrToken); closeStandDetail()"
            :disabled="gameStore.isStandVisited(activeStandDetail.id)"
            class="h-9 px-4 bg-[#ca8a04] hover:bg-[#eab308] disabled:bg-[#1f2e1e] text-[#140e08] disabled:text-[#86efac] font-pixel text-[10px] font-bold rounded flex items-center gap-1.5 cursor-pointer disabled:cursor-default transition-all active:scale-95 shadow"
          >
            <PhQrCode :size="15" weight="bold" />
            <span>{{ gameStore.isStandVisited(activeStandDetail.id) ? 'SUDAH TERVERIFIKASI' : 'SIMULASIKAN SCAN STAN' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Reusable QrScannerModal -->
    <QrScannerModal
      :is-open="showScanner"
      title="SCAN QR STAN ORMAWA (HARI 3)"
      subtitle="Arahkan kamera ke QR Code di meja stan atau pilih stan demo di bawah"
      expected-pattern="UNU-ORMAWA"
      :preset-codes="ormawaPresets"
      @close="showScanner = false"
      @scan-success="handleScanResult"
    />
  </div>
</template>
