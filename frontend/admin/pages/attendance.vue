<template>
  <div class="flex-1 flex flex-col min-h-0 select-none font-mono">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#162518] text-[#4ade80] border-[#16a34a] flex items-center gap-1.5 hover:bg-[#1f3822] cursor-pointer"
        @click="exportAttendanceCsv"
        title="Export Data Presensi"
      >
        <Download class="h-3.5 w-3.5 text-[#4ade80]" />
        <span class="hidden sm:inline">EXPORT REKAP (CSV)</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e] cursor-pointer"
        @click="loadData"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Header -->
    <div class="px-4 md:px-6 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#4a3624]/60 text-xs text-muted-foreground">
      <div>
        <h1 class="font-pixel text-xs sm:text-sm text-[#f59e0b] font-bold uppercase tracking-wider flex items-center gap-2">
          <CalendarCheck class="h-4 w-4 text-[#facc15]" />
          <span>REKAPITULASI PRESENSI & REFLEKSI HARIAN (3 HARI)</span>
        </h1>
        <p class="text-[11px] text-gray-400 mt-0.5">
          Monitoring kehadiran gerbang digital anti-titip absen, kuesioner evaluasi harian, dan verifikasi Buddy.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-2.5 py-1 text-[10px] font-pixel text-[#facc15] flex items-center gap-1.5">
          <Clock class="h-3 w-3 text-[#f59e0b]" />
          GATE AKTIF: HARI {{ selectedDay }}
        </span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
      <!-- 1. Day Selector Tab Bar (Hari 1, 2, 3) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="d in 3"
          :key="d"
          @click="selectedDay = d as (1 | 2 | 3)"
          :class="[
            'pixel-card p-3 text-left transition-all border-2 flex items-center justify-between cursor-pointer',
            selectedDay === d
              ? 'bg-[#2b2014] border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-[#18120c] border-[#4a3624] opacity-80 hover:opacity-100 hover:border-[#8b6f4e]'
          ]"
        >
          <div>
            <div class="font-pixel text-xs font-bold text-[#facc15]">
              HARI KE-{{ d }}
            </div>
            <div class="text-[11px] text-gray-300 font-sans mt-0.5">
              {{ d === 1 ? 'Selasa, 22 Sep (Identity & Niat)' : d === 2 ? 'Rabu, 23 Sep (9-Floor Quest)' : 'Kamis, 24 Sep (Ormawa Expo)' }}
            </div>
          </div>
          <span
            :class="[
              'h-6 px-2 text-[9px] font-pixel font-bold flex items-center justify-center border',
              selectedDay === d ? 'bg-[#ca8a04] text-black border-[#facc15]' : 'bg-black/40 text-gray-400 border-gray-700'
            ]"
          >
            {{ selectedDay === d ? 'AKTIF' : 'PILIH' }}
          </span>
        </button>
      </div>

      <!-- 2. Metrics HUD Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Total Peserta -->
        <div class="pixel-card p-3 border border-[#523e2b] bg-[#1a140f] space-y-1">
          <span class="text-[9px] font-pixel text-gray-400 uppercase">TOTAL PESERTA</span>
          <div class="font-pixel text-lg text-foreground font-bold">
            {{ filteredList.length }}
          </div>
          <span class="text-[10px] text-muted-foreground">Terdaftar di Sistem</span>
        </div>

        <!-- Hadir (On-Time) -->
        <div class="pixel-card p-3 border border-[#16a34a] bg-[#132215] space-y-1">
          <span class="text-[9px] font-pixel text-[#4ade80] uppercase">TEPAT WAKTU (&lt;07:30)</span>
          <div class="font-pixel text-lg text-[#4ade80] font-bold">
            {{ metrics.onTimeCount }}
          </div>
          <span class="text-[10px] text-[#86efac]">Memenuhi Standar</span>
        </div>

        <!-- Terlambat (Late) -->
        <div class="pixel-card p-3 border border-[#ca8a04] bg-[#221a0f] space-y-1">
          <span class="text-[9px] font-pixel text-[#facc15] uppercase">TERLAMBAT (&gt;07:30)</span>
          <div class="font-pixel text-lg text-[#facc15] font-bold">
            {{ metrics.lateCount }}
          </div>
          <span class="text-[10px] text-[#fde047]">Evaluasi Pendamping</span>
        </div>

        <!-- Mengisi Refleksi -->
        <div class="pixel-card p-3 border border-[#0284c7] bg-[#0c1a24] space-y-1">
          <span class="text-[9px] font-pixel text-[#38bdf8] uppercase">ISI REFLEKSI</span>
          <div class="font-pixel text-lg text-[#38bdf8] font-bold">
            {{ metrics.reflectionCount }}
          </div>
          <span class="text-[10px] text-[#7dd3fc]">Evaluasi Harian</span>
        </div>

        <!-- Belum Hadir / Absen -->
        <div class="pixel-card p-3 border border-red-800 bg-[#201010] space-y-1 col-span-2 lg:col-span-1">
          <span class="text-[9px] font-pixel text-red-400 uppercase">BELUM MASUK</span>
          <div class="font-pixel text-lg text-red-400 font-bold">
            {{ metrics.absentCount }}
          </div>
          <span class="text-[10px] text-red-300/80">Follow-up oleh Buddy</span>
        </div>
      </div>

      <!-- 3. Toolbar Filters -->
      <div class="pixel-toolbar-sticky p-3 rounded-lg border border-[#4a3624] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex flex-1 items-center gap-2 max-w-md">
          <div class="relative w-full">
            <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari Nama Mahasiswa atau NIM..."
              class="w-full h-8 pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-xs text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <!-- Filter Kelompok (Sangat penting untuk Buddy!) -->
          <select
            v-model="selectedTeamFilter"
            class="h-8 bg-[#1d1611] border border-[#523e2b] px-2.5 text-foreground focus:outline-none focus:border-[#f59e0b]"
          >
            <option value="">Semua Kelompok</option>
            <option v-for="team in teamOptions" :key="team" :value="team">
              {{ team }}
            </option>
          </select>

          <!-- Filter Status Kehadiran -->
          <select
            v-model="selectedStatusFilter"
            class="h-8 bg-[#1d1611] border border-[#523e2b] px-2.5 text-foreground focus:outline-none focus:border-[#f59e0b]"
          >
            <option value="">Semua Status Hadir</option>
            <option value="ON_TIME">Tepat Waktu (On-Time)</option>
            <option value="LATE">Terlambat (Late)</option>
            <option value="ABSENT">Belum Check-In</option>
          </select>
        </div>
      </div>

      <!-- 4. Interactive Attendance Table -->
      <div class="pixel-card overflow-hidden border border-[#523e2b] bg-[#1a140f] rounded-lg shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-[#140f0b] border-b-2 border-[#523e2b] text-[#f59e0b] font-pixel text-[10px] tracking-wider">
                <th class="p-3">MAHASISWA / NIM</th>
                <th class="p-3">KELOMPOK & BUDDY</th>
                <th class="p-3">CHECK-IN MASUK</th>
                <th class="p-3">STATUS KEHADIRAN</th>
                <th class="p-3">REFLEKSI HARIAN</th>
                <th class="p-3">CHECK-OUT PULANG</th>
                <th class="p-3 text-right">XP PRESENSI</th>
                <th class="p-3 text-center">AKSI BUDDY</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#3a2818] font-mono">
              <tr
                v-for="row in paginatedList"
                :key="row.id"
                class="hover:bg-[#251b13] transition-colors"
              >
                <!-- Nama & NIM -->
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <img
                      :src="row.avatarUrl || '/character-cowok-avatar.png'"
                      alt="Avatar"
                      class="h-8 w-8 rounded-lg border border-[#f59e0b] object-cover bg-black/40 shrink-0"
                    />
                    <div>
                      <div class="font-bold text-foreground font-sans text-xs">{{ row.fullName }}</div>
                      <div class="text-[11px] text-gray-400 mt-0.5">NIM: {{ row.username }}</div>
                    </div>
                  </div>
                  <span class="inline-block border border-[#ca8a04]/40 bg-[#2b2014] px-1.5 py-0.2 text-[8px] font-pixel text-[#facc15] mt-1 ml-10">
                    {{ row.prodi || 'Informatika' }}
                  </span>
                </td>

                <!-- Kelompok -->
                <td class="p-3">
                  <div class="font-bold text-gray-200">{{ row.teamName }}</div>
                  <div class="text-[10px] text-muted-foreground mt-0.5">Buddy: {{ row.buddyName }}</div>
                </td>

                <!-- Check-In -->
                <td class="p-3">
                  <div v-if="row.attendance.checkInAt" class="text-emerald-400 font-bold">
                    {{ formatTime(row.attendance.checkInAt) }} WIB
                  </div>
                  <div v-else class="text-gray-500 italic">Belum Hadir</div>
                </td>

                <!-- Status Kehadiran -->
                <td class="p-3">
                  <span
                    v-if="row.attendance.status === 'ON_TIME'"
                    class="px-2 py-0.5 rounded border border-[#22c55e] bg-[#142612] text-[#86efac] font-pixel text-[9px] inline-flex items-center gap-1"
                  >
                    <CheckCircle2 class="h-3 w-3 text-[#22c55e]" />
                    TEPAT WAKTU
                  </span>
                  <span
                    v-else-if="row.attendance.status === 'LATE'"
                    class="px-2 py-0.5 rounded border border-[#eab308] bg-[#2a220d] text-[#fef08a] font-pixel text-[9px] inline-flex items-center gap-1"
                  >
                    <AlertTriangle class="h-3 w-3 text-[#eab308]" />
                    TERLAMBAT
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded border border-red-800 bg-[#201010] text-red-300 font-pixel text-[9px]"
                  >
                    BELUM MASUK
                  </span>
                </td>

                <!-- Status Refleksi -->
                <td class="p-3">
                  <button
                    v-if="row.attendance.reflection"
                    @click="viewReflectionDetail(row)"
                    class="px-2 py-0.5 rounded border border-[#0284c7] bg-[#0c1a24] text-[#7dd3fc] font-pixel text-[9px] hover:bg-[#0369a1]/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Star class="h-3 w-3 text-[#facc15] fill-[#facc15]" />
                    <span>LIHAT REFLEKSI</span>
                  </button>
                  <span v-else class="text-gray-500 text-[11px] italic">
                    Belum Mengisi
                  </span>
                </td>

                <!-- Check-Out -->
                <td class="p-3">
                  <div v-if="row.attendance.checkOutAt" class="text-[#38bdf8] font-bold">
                    {{ formatTime(row.attendance.checkOutAt) }} WIB
                  </div>
                  <div v-else class="text-gray-500 italic">Belum Pulang</div>
                </td>

                <!-- Total XP Presensi -->
                <td class="p-3 text-right">
                  <span class="font-pixel text-xs text-[#facc15] font-bold">
                    +{{ row.attendance.xpAwarded || 0 }} XP
                  </span>
                </td>

                <!-- Aksi Buddy (Manual Override) -->
                <td class="p-3 text-center">
                  <button
                    v-if="!row.attendance.checkInAt"
                    @click="openManualCheckInModal(row)"
                    class="pixel-btn h-7 px-2 bg-[#271d15] text-[#f59e0b] border border-[#523e2b] hover:border-[#f59e0b] text-[10px] font-pixel rounded cursor-pointer transition-all"
                    title="Tandai Hadir Manual (Jika HP Maba Rusak/Mati)"
                  >
                    TANDAI HADIR
                  </button>
                  <span v-else class="text-[10px] text-emerald-400 font-pixel">
                    TERKUNCI
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal 1: Detail Refleksi Mahasiswa -->
    <div
      v-if="activeReflectionRow"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none font-mono"
    >
      <div class="w-full max-w-lg bg-[#1a140f] border-2 border-[#f59e0b] rounded-xl p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-[#4a3624] pb-2.5">
          <div>
            <h3 class="font-pixel text-xs sm:text-sm text-[#facc15] font-bold">
              HASIL REFLEKSI MAHASISWA
            </h3>
            <p class="text-[11px] text-gray-400 font-sans">
              {{ activeReflectionRow.fullName }} (NIM: {{ activeReflectionRow.username }})
            </p>
          </div>
          <button
            @click="activeReflectionRow = null"
            class="h-7 w-7 rounded bg-[#2d1b0e] border border-[#5a3a18] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2.5 text-xs text-center">
          <div class="p-2.5 bg-black/40 border border-[#523e2b] rounded">
            <span class="text-[9px] text-gray-400 block">Fasilitas Kampus:</span>
            <span class="font-pixel text-sm text-[#facc15]">★ {{ activeReflectionRow.attendance.reflection?.ratingFasilitas }} / 5</span>
          </div>
          <div class="p-2.5 bg-black/40 border border-[#523e2b] rounded">
            <span class="text-[9px] text-gray-400 block">Materi & Nilai:</span>
            <span class="font-pixel text-sm text-[#facc15]">★ {{ activeReflectionRow.attendance.reflection?.ratingMateri }} / 5</span>
          </div>
          <div class="p-2.5 bg-black/40 border border-[#523e2b] rounded">
            <span class="text-[9px] text-gray-400 block">Peran Buddy:</span>
            <span class="font-pixel text-sm text-[#facc15]">★ {{ activeReflectionRow.attendance.reflection?.ratingBuddy }} / 5</span>
          </div>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] font-pixel text-gray-400 uppercase">Esai Refleksi & Pembelajaran:</span>
          <div class="p-3 bg-[#130d08] border border-[#4a301a] rounded text-xs text-[#e0c090] italic font-sans leading-relaxed">
            "{{ activeReflectionRow.attendance.reflection?.essayInsight || 'Tidak ada catatan esai.' }}"
          </div>
        </div>

        <div class="text-right">
          <button
            @click="activeReflectionRow = null"
            class="pixel-btn h-8 px-4 bg-[#ca8a04] text-black font-pixel text-xs font-bold rounded cursor-pointer hover:bg-[#eab308]"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 2: Buddy Manual Check-In Override -->
    <div
      v-if="manualCheckInTarget"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none font-mono"
    >
      <div class="w-full max-w-md bg-[#1a140f] border-2 border-[#16a34a] rounded-xl p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-[#4a3624] pb-2">
          <h3 class="font-pixel text-xs sm:text-sm text-[#4ade80] font-bold">
            TANDAI HADIR MANUAL (BUDDY)
          </h3>
          <button
            @click="manualCheckInTarget = null"
            class="h-7 w-7 rounded bg-[#2d1b0e] border border-[#5a3a18] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="text-xs space-y-2">
          <p class="text-gray-300 font-sans">
            Anda akan menandai kehadiran manual untuk:
          </p>
          <div class="bg-black/40 border border-[#523e2b] p-3 rounded space-y-0.5">
            <div class="font-bold text-[#facc15] font-sans">{{ manualCheckInTarget.fullName }}</div>
            <div class="text-[11px] text-gray-400">NIM: {{ manualCheckInTarget.username }} • {{ manualCheckInTarget.teamName }}</div>
          </div>
        </div>

        <div class="space-y-1 text-xs">
          <label class="text-gray-300 text-[11px] block">Alasan Kehadiran Manual *</label>
          <select
            v-model="manualReason"
            class="w-full h-8 px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#4ade80]"
          >
            <option value="Kamera HP Mahasiswa Rusak">Kamera HP Mahasiswa Rusak</option>
            <option value="Baterai Smartphone Habis">Baterai Smartphone Habis</option>
            <option value="Kendala Jaringan / Kuota Habis">Kendala Jaringan / Kuota Habis</option>
            <option value="Dispensasi Panitia Acara">Dispensasi Panitia Acara</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="manualCheckInTarget = null"
            class="pixel-btn h-8 px-3 border border-[#523e2b] text-gray-400 text-xs font-pixel cursor-pointer"
          >
            BATAL
          </button>
          <button
            @click="confirmManualCheckIn"
            class="pixel-btn h-8 px-4 bg-[#16a34a] hover:bg-[#22c55e] text-black font-pixel text-xs font-bold rounded cursor-pointer"
          >
            KONFIRMASI HADIR (+100 XP)
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  CalendarCheck,
  Clock,
  Search,
  Download,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Star,
  X,
} from "lucide-vue-next";

const selectedDay = ref<1 | 2 | 3>(1);
const searchQuery = ref("");
const selectedTeamFilter = ref("");
const selectedStatusFilter = ref("");
const loading = ref(false);

const activeReflectionRow = ref<any | null>(null);
const manualCheckInTarget = ref<any | null>(null);
const manualReason = ref("Kamera HP Mahasiswa Rusak");

interface ParticipantAttendanceRow {
  id: string;
  fullName: string;
  username: string; // NIM
  prodi: string; // Jurusan UNU Resmi
  avatarUrl?: string;
  teamName: string;
  buddyName: string;
  attendance: {
    checkInAt: string | null;
    status: "ON_TIME" | "LATE" | "ABSENT";
    checkOutAt: string | null;
    xpAwarded: number;
    reflection?: {
      ratingFasilitas: number;
      ratingMateri: number;
      ratingBuddy: number;
      essayInsight: string;
    } | null;
  };
}

// Data Mahasiswa Demo Terstruktur
const participantsList = ref<ParticipantAttendanceRow[]>([
  {
    id: "p1",
    fullName: "Ahmad Dahlan",
    username: "2611101",
    prodi: "Informatika",
    avatarUrl: "/character-cowok-avatar.png",
    teamName: "Genius 01",
    buddyName: "Agnes Anggraini Risdiyanto",
    attendance: {
      checkInAt: "2026-09-22T07:18:00Z",
      status: "ON_TIME",
      checkOutAt: "2026-09-22T16:05:00Z",
      xpAwarded: 175,
      reflection: {
        ratingFasilitas: 5,
        ratingMateri: 5,
        ratingBuddy: 5,
        essayInsight: "Sangat kagum dengan fasilitas Lab AI Lantai 3 dan keramahan seluruh panitia.",
      },
    },
  },
  {
    id: "p2",
    fullName: "Fatimah Azzahra",
    username: "2611102",
    prodi: "Farmasi",
    avatarUrl: "/character-cewek-avatar.png",
    teamName: "Genius 01",
    buddyName: "Agnes Anggraini Risdiyanto",
    attendance: {
      checkInAt: "2026-09-22T07:25:00Z",
      status: "ON_TIME",
      checkOutAt: "2026-09-22T16:10:00Z",
      xpAwarded: 175,
      reflection: {
        ratingFasilitas: 5,
        ratingMateri: 4,
        ratingBuddy: 5,
        essayInsight: "Materi Aswaja sangat mencerahkan dan membakar semangat belajar di UNU.",
      },
    },
  },
  {
    id: "p3",
    fullName: "Rian Pratama",
    username: "2611103",
    prodi: "Teknik Elektro",
    avatarUrl: "/character-cowok-avatar.png",
    teamName: "Genius 01",
    buddyName: "Agnes Anggraini Risdiyanto",
    attendance: {
      checkInAt: "2026-09-22T07:38:00Z",
      status: "LATE",
      checkOutAt: null,
      xpAwarded: 100,
      reflection: null,
    },
  },
  {
    id: "p4",
    fullName: "Siti Nurhaliza",
    username: "2611104",
    prodi: "Manajemen",
    avatarUrl: "/character-cewek-avatar.png",
    teamName: "Genius 02",
    buddyName: "Agnesya Putri Triyana",
    attendance: {
      checkInAt: "2026-09-22T07:12:00Z",
      status: "ON_TIME",
      checkOutAt: "2026-09-22T16:02:00Z",
      xpAwarded: 175,
      reflection: {
        ratingFasilitas: 5,
        ratingMateri: 5,
        ratingBuddy: 5,
        essayInsight: "Buddy mendampingi dengan sangat sabar saat kami menjelajahi selasar kampus.",
      },
    },
  },
  {
    id: "p5",
    fullName: "Kevin Wijaya",
    username: "2611105",
    prodi: "PGSD",
    avatarUrl: "/character-cowok-avatar.png",
    teamName: "Genius 02",
    buddyName: "Agnesya Putri Triyana",
    attendance: {
      checkInAt: null,
      status: "ABSENT",
      checkOutAt: null,
      xpAwarded: 0,
      reflection: null,
    },
  },
  {
    id: "p6",
    fullName: "Zulfa Maulida",
    username: "2611106",
    prodi: "Akuntansi",
    avatarUrl: "/character-cewek-avatar.png",
    teamName: "Genius 03",
    buddyName: "Ahmad Fadlil Munajad",
    attendance: {
      checkInAt: "2026-09-22T07:22:00Z",
      status: "ON_TIME",
      checkOutAt: "2026-09-22T16:15:00Z",
      xpAwarded: 175,
      reflection: {
        ratingFasilitas: 4,
        ratingMateri: 5,
        ratingBuddy: 5,
        essayInsight: "Sangat senang bisa mengenal teman-teman baru dari berbagai provinsi.",
      },
    },
  },
]);

const teamOptions = computed(() => {
  const set = new Set(participantsList.value.map((p) => p.teamName));
  return Array.from(set);
});

// Sinkronisasi dengan localStorage jika mahasiswa baru check-in di browser yang sama
const loadData = () => {
  loading.value = true;
  if (typeof window !== "undefined") {
    try {
      const userRaw = localStorage.getItem("genius_unu_user_storage_v1");
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        if (parsed.attendance && parsed.attendance[selectedDay.value]) {
          const userAtt = parsed.attendance[selectedDay.value];
          // Jika mahasiswa lokal melakukan check-in, sinkronkan ke baris pertama!
          if (userAtt.checkInAt && participantsList.value.length > 0) {
            participantsList.value[0].attendance = {
              checkInAt: userAtt.checkInAt,
              status: userAtt.checkInStatus || "ON_TIME",
              checkOutAt: userAtt.checkOutAt,
              xpAwarded: userAtt.xpAwarded || 100,
              reflection: userAtt.reflection,
            };
          }
        }
      }
    } catch {
      // Ignore
    }
  }
  setTimeout(() => {
    loading.value = false;
  }, 400);
};

const filteredList = computed(() => {
  return participantsList.value.filter((p) => {
    const matchesSearch =
      !searchQuery.value.trim() ||
      p.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesTeam = !selectedTeamFilter.value || p.teamName === selectedTeamFilter.value;
    const matchesStatus = !selectedStatusFilter.value || p.attendance.status === selectedStatusFilter.value;

    return matchesSearch && matchesTeam && matchesStatus;
  });
});

const paginatedList = computed(() => filteredList.value);

const metrics = computed(() => {
  const list = participantsList.value;
  return {
    totalCount: list.length,
    onTimeCount: list.filter((p) => p.attendance.status === "ON_TIME").length,
    lateCount: list.filter((p) => p.attendance.status === "LATE").length,
    reflectionCount: list.filter((p) => Boolean(p.attendance.reflection)).length,
    absentCount: list.filter((p) => !p.attendance.checkInAt).length,
  };
});

const viewReflectionDetail = (row: ParticipantAttendanceRow) => {
  activeReflectionRow.value = row;
};

const openManualCheckInModal = (row: ParticipantAttendanceRow) => {
  manualCheckInTarget.value = row;
};

const confirmManualCheckIn = () => {
  if (!manualCheckInTarget.value) return;
  const now = new Date();
  manualCheckInTarget.value.attendance.checkInAt = now.toISOString();
  manualCheckInTarget.value.attendance.status = "ON_TIME";
  manualCheckInTarget.value.attendance.xpAwarded = 100;
  manualCheckInTarget.value = null;
};

const formatTime = (isoString?: string | null) => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoString;
  }
};

const exportAttendanceCsv = () => {
  const rows = [
    ["NIM", "Nama Lengkap", "Kelompok", "Buddy", "Hari", "Jam Masuk", "Status Masuk", "Jam Pulang", "Total XP Presensi"],
    ...filteredList.value.map((p) => [
      p.username,
      p.fullName,
      p.teamName,
      p.buddyName,
      `Hari ${selectedDay.value}`,
      formatTime(p.attendance.checkInAt),
      p.attendance.status || "ABSENT",
      formatTime(p.attendance.checkOutAt),
      p.attendance.xpAwarded.toString(),
    ]),
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Rekap_Presensi_PKKMB_UNU_Hari_${selectedDay.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  loadData();
});
</script>
