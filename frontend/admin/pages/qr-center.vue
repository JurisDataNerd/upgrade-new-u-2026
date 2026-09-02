<template>
  <div class="p-4 md:p-6 space-y-5 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-4 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="triggerPrint"
        title="Cetak Lembar QR"
      >
        <Printer class="h-4 w-4" />
        <span class="hidden sm:inline">CETAK QR (A4)</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchLocations"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Pusat pencetakan dan ekspor kartu QR Code fisik berbingkai RPG untuk ditempel pada 9 lantai pos kampus UNU Yogyakarta.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15] flex items-center gap-1">
          <QrCode class="h-3 w-3 text-[#f59e0b]" />
          {{ filteredLocations.length }} POS QR
        </span>
      </div>
    </div>

    <!-- Filter & Toolbar (Screen Only) -->
    <div class="print:hidden pixel-toolbar-sticky p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
        <span>Menampilkan <strong>{{ filteredLocations.length }}</strong> Kartu QR Pos</span>
      </div>
    </div>

    <!-- Printable & Screen QR Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:m-0">
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
        <div class="border-t border-[#4a3624] print:border-black pt-2 text-[10px] font-mono text-muted-foreground print:text-gray-800 space-y-0.5">
          <p class="font-bold text-[#f59e0b] print:text-black">📱 PETUNJUK PESERTA:</p>
          <p>1. Buka Player App di smartphone tim Anda.</p>
          <p>2. Tekan menu <strong>SCAN QR POS</strong> dan arahkan kamera.</p>
          <p>3. Mulai mainkan tantangan bersama Buddy!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { QrCode, Printer, RotateCw } from "lucide-vue-next";
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const selectedFloor = ref(0);
const locations = ref<any[]>([]);

// Fallback campus master locations for UNU Yogyakarta 9 floors if DB not yet loaded
const defaultCampusLocations = [
  { floorNumber: 1, name: "Lobby Utama & Student Center (Zona Barat)", code: "POS-L1-A" },
  { floorNumber: 1, name: "Auditorium & Ruang Transit (Zona Timur)", code: "POS-L1-B" },
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

onMounted(async () => {
  await fetchLocations();
});

async function fetchLocations() {
  loading.value = true;
  try {
    const res = await api.get("/floors");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      const allLocs: any[] = [];
      res.data.forEach((floor: any) => {
        if (Array.isArray(floor.locations)) {
          floor.locations.forEach((loc: any) => {
            allLocs.push({
              floorNumber: floor.floorNumber,
              name: loc.name,
              code: loc.code,
            });
          });
        }
      });
      if (allLocs.length > 0) {
        locations.value = allLocs;
        return;
      }
    }
  } catch (err) {
    console.warn("Using default campus locations:", err);
  } finally {
    if (locations.value.length === 0) {
      locations.value = defaultCampusLocations;
    }
    loading.value = false;
  }
}

const filteredLocations = computed(() => {
  if (selectedFloor.value === 0) return locations.value;
  return locations.value.filter((loc) => loc.floorNumber === selectedFloor.value);
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
  .pixel-card {
    border-color: black !important;
    background: white !important;
    color: black !important;
  }
}
</style>
