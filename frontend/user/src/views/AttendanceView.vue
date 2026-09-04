<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import {
  PhCalendarCheck,
  PhQrCode,
  PhClock,
  PhCheckCircle,
  PhStar,
  PhChatTeardropDots,
  PhDoorOpen,
  PhWarning,
  PhArrowLeft,
  PhSparkle,
  PhShieldCheck,
  PhHouse,
} from '@phosphor-icons/vue';
import confetti from 'canvas-confetti';
import { useGameStore } from '@/store/gameStore';
import QrScannerModal from '@/components/common/QrScannerModal.vue';
import { soundEngine } from '@/lib/sound';

const gameStore = useGameStore();

const selectedDay = ref<1 | 2 | 3>(1);
const isScannerOpen = ref(false);
const scannerMode = ref<'check-in' | 'check-out'>('check-in');
const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null);

// Form Refleksi
const ratingFasilitas = ref(5);
const ratingMateri = ref(5);
const ratingBuddy = ref(5);
const essayInsight = ref('');

const currentDayRecord = computed(() => gameStore.getAttendanceForDay(selectedDay.value));
const isCheckedIn = computed(() => gameStore.isDayCheckedIn(selectedDay.value));
const isReflectionSubmitted = computed(() => gameStore.isDayReflectionSubmitted(selectedDay.value));
const isCheckedOut = computed(() => gameStore.isDayCheckedOut(selectedDay.value));

const daysConfig = [
  {
    day: 1 as const,
    date: 'Selasa, 22 Sep 2026',
    title: 'Hari 1: Identity & Niat',
    focus: 'Onboarding, Welcoming, Aswaja & FGD 1',
  },
  {
    day: 2 as const,
    date: 'Rabu, 23 Sep 2026',
    title: 'Hari 2: 9-Floor Quest',
    focus: 'Teknologi, Satgas PPKS & 18 Pos Lantai',
  },
  {
    day: 3 as const,
    date: 'Kamis, 24 Sep 2026',
    title: 'Hari 3: Ormawa Expo',
    focus: 'Katalog UKM, Penutupan & Grand Finale',
  },
];

const totalAttendanceXp = computed(() => gameStore.getTotalAttendanceXp());

const showNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message };
  setTimeout(() => {
    notification.value = null;
  }, 4500);
};

const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#facc15'],
    });
  } catch {
    // Ignore if canvas-confetti is not loaded
  }
};

const openScannerForCheckIn = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  scannerMode.value = 'check-in';
  isScannerOpen.value = true;
};

const openScannerForCheckOut = () => {
  if (gameStore.soundEnabled) soundEngine.playClick();
  scannerMode.value = 'check-out';
  isScannerOpen.value = true;
};

const handleTokenScanned = (token: string) => {
  if (scannerMode.value === 'check-in') {
    const res = gameStore.checkIn(selectedDay.value, token);
    if (res.success) {
      showNotification('success', res.message);
      triggerConfetti();
    } else {
      showNotification('error', res.message);
      if (gameStore.soundEnabled) soundEngine.playWrong();
    }
  } else {
    const res = gameStore.checkOut(selectedDay.value, token);
    if (res.success) {
      showNotification('success', res.message);
      triggerConfetti();
    } else {
      showNotification('error', res.message);
      if (gameStore.soundEnabled) soundEngine.playWrong();
    }
  }
};

const handleSubmitReflection = () => {
  if (!essayInsight.value.trim()) {
    showNotification('error', 'Mohon isi esai refleksi singkat mengenai pelajaran hari ini.');
    return;
  }

  const res = gameStore.submitReflection(selectedDay.value, {
    ratingFasilitas: ratingFasilitas.value,
    ratingMateri: ratingMateri.value,
    ratingBuddy: ratingBuddy.value,
    essayInsight: essayInsight.value.trim(),
  });

  if (res.success) {
    showNotification('success', res.message);
    triggerConfetti();
    essayInsight.value = '';
  } else {
    showNotification('error', res.message);
  }
};

const formatTime = (isoString?: string | null) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
};

const currentExpectedGateToken = computed(() => `UNU-PRESENSI-H${selectedDay.value}-GATE-2026`);
const currentExpectedCheckoutToken = computed(() => `UNU-PRESENSI-H${selectedDay.value}-CHECKOUT-2026`);
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col bg-[#1f140c] text-[#f0e0c0] selection:bg-[#7ec850] selection:text-[#1b120a] pb-12 select-none">
    <!-- Top Navigation Bar Header -->
    <header class="sticky top-0 z-30 w-full bg-[#170e08]/95 border-b-2 border-[#5a3a18] backdrop-blur px-3 sm:px-6 py-2 flex items-center justify-between shadow-md">
      <div class="flex items-center gap-2">
        <RouterLink
          to="/"
          class="h-8 px-2.5 bg-[#2d1b0e] border border-[#784d24] rounded text-xs font-pixel text-[#f0d060] hover:border-[#f0d060] flex items-center gap-1.5 transition-all active:scale-95"
        >
          <PhArrowLeft :size="14" weight="bold" />
          <span class="hidden sm:inline">BERANDA</span>
        </RouterLink>

        <div class="flex flex-col">
          <h1 class="font-pixel text-xs sm:text-sm text-[#f0d060] leading-none flex items-center gap-1.5">
            <PhCalendarCheck :size="16" weight="fill" class="text-[#facc15]" />
            <span>PRESENSI & REFLEKSI</span>
          </h1>
          <span class="font-mono text-[9px] text-[#a08060] mt-0.5">SISTEM ANTI-TITIP ABSEN PKKMB 2026</span>
        </div>
      </div>

      <!-- Quick Total XP Badge -->
      <div class="bg-[#2d1b0e] border border-[#d97706] px-2.5 py-1 rounded flex items-center gap-1.5 shadow-sm">
        <PhSparkle :size="14" weight="fill" class="text-[#facc15]" />
        <span class="font-pixel text-[10px] sm:text-xs text-[#facc15]">+{{ totalAttendanceXp }} XP</span>
      </div>
    </header>

    <!-- Global Floating Notification Alert -->
    <div
      v-if="notification"
      :class="[
        'fixed top-14 inset-x-3 sm:inset-x-auto sm:right-6 z-50 p-3 rounded-lg border-2 shadow-2xl font-mono text-xs flex items-center gap-2 max-w-md animate-in slide-in-from-top-2 duration-200',
        notification.type === 'success'
          ? 'bg-[#142612] border-[#22c55e] text-[#86efac]'
          : 'bg-[#2a1010] border-[#ef4444] text-[#fca5a5]'
      ]"
    >
      <PhCheckCircle v-if="notification.type === 'success'" :size="18" weight="bold" class="shrink-0" />
      <PhWarning v-else :size="18" weight="bold" class="shrink-0" />
      <span class="leading-tight">{{ notification.message }}</span>
    </div>

    <!-- Main Container -->
    <main class="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4 flex-1">
      <!-- 3 Days Selector Tabs (Pixel Style) -->
      <div class="grid grid-cols-3 gap-1.5 sm:gap-3">
        <button
          v-for="d in daysConfig"
          :key="d.day"
          type="button"
          @click="() => { selectedDay = d.day; if (gameStore.soundEnabled) soundEngine.playSelect(); }"
          :class="[
            'p-2 sm:p-3 rounded-lg border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer active:scale-98',
            selectedDay === d.day
              ? 'bg-gradient-to-b from-[#3a2514] to-[#251509] border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-[#1a1008] border-[#4a301a] opacity-80 hover:opacity-100 hover:border-[#8b5a2b]'
          ]"
        >
          <!-- Active Highlight Strip -->
          <div
            v-if="selectedDay === d.day"
            class="absolute top-0 left-0 right-0 h-1 bg-[#f59e0b]"
          />

          <div>
            <div class="flex items-center justify-between">
              <span class="font-pixel text-[10px] sm:text-xs font-bold text-[#facc15]">
                HARI {{ d.day }}
              </span>
              <span
                v-if="gameStore.isDayCheckedIn(d.day)"
                class="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]"
                title="Sudah Presensi"
              />
            </div>
            <p class="font-sans text-[10px] sm:text-xs text-[#e2c7a7] mt-0.5 font-medium truncate">
              {{ d.date }}
            </p>
          </div>

          <span class="font-mono text-[8px] sm:text-[9px] text-[#a08060] truncate mt-1">
            {{ d.focus }}
          </span>
        </button>
      </div>

      <!-- Current Day Title & Theme Banner -->
      <div class="bg-gradient-to-r from-[#2d1b0e] via-[#24150a] to-[#1a1008] border-2 border-[#8b6f4e] rounded-xl p-3.5 sm:p-4 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span class="font-pixel text-[9px] text-[#f59e0b] uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-[#523e2b]">
            JADWAL RESMI PKKMB 2026
          </span>
          <h2 class="font-pixel text-xs sm:text-sm text-[#f0d060] font-bold mt-1">
            {{ currentDayRecord?.theme }}
          </h2>
        </div>

        <div class="flex items-center gap-2 font-mono text-[11px] text-[#c4956a] shrink-0">
          <PhClock :size="14" weight="bold" class="text-[#facc15]" />
          <span>Sesi Pagi: 07:00 - 07:30</span>
          <span>•</span>
          <span>Sore: 16:00</span>
        </div>
      </div>

      <!-- 3 Flow Cards: 1. Check-In, 2. Refleksi, 3. Check-Out -->
      <div class="space-y-4">

        <!-- ================= CARD 1: CHECK-IN MASUK PAGI ================= -->
        <div class="border-2 border-[#523e2b] bg-[#24160c] rounded-xl p-4 sm:p-5 shadow space-y-3">
          <div class="flex items-start justify-between gap-2 border-b border-[#4a301a] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="h-9 w-9 rounded-lg bg-[#3a7522]/20 border border-[#22c55e] flex items-center justify-center text-[#4ade80]">
                <PhDoorOpen :size="20" weight="bold" />
              </div>
              <div>
                <h3 class="font-pixel text-xs sm:text-sm text-[#facc15] font-bold">
                  1. PRESENSI KEDATANGAN PAGI
                </h3>
                <p class="font-sans text-[11px] text-[#c4956a]">
                  Pindai QR Standing Banner di Gerbang Utama Lantai 1 (07:00 - 07:30 WIB)
                </p>
              </div>
            </div>

            <span
              :class="[
                'font-pixel text-[9px] px-2 py-0.5 rounded border uppercase shrink-0',
                isCheckedIn
                  ? 'bg-[#142612] border-[#22c55e] text-[#86efac]'
                  : 'bg-[#2a1b10] border-[#8b6f4e] text-[#d4b08c]'
              ]"
            >
              {{ isCheckedIn ? 'TERVERIFIKASI' : 'BELUM MASUK' }}
            </span>
          </div>

          <!-- If Already Checked In -->
          <div v-if="isCheckedIn" class="bg-[#172513]/70 border border-[#22c55e]/60 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1 font-mono text-xs">
              <div class="flex items-center gap-1.5 text-[#86efac] font-bold">
                <PhShieldCheck :size="16" weight="fill" />
                <span>KEHADIRAN HARI {{ selectedDay }} BERHASIL DICATAT!</span>
              </div>
              <p class="text-[#bbf7d0]">
                Waktu Kedatangan: <strong>{{ formatTime(currentDayRecord?.checkInAt) }} WIB</strong>
              </p>
              <p class="text-[10px] text-[#86efac]/80">
                Status: <strong class="text-white">{{ currentDayRecord?.checkInStatus === 'ON_TIME' ? 'Tepat Waktu (On-Time)' : 'Terlambat' }}</strong> • Token: {{ currentDayRecord?.checkInQrToken }}
              </p>
            </div>

            <div class="px-3 py-1.5 bg-[#22c55e]/20 border border-[#22c55e] rounded font-pixel text-xs text-[#facc15] text-center shrink-0">
              +100 XP MASUK
            </div>
          </div>

          <!-- If NOT Yet Checked In -->
          <div v-else class="space-y-2.5">
            <p class="font-sans text-xs text-[#d4b08c]">
              Silakan arahkan kamera Anda ke standing banner gerbang kampus untuk memperoleh poin kehadiran pertama dan membuka misi penjelajahan hari ini.
            </p>

            <button
              type="button"
              @click="openScannerForCheckIn"
              class="w-full py-3 px-4 bg-gradient-to-r from-[#2e7d32] to-[#1b5e20] hover:from-[#388e3c] hover:to-[#2e7d32] border-2 border-[#4ade80] rounded-lg font-pixel text-xs sm:text-sm text-[#f0fdf4] font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 transition-all"
            >
              <PhQrCode :size="20" weight="bold" />
              <span>SCAN QR GERBANG KEDATANGAN (+100 XP)</span>
            </button>
          </div>
        </div>

        <!-- ================= CARD 2: KUESIONER REFLEKSI HARIAN ================= -->
        <div
          :class="[
            'border-2 rounded-xl p-4 sm:p-5 shadow space-y-3 transition-all',
            isCheckedIn
              ? 'border-[#523e2b] bg-[#24160c]'
              : 'border-[#3a281c] bg-[#1a1008] opacity-60 pointer-events-none'
          ]"
        >
          <div class="flex items-start justify-between gap-2 border-b border-[#4a301a] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="h-9 w-9 rounded-lg bg-[#ca8a04]/20 border border-[#f59e0b] flex items-center justify-center text-[#facc15]">
                <PhChatTeardropDots :size="20" weight="bold" />
              </div>
              <div>
                <h3 class="font-pixel text-xs sm:text-sm text-[#facc15] font-bold">
                  2. KUESIONER REFLEKSI & EVALUASI
                </h3>
                <p class="font-sans text-[11px] text-[#c4956a]">
                  Bagikan impresi dan masukan Anda mengenai fasilitas dan pembelajaran hari ini
                </p>
              </div>
            </div>

            <span
              :class="[
                'font-pixel text-[9px] px-2 py-0.5 rounded border uppercase shrink-0',
                isReflectionSubmitted
                  ? 'bg-[#142612] border-[#22c55e] text-[#86efac]'
                  : 'bg-[#2a1b10] border-[#8b6f4e] text-[#d4b08c]'
              ]"
            >
              {{ isReflectionSubmitted ? 'TERKIRIM' : 'BELUM MENGISI' }}
            </span>
          </div>

          <!-- If Reflection Already Submitted -->
          <div v-if="isReflectionSubmitted" class="bg-[#1e140b] border border-[#ca8a04]/50 rounded-lg p-3 sm:p-4 space-y-2 font-mono text-xs">
            <div class="flex items-center justify-between text-[#facc15]">
              <div class="flex items-center gap-1.5 font-bold">
                <PhCheckCircle :size="16" weight="bold" />
                <span>REFLEKSI HARI {{ selectedDay }} TELAH DISIMPAN</span>
              </div>
              <span class="font-pixel text-[10px] text-[#86efac]">+25 XP REFLEKSI</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              <div class="bg-black/30 p-2 rounded border border-[#523e2b]">
                <span class="text-[#a08060] text-[9px] block">Fasilitas Kampus:</span>
                <span class="text-[#facc15] font-bold">★ {{ currentDayRecord?.reflection?.ratingFasilitas }} / 5</span>
              </div>
              <div class="bg-black/30 p-2 rounded border border-[#523e2b]">
                <span class="text-[#a08060] text-[9px] block">Materi & Nilai:</span>
                <span class="text-[#facc15] font-bold">★ {{ currentDayRecord?.reflection?.ratingMateri }} / 5</span>
              </div>
              <div class="bg-black/30 p-2 rounded border border-[#523e2b]">
                <span class="text-[#a08060] text-[9px] block">Pendampingan Buddy:</span>
                <span class="text-[#facc15] font-bold">★ {{ currentDayRecord?.reflection?.ratingBuddy }} / 5</span>
              </div>
            </div>

            <div class="bg-black/20 p-2 rounded border border-[#4a301a] text-[11px] text-[#e0c090] italic">
              "{{ currentDayRecord?.reflection?.essayInsight }}"
            </div>
          </div>

          <!-- If Reflection Form Available to Fill -->
          <form v-else @submit.prevent="handleSubmitReflection" class="space-y-3 font-mono text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Rating Fasilitas -->
              <div class="bg-[#1c1109] border border-[#523e2b] p-2.5 rounded space-y-1.5">
                <label class="font-pixel text-[9px] text-[#facc15] block">Fasilitas Kampus (1-5)</label>
                <div class="flex items-center gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="ratingFasilitas = star"
                    class="cursor-pointer text-base hover:scale-110 transition-transform"
                  >
                    <PhStar :size="18" :weight="star <= ratingFasilitas ? 'fill' : 'regular'" :class="star <= ratingFasilitas ? 'text-[#facc15]' : 'text-gray-500'" />
                  </button>
                </div>
              </div>

              <!-- Rating Materi -->
              <div class="bg-[#1c1109] border border-[#523e2b] p-2.5 rounded space-y-1.5">
                <label class="font-pixel text-[9px] text-[#facc15] block">Materi & Nilai (1-5)</label>
                <div class="flex items-center gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="ratingMateri = star"
                    class="cursor-pointer text-base hover:scale-110 transition-transform"
                  >
                    <PhStar :size="18" :weight="star <= ratingMateri ? 'fill' : 'regular'" :class="star <= ratingMateri ? 'text-[#facc15]' : 'text-gray-500'" />
                  </button>
                </div>
              </div>

              <!-- Rating Buddy -->
              <div class="bg-[#1c1109] border border-[#523e2b] p-2.5 rounded space-y-1.5">
                <label class="font-pixel text-[9px] text-[#facc15] block">Peran Buddy (1-5)</label>
                <div class="flex items-center gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="ratingBuddy = star"
                    class="cursor-pointer text-base hover:scale-110 transition-transform"
                  >
                    <PhStar :size="18" :weight="star <= ratingBuddy ? 'fill' : 'regular'" :class="star <= ratingBuddy ? 'text-[#facc15]' : 'text-gray-500'" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Kolom Esai Singkat -->
            <div class="space-y-1">
              <label class="text-[11px] text-[#d4b08c] block">
                Apa inspirasi atau pelajaran terbaik yang Anda peroleh sepanjang kegiatan hari ini? *
              </label>
              <textarea
                v-model="essayInsight"
                rows="3"
                required
                placeholder="Tuliskan pengalaman berkesan, pemahaman baru, atau tekad Anda di kampus..."
                class="w-full p-2.5 bg-[#170e07] border border-[#523e2b] rounded text-xs text-[#f0e0c0] placeholder-[#785435] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <button
              type="submit"
              class="w-full py-2.5 px-4 bg-[#b45309] hover:bg-[#d97706] border border-[#f59e0b] rounded font-pixel text-xs text-white font-bold flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all active:scale-98"
            >
              <PhSparkle :size="16" weight="fill" class="text-[#facc15]" />
              <span>SIMPAN REFLEKSI (+25 XP)</span>
            </button>
          </form>
        </div>

        <!-- ================= CARD 3: CHECK-OUT KEPULANGAN SORE ================= -->
        <div
          :class="[
            'border-2 rounded-xl p-4 sm:p-5 shadow space-y-3 transition-all',
            isReflectionSubmitted
              ? 'border-[#523e2b] bg-[#24160c]'
              : 'border-[#3a281c] bg-[#1a1008] opacity-50 pointer-events-none'
          ]"
        >
          <div class="flex items-start justify-between gap-2 border-b border-[#4a301a] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="h-9 w-9 rounded-lg bg-[#0284c7]/20 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8]">
                <PhHouse :size="20" weight="bold" />
              </div>
              <div>
                <h3 class="font-pixel text-xs sm:text-sm text-[#38bdf8] font-bold">
                  3. PRESENSI KEPULANGAN SORE
                </h3>
                <p class="font-sans text-[11px] text-[#c4956a]">
                  Pindai QR Gerbang Kepulangan pukul 16:00 untuk mengunci riwayat harian
                </p>
              </div>
            </div>

            <span
              :class="[
                'font-pixel text-[9px] px-2 py-0.5 rounded border uppercase shrink-0',
                isCheckedOut
                  ? 'bg-[#142612] border-[#22c55e] text-[#86efac]'
                  : 'bg-[#2a1b10] border-[#8b6f4e] text-[#d4b08c]'
              ]"
            >
              {{ isCheckedOut ? 'SELESAI' : 'TERKUNCI' }}
            </span>
          </div>

          <!-- If Already Checked Out -->
          <div v-if="isCheckedOut" class="bg-[#172513]/70 border border-[#22c55e]/60 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1 font-mono text-xs">
              <div class="flex items-center gap-1.5 text-[#86efac] font-bold">
                <PhShieldCheck :size="16" weight="fill" />
                <span>KEPULANGAN HARI {{ selectedDay }} TELAH TERCATAT!</span>
              </div>
              <p class="text-[#bbf7d0]">
                Waktu Check-Out: <strong>{{ formatTime(currentDayRecord?.checkOutAt) }} WIB</strong>
              </p>
              <p class="text-[10px] text-[#86efac]/80">
                Terima kasih atas partisipasi aktif Anda hari ini! Sampai jumpa besok!
              </p>
            </div>

            <div class="px-3 py-1.5 bg-[#22c55e]/20 border border-[#22c55e] rounded font-pixel text-xs text-[#facc15] text-center shrink-0">
              +50 XP PULANG
            </div>
          </div>

          <!-- If NOT Checked Out Yet -->
          <div v-else class="space-y-2.5">
            <p class="font-sans text-xs text-[#d4b08c]">
              Setelah mengisi kuesioner refleksi, lakukan scan QR pada gerbang keluar Hall Utama untuk menyelesaikan presensi harian secara utuh.
            </p>

            <button
              type="button"
              @click="openScannerForCheckOut"
              class="w-full py-3 px-4 bg-gradient-to-r from-[#0369a1] to-[#0c4a6e] hover:from-[#0284c7] hover:to-[#0369a1] border-2 border-[#38bdf8] rounded-lg font-pixel text-xs sm:text-sm text-white font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 transition-all"
            >
              <PhQrCode :size="20" weight="bold" />
              <span>SCAN QR GERBANG KEPULANGAN (+50 XP)</span>
            </button>
          </div>
        </div>

      </div>
    </main>

    <!-- Universal Reusable QR Scanner Modal -->
    <QrScannerModal
      v-model="isScannerOpen"
      :title="scannerMode === 'check-in' ? `SCAN GERBANG MASUK (HARI ${selectedDay})` : `SCAN GERBANG PULANG (HARI ${selectedDay})`"
      :subtitle="scannerMode === 'check-in' ? 'Arahkan kamera ke QR Gerbang Masuk Lantai 1' : 'Arahkan kamera ke QR Gerbang Kepulangan'"
      :preset-tokens="[
        currentExpectedGateToken,
        currentExpectedCheckoutToken,
        'UNU-PRESENSI-H1-GATE-2026',
        'UNU-PRESENSI-H2-GATE-2026',
        'UNU-PRESENSI-H3-GATE-2026',
      ]"
      @scan="handleTokenScanned"
    />
  </div>
</template>
