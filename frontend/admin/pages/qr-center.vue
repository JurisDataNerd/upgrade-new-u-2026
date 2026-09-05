<template>
  <div class="p-4 md:p-6 space-y-5 flex-1 flex flex-col min-h-0 select-none font-mono">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-4 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308] cursor-pointer"
        @click="triggerPrint"
        title="Cetak Lembar QR"
      >
        <Printer class="h-4 w-4" />
        <span class="hidden sm:inline">CETAK QR (A4)</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e] cursor-pointer"
        @click="fetchLocations"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Pusat pencetakan kartu QR Code fisik berbingkai RPG resmi untuk ditempel pada 9 lantai pos kampus, gerbang presensi, dan stand UKM UNU Yogyakarta.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15] flex items-center gap-1">
          <QrCode class="h-3 w-3 text-[#f59e0b]" />
          {{ currentCardCount }} KARTU QR
        </span>
      </div>
    </div>

    <!-- Category Tabs (Screen Only) -->
    <div class="print:hidden flex items-center gap-2 border-b border-[#4a3624]/40 pb-2 text-xs overflow-x-auto">
      <button
        @click="activeCategory = 'gate'"
        :class="[
          'h-8 px-3 rounded font-pixel text-[10px] sm:text-xs flex items-center gap-1.5 border transition-all cursor-pointer',
          activeCategory === 'gate'
            ? 'bg-[#ca8a04] text-black border-[#facc15] font-bold shadow'
            : 'bg-[#271d15] text-gray-300 border-[#523e2b] hover:border-[#f59e0b]'
        ]"
      >
        <CalendarCheck class="h-3.5 w-3.5" />
        <span>GERBANG PRESENSI (H1 - H3)</span>
      </button>

      <button
        @click="activeCategory = 'pos'"
        :class="[
          'h-8 px-3 rounded font-pixel text-[10px] sm:text-xs flex items-center gap-1.5 border transition-all cursor-pointer',
          activeCategory === 'pos'
            ? 'bg-[#ca8a04] text-black border-[#facc15] font-bold shadow'
            : 'bg-[#271d15] text-gray-300 border-[#523e2b] hover:border-[#f59e0b]'
        ]"
      >
        <Building2 class="h-3.5 w-3.5" />
        <span>18 POS KAMPUS (9 LANTAI)</span>
      </button>

      <button
        @click="activeCategory = 'ormawa'"
        :class="[
          'h-8 px-3 rounded font-pixel text-[10px] sm:text-xs flex items-center gap-1.5 border transition-all cursor-pointer',
          activeCategory === 'ormawa'
            ? 'bg-[#ca8a04] text-black border-[#facc15] font-bold shadow'
            : 'bg-[#271d15] text-gray-300 border-[#523e2b] hover:border-[#f59e0b]'
        ]"
      >
        <Store class="h-3.5 w-3.5" />
        <span>STAND ORMAWA EXPO (HARI 3)</span>
      </button>
    </div>

    <!-- Filter & Toolbar for POS (Screen Only) -->
    <div
      v-if="activeCategory === 'pos'"
      class="print:hidden pixel-toolbar-sticky p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div class="flex items-center gap-2 font-mono text-xs">
        <span class="text-muted-foreground">Filter Lantai:</span>
        <select
          v-model.number="selectedFloor"
          class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#f59e0b]"
        >
          <option :value="0">Semua Lantai (1 - 9)</option>
          <option v-for="f in 9" :key="f" :value="f">Lantai {{ f }}</option>
        </select>
      </div>

      <div class="font-mono text-xs text-muted-foreground flex items-center gap-2">
        <span>Menampilkan <strong>{{ filteredLocations.length }}</strong> Kartu Pos Lantai</span>
      </div>
    </div>

    <!-- ================= 1. GERBANG PRESENSI CARDS GRID ================= -->
    <div
      v-if="activeCategory === 'gate'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:m-0"
    >
      <div
        v-for="gate in gateList"
        :key="gate.code"
        :class="[
          'border-4 p-4 rounded shadow-xl text-center space-y-3 print:space-y-2 flex flex-col justify-between print:break-inside-avoid transition-all',
          gate.type === 'MASUK'
            ? 'border-[#16a34a] bg-[#142215] print:bg-white print:border-black'
            : 'border-[#0284c7] bg-[#0f1d28] print:bg-white print:border-black'
        ]"
      >
        <!-- Card Header -->
        <div class="border-b-2 border-current pb-2">
          <div class="flex items-center justify-between">
            <span class="font-pixel text-[10px] font-bold text-[#f59e0b] print:text-black">
              GENIUS UNU 2026
            </span>
            <span
              :class="[
                'border px-2 py-0.5 font-mono text-[9px] font-bold uppercase rounded',
                gate.type === 'MASUK'
                  ? 'border-[#4ade80] bg-[#1a381c] text-[#86efac] print:text-black print:border-black'
                  : 'border-[#38bdf8] bg-[#133044] text-[#7dd3fc] print:text-black print:border-black'
              ]"
            >
              {{ gate.timeLabel }}
            </span>
          </div>

          <h2 class="font-pixel text-xs sm:text-sm text-[#facc15] print:text-black mt-1 uppercase tracking-wider">
            {{ gate.title }}
          </h2>
          <p class="font-mono text-[10px] text-gray-300 print:text-gray-700">
            {{ gate.subtitle }}
          </p>
        </div>

        <!-- QR Code Box -->
        <div class="flex flex-col items-center justify-center p-3 bg-white border-2 border-black rounded shadow-inner">
          <img
            :src="getQrImageUrl(gate.code)"
            :alt="gate.code"
            class="h-44 w-44 object-contain print:h-40 print:w-40"
            loading="lazy"
          />
          <span class="font-mono text-[9px] text-black font-bold mt-1.5 tracking-wider">
            {{ gate.code }}
          </span>
        </div>

        <!-- Instructions for Participants & Panitia -->
        <div class="border-t border-[#523e2b] print:border-black pt-2 text-[10px] font-mono text-muted-foreground print:text-gray-800 space-y-0.5 text-left">
          <p class="font-bold text-[#f59e0b] print:text-black">📱 PETUNJUK PESERTA:</p>
          <p>1. Buka menu <strong>PRESENSI</strong> pada aplikasi smartphone Anda.</p>
          <p>2. Tekan <strong>SCAN QR GERBANG</strong> dan arahkan kamera.</p>
          <p class="text-emerald-400 print:text-black font-bold">Bonus: {{ gate.rewardXp }}</p>
        </div>
      </div>
    </div>

    <!-- ================= 2. 18 POS MINI-GAME CARDS GRID ================= -->
    <div
      v-else-if="activeCategory === 'pos'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:m-0"
    >
      <div
        v-for="pos in filteredLocations"
        :key="pos.code"
        class="border-4 border-[#ca8a04] bg-[#1a140f] print:bg-white print:border-black p-4 rounded shadow-lg text-center space-y-3 print:space-y-2 flex flex-col justify-between print:break-inside-avoid"
      >
        <!-- Card Header -->
        <div class="border-b-2 border-[#ca8a04] print:border-black pb-2">
          <div class="flex items-center justify-between">
            <span class="font-pixel text-[10px] font-bold text-[#f59e0b] print:text-black">
              GENIUS 2026
            </span>
            <span class="border border-[#f59e0b] print:border-black px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#facc15] print:text-black">
              LANTAI {{ pos.floorNumber }}
            </span>
          </div>
          <h2 class="font-pixel text-xs sm:text-sm text-[#facc15] print:text-black mt-1 uppercase tracking-wider">
            {{ pos.name }}
          </h2>
          <p class="font-mono text-[10px] text-muted-foreground print:text-gray-700">
            KODE POS: <strong class="text-foreground print:text-black">{{ pos.code }}</strong>
          </p>
        </div>

        <!-- QR Code Image Box -->
        <div class="flex flex-col items-center justify-center p-3 bg-white border-2 border-[#523e2b] print:border-black rounded">
          <img
            :src="getQrImageUrl(pos.code)"
            :alt="pos.code"
            class="h-44 w-44 object-contain print:h-40 print:w-40"
            loading="lazy"
          />
          <span class="font-mono text-[9px] text-black font-bold mt-1">
            {{ pos.code }}
          </span>
        </div>

        <!-- Instructions for Participants -->
        <div class="border-t border-[#4a3624] print:border-black pt-2 text-[10px] font-mono text-muted-foreground print:text-gray-800 space-y-0.5 text-left">
          <p class="font-bold text-[#f59e0b] print:text-black">📱 PETUNJUK PESERTA:</p>
          <p>1. Buka Player App di smartphone tim Anda.</p>
          <p>2. Tekan menu <strong>SCAN QR POS</strong> dan arahkan kamera.</p>
          <p>3. Mulai mainkan tantangan mini-game bersama Buddy!</p>
        </div>
      </div>
    </div>

    <!-- ================= 3. STAND ORMAWA EXPO CARDS GRID ================= -->
    <div
      v-else-if="activeCategory === 'ormawa'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:m-0"
    >
      <div
        v-for="booth in ormawaList"
        :key="booth.code"
        class="border-4 border-[#9333ea] bg-[#1e1429] print:bg-white print:border-black p-4 rounded shadow-xl text-center space-y-3 print:space-y-2 flex flex-col justify-between print:break-inside-avoid"
      >
        <!-- Card Header -->
        <div class="border-b-2 border-[#9333ea] print:border-black pb-2">
          <div class="flex items-center justify-between">
            <span class="font-pixel text-[10px] font-bold text-[#c084fc] print:text-black">
              ORMAWA EXPO 2026
            </span>
            <span class="border border-[#c084fc] print:border-black px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#facc15] print:text-black">
              {{ booth.boothNumber }}
            </span>
          </div>
          <h2 class="font-pixel text-xs sm:text-sm text-[#facc15] print:text-black mt-1 uppercase tracking-wider">
            {{ booth.name }}
          </h2>
          <p class="font-mono text-[10px] text-[#d8b4fe] print:text-gray-700">
            Kategori: {{ booth.category }} • {{ booth.location }}
          </p>
        </div>

        <!-- QR Code Image Box -->
        <div class="flex flex-col items-center justify-center p-3 bg-white border-2 border-black rounded">
          <img
            :src="getQrImageUrl(booth.code)"
            :alt="booth.code"
            class="h-44 w-44 object-contain print:h-40 print:w-40"
            loading="lazy"
          />
          <span class="font-mono text-[9px] text-black font-bold mt-1">
            {{ booth.code }}
          </span>
        </div>

        <!-- Instructions for Participants -->
        <div class="border-t border-[#6b21a8] print:border-black pt-2 text-[10px] font-mono text-muted-foreground print:text-gray-800 space-y-0.5 text-left">
          <p class="font-bold text-[#c084fc] print:text-black">📱 PETUNJUK MAHASISWA:</p>
          <p>1. Kunjungi stand UKM dan kenali program kegiatannya.</p>
          <p>2. Scan QR stand ini untuk membuka <strong>Lencana Paspor UKM</strong>.</p>
          <p class="text-emerald-400 print:text-black font-bold">Reward: +75 XP (Capping maks 10 stan)</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Printer,
  RotateCw,
  QrCode,
  CalendarCheck,
  Building2,
  Store,
} from "lucide-vue-next";

const activeCategory = ref<"gate" | "pos" | "ormawa">("gate");
const selectedFloor = ref(0);
const loading = ref(false);
const locations = ref<any[]>([]);

// Daftar Kartu Gerbang Presensi Resmi 3 Hari
const gateList = [
  {
    code: "UNU-PRESENSI-H1-GATE-2026",
    title: "PRESENSI MASUK HARI 1",
    subtitle: "Pintu Utama Hall Lantai 1 (Selasa, 22 Sep 2026)",
    type: "MASUK",
    timeLabel: "PAGI: 07:00 - 07:30",
    rewardXp: "+100 XP Presensi Masuk",
  },
  {
    code: "UNU-PRESENSI-H1-CHECKOUT-2026",
    title: "PRESENSI PULANG HARI 1",
    subtitle: "Gerbang Keluar Hall Utama (Selasa, 22 Sep 2026)",
    type: "PULANG",
    timeLabel: "SORE: 16:00 WIB",
    rewardXp: "+50 XP Presensi Pulang",
  },
  {
    code: "UNU-PRESENSI-H2-GATE-2026",
    title: "PRESENSI MASUK HARI 2",
    subtitle: "Pintu Utama Hall Lantai 1 (Rabu, 23 Sep 2026)",
    type: "MASUK",
    timeLabel: "PAGI: 07:00 - 07:30",
    rewardXp: "+100 XP Presensi Masuk",
  },
  {
    code: "UNU-PRESENSI-H2-CHECKOUT-2026",
    title: "PRESENSI PULANG HARI 2",
    subtitle: "Gerbang Keluar Hall Utama (Rabu, 23 Sep 2026)",
    type: "PULANG",
    timeLabel: "SORE: 16:00 WIB",
    rewardXp: "+50 XP Presensi Pulang",
  },
  {
    code: "UNU-PRESENSI-H3-GATE-2026",
    title: "PRESENSI MASUK HARI 3",
    subtitle: "Pintu Utama Hall Lantai 1 (Kamis, 24 Sep 2026)",
    type: "MASUK",
    timeLabel: "PAGI: 07:00 - 07:30",
    rewardXp: "+100 XP Presensi Masuk",
  },
  {
    code: "UNU-PRESENSI-H3-CHECKOUT-2026",
    title: "PRESENSI PULANG HARI 3",
    subtitle: "Gerbang Keluar Hall Utama (Kamis, 24 Sep 2026)",
    type: "PULANG",
    timeLabel: "SORE: 16:00 WIB",
    rewardXp: "+50 XP Presensi Pulang",
  },
];

// Daftar Stand Ormawa Expo Hari ke-3
const ormawaList = [
  {
    code: "UNU-ORMAWA-SILAT-2026",
    name: "Pagar Nusa & Pencak Silat UNU",
    boothNumber: "BOOTH E3-01",
    category: "Olahraga & Beladiri",
    location: "Selasar Lantai 3",
  },
  {
    code: "UNU-ORMAWA-ROBOTIK-2026",
    name: "Komunitas Robotika & AI UNU",
    boothNumber: "BOOTH E3-02",
    category: "Sains & Teknologi",
    location: "Selasar Lantai 3",
  },
  {
    code: "UNU-ORMAWA-PADUS-2026",
    name: "PSM Gita Nusantara UNU",
    boothNumber: "BOOTH E4-01",
    category: "Seni & Paduan Suara",
    location: "Selasar Lantai 4",
  },
  {
    code: "UNU-ORMAWA-TEATER-2026",
    name: "Teater Candradimuka UNU",
    boothNumber: "BOOTH E4-02",
    category: "Seni Pertunjukan & Sastra",
    location: "Selasar Lantai 4",
  },
  {
    code: "UNU-ORMAWA-KSR-2026",
    name: "KSR PMI Unit UNU Yogyakarta",
    boothNumber: "BOOTH E5-01",
    category: "Sosial & Kemanusiaan",
    location: "Selasar Lantai 5",
  },
  {
    code: "UNU-ORMAWA-MAPALA-2026",
    name: "Mahasiswa Pecinta Alam (MAPALA)",
    boothNumber: "BOOTH E5-02",
    category: "Lingkungan & Alam",
    location: "Selasar Lantai 5",
  },
];

// 18 Pos Fisik 9 Lantai
const defaultCampusLocations = [
  { floorNumber: 1, name: "Welcome Hall & Karakter Kampus (Zona Barat)", code: "POS-L1-A" },
  { floorNumber: 1, name: "Student Center & Aspirasi (Zona Timur)", code: "POS-L1-B" },
  { floorNumber: 2, name: "Perpustakaan Digital UNU (Zona Barat)", code: "POS-L2-A" },
  { floorNumber: 2, name: "Smart Classroom & Diskusi (Zona Timur)", code: "POS-L2-B" },
  { floorNumber: 3, name: "Fakultas Teknologi Informasi (Zona Barat)", code: "POS-L3-A" },
  { floorNumber: 3, name: "AI & Software Engineering Lab (Zona Timur)", code: "POS-L3-B" },
  { floorNumber: 4, name: "Fakultas Industri Halal (Zona Barat)", code: "POS-L4-A" },
  { floorNumber: 4, name: "Bioteknologi & Sensor Lab (Zona Timur)", code: "POS-L4-B" },
  { floorNumber: 5, name: "Fakultas Ekonomi Bisnis Digital (Zona Barat)", code: "POS-L5-A" },
  { floorNumber: 5, name: "Inkubator Startup Mahasiswa (Zona Timur)", code: "POS-L5-B" },
  { floorNumber: 6, name: "Fakultas Studi Islam & Budaya (Zona Barat)", code: "POS-L6-A" },
  { floorNumber: 6, name: "Pusat Bahasa & Kaligrafi (Zona Timur)", code: "POS-L6-B" },
  { floorNumber: 7, name: "Fakultas Ilmu Pendidikan (Zona Barat)", code: "POS-L7-A" },
  { floorNumber: 7, name: "Microteaching & Seni Musik (Zona Timur)", code: "POS-L7-B" },
  { floorNumber: 8, name: "Rektorat & Kantor Dekanat (Zona Barat)", code: "POS-L8-A" },
  { floorNumber: 8, name: "Pusat Riset & Inovasi UNU (Zona Timur)", code: "POS-L8-B" },
  { floorNumber: 9, name: "Grand Convention Hall (Zona Barat)", code: "POS-L9-A" },
  { floorNumber: 9, name: "Rooftop Sky Garden & Arena Final (Zona Timur)", code: "POS-L9-B" },
];

onMounted(() => {
  locations.value = defaultCampusLocations;
});

function fetchLocations() {
  loading.value = true;
  setTimeout(() => {
    locations.value = defaultCampusLocations;
    loading.value = false;
  }, 300);
}

const filteredLocations = computed(() => {
  if (selectedFloor.value === 0) return locations.value;
  return locations.value.filter((loc) => loc.floorNumber === selectedFloor.value);
});

const currentCardCount = computed(() => {
  if (activeCategory.value === "gate") return gateList.length;
  if (activeCategory.value === "pos") return filteredLocations.value.length;
  return ormawaList.length;
});

function getQrImageUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(code)}`;
}

function triggerPrint() {
  window.print();
}
</script>

<style scoped>
@media print {
  body {
    background-color: white !important;
    color: black !important;
  }
}
</style>
