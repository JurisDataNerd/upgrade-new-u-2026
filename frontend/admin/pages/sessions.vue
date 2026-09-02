<template>
  <div class="p-4 md:p-6 space-y-5 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <!-- Auto refresh indicator -->
      <div class="border border-[#523e2b] bg-[#1d1611] px-2.5 py-1 text-[11px] font-mono flex items-center gap-2">
        <span :class="['h-2 w-2 rounded-full', autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-muted']" />
        <span class="text-muted-foreground hidden sm:inline">Auto-Sync (3s):</span>
        <button
          @click="autoRefresh = !autoRefresh"
          class="text-[10px] font-bold underline font-pixel text-[#facc15]"
        >
          {{ autoRefresh ? 'ON' : 'OFF' }}
        </button>
      </div>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="() => fetchSessions()"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Pantau sesi arena mini game yang sedang aktif di seluruh 9 lantai kampus UNU Yogyakarta secara realtime.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-emerald-500/50 bg-emerald-950/60 px-2 py-0.5 text-[9px] font-pixel text-emerald-300 flex items-center gap-1">
          <Radio class="h-3 w-3 text-emerald-400 animate-pulse" />
          MATCH MONITOR
        </span>
      </div>
    </div>

    <!-- Status Overview Counters -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
      <div
        @click="statusFilter = ''"
        :class="[
          'pixel-card p-3 cursor-pointer transition-all',
          statusFilter === '' ? 'border-[#f59e0b] bg-[#2b2014]' : 'hover:border-[#523e2b]'
        ]"
      >
        <p class="text-[10px] text-muted-foreground uppercase">Semua Sesi</p>
        <p class="font-pixel text-sm font-bold text-foreground">{{ sessions.length }}</p>
      </div>

      <div
        @click="statusFilter = 'ACTIVE'"
        :class="[
          'pixel-card p-3 cursor-pointer transition-all',
          statusFilter === 'ACTIVE' ? 'border-emerald-500 bg-emerald-950/30' : 'hover:border-[#523e2b]'
        ]"
      >
        <p class="text-[10px] text-emerald-400 uppercase flex items-center gap-1">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          Sedang Main (Active)
        </p>
        <p class="font-pixel text-sm font-bold text-emerald-300">
          {{ sessions.filter(s => s.status === 'ACTIVE').length }}
        </p>
      </div>

      <div
        @click="statusFilter = 'READY'"
        :class="[
          'pixel-card p-3 cursor-pointer transition-all',
          statusFilter === 'READY' ? 'border-cyan-500 bg-cyan-950/30' : 'hover:border-[#523e2b]'
        ]"
      >
        <p class="text-[10px] text-cyan-400 uppercase">Siap Mulai (Ready)</p>
        <p class="font-pixel text-sm font-bold text-cyan-300">
          {{ sessions.filter(s => s.status === 'READY').length }}
        </p>
      </div>

      <div
        @click="statusFilter = 'PAUSED'"
        :class="[
          'pixel-card p-3 cursor-pointer transition-all',
          statusFilter === 'PAUSED' ? 'border-yellow-500 bg-yellow-950/30' : 'hover:border-[#523e2b]'
        ]"
      >
        <p class="text-[10px] text-yellow-400 uppercase">Jeda (Paused)</p>
        <p class="font-pixel text-sm font-bold text-yellow-300">
          {{ sessions.filter(s => s.status === 'PAUSED').length }}
        </p>
      </div>

      <div
        @click="statusFilter = 'COMPLETED'"
        :class="[
          'pixel-card p-3 cursor-pointer transition-all',
          statusFilter === 'COMPLETED' ? 'border-purple-500 bg-purple-950/30' : 'hover:border-[#523e2b]'
        ]"
      >
        <p class="text-[10px] text-purple-400 uppercase">Selesai (Completed)</p>
        <p class="font-pixel text-sm font-bold text-purple-300">
          {{ sessions.filter(s => s.status === 'COMPLETED').length }}
        </p>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="pixel-toolbar-sticky p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
        <input
          v-model="searchQuery"
          placeholder="Cari nama tim, pos ruangan, atau game..."
          class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
        />
      </div>

      <div class="flex items-center gap-2 font-mono text-xs">
        <select
          v-model="statusFilter"
          class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#f59e0b]"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">ACTIVE (Sedang Berlangsung)</option>
          <option value="READY">READY (Menunggu Start)</option>
          <option value="PAUSED">PAUSED (Dijeda)</option>
          <option value="COMPLETED">COMPLETED (Selesai)</option>
          <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          <option value="EXPIRED">EXPIRED (Waktu Habis)</option>
        </select>

        <select
          v-model="gameFilter"
          class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#f59e0b]"
        >
          <option value="">Semua Mini Game</option>
          <option value="QUIZ">Team Quiz (001)</option>
          <option value="REACTION">Speed Reaction (002)</option>
          <option value="MEMORY">Memory Match (003)</option>
          <option value="LOGIC">Puzzle / Logic</option>
        </select>
      </div>
    </div>

    <!-- Sessions Grid / Table -->
    <div v-if="loading && sessions.length === 0" class="py-16 text-center space-y-2">
      <RotateCw class="h-8 w-8 text-[#f59e0b] animate-spin mx-auto" />
      <p class="font-mono text-xs text-muted-foreground">Memindai sesi game aktif...</p>
    </div>

    <div v-else-if="filteredSessions.length === 0" class="pixel-card p-12 text-center text-muted-foreground space-y-2">
      <Gamepad2 class="h-10 w-10 text-[#523e2b] mx-auto" />
      <p class="font-mono text-xs text-foreground font-bold">Tidak Ada Sesi Game Ditemukan</p>
      <p class="font-mono text-[11px]">Sesi permainan akan muncul saat tim melakukan scan QR di pos lokasi.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="s in filteredSessions"
        :key="s.id"
        :class="[
          'pixel-card p-4 space-y-3 transition-all flex flex-col justify-between',
          s.status === 'ACTIVE' ? 'border-emerald-600/70 bg-[#161f18]' : 'hover:border-[#f59e0b]'
        ]"
      >
        <div class="space-y-2.5 font-mono">
          <!-- Card Header: Location & Status -->
          <div class="flex items-start justify-between gap-2 border-b border-[#3a291c] pb-2">
            <div>
              <div class="flex items-center gap-1.5">
                <MapPin class="h-3.5 w-3.5 text-[#f59e0b]" />
                <span class="text-xs font-bold text-foreground truncate">{{ s.locationName || 'Pos Belum Terpeta' }}</span>
              </div>
              <span class="text-[10px] text-muted-foreground font-mono">
                Kode: {{ s.locationCode || 'POS' }}
              </span>
            </div>

            <!-- Status Indicator -->
            <span
              :class="[
                'text-[8px] font-pixel px-2 py-0.5 border flex items-center gap-1',
                s.status === 'ACTIVE' ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300' :
                s.status === 'READY' ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300' :
                s.status === 'PAUSED' ? 'border-yellow-500 bg-yellow-950/80 text-yellow-300' :
                s.status === 'COMPLETED' ? 'border-purple-500 bg-purple-950/80 text-purple-300' :
                'border-red-500 bg-red-950/80 text-red-300'
              ]"
            >
              <span v-if="s.status === 'ACTIVE'" class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              {{ s.status }}
            </span>
          </div>

          <!-- Team & Game Info -->
          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-[11px]">Tim Petualang:</span>
              <span class="font-bold text-[#facc15] truncate">{{ s.teamName || 'Tim #' + s.teamId?.slice(0, 6) }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-[11px]">Mini Game:</span>
              <span class="font-bold text-foreground">{{ s.gameName }} ({{ s.gameType }})</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-[11px]">Buddy Pendamping:</span>
              <span class="text-foreground">{{ s.buddyName || '-' }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-[11px]">Total Skor Sesi:</span>
              <span class="font-pixel text-xs text-emerald-400 font-bold">+{{ s.totalScore || 0 }} pts</span>
            </div>
          </div>

          <!-- Time Info -->
          <div class="border border-[#4a3624] bg-[#16110d] p-2 text-[10px] text-muted-foreground flex items-center justify-between">
            <div class="flex items-center gap-1">
              <Clock class="h-3 w-3 text-[#f59e0b]" />
              <span>Batas: {{ s.timeLimit || 300 }}s</span>
            </div>
            <span>Dibuat: {{ formatTime(s.createdAt) }}</span>
          </div>
        </div>

        <!-- Intervention Controls (Game Master Actions) -->
        <div class="border-t border-[#3a291c] pt-2.5 flex items-center justify-between gap-1.5 font-mono text-[10px]">
          <!-- Active Controls -->
          <template v-if="s.status === 'ACTIVE'">
            <button
              @click="pauseSession(s.id)"
              class="pixel-btn h-7 px-2 bg-yellow-600 text-[#16110d] border-yellow-400 font-bold flex items-center gap-1 hover:bg-yellow-500"
            >
              <Pause class="h-3 w-3" />
              <span>Jeda</span>
            </button>
            <button
              @click="forceCompleteSession(s.id)"
              class="pixel-btn h-7 px-2 bg-emerald-600 text-white border-emerald-400 font-bold flex items-center gap-1 hover:bg-emerald-500"
            >
              <CheckCircle2 class="h-3 w-3" />
              <span>Force Finish</span>
            </button>
          </template>

          <!-- Paused Controls -->
          <template v-else-if="s.status === 'PAUSED'">
            <button
              @click="startSession(s.id)"
              class="pixel-btn h-7 px-2 bg-emerald-600 text-white border-emerald-400 font-bold flex items-center gap-1 hover:bg-emerald-500"
            >
              <Play class="h-3 w-3" />
              <span>Lanjut</span>
            </button>
          </template>

          <!-- Ready Controls -->
          <template v-else-if="s.status === 'READY'">
            <button
              @click="startSession(s.id)"
              class="pixel-btn h-7 px-2 bg-cyan-600 text-white border-cyan-400 font-bold flex items-center gap-1 hover:bg-cyan-500"
            >
              <Play class="h-3 w-3" />
              <span>Mulai</span>
            </button>
          </template>

          <!-- Cancel / Reset Button (Free Location) -->
          <button
            v-if="['READY', 'ACTIVE', 'PAUSED'].includes(s.status)"
            @click="cancelSession(s.id)"
            class="pixel-btn h-7 px-2 bg-red-950 text-red-300 border-red-800 font-bold flex items-center gap-1 hover:bg-red-900 ml-auto"
            title="Batalkan Sesi & Bebaskan Pos Ruangan"
          >
            <XCircle class="h-3 w-3" />
            <span>Reset Pos</span>
          </button>
          <span v-else class="text-[10px] text-muted-foreground ml-auto">
            Sesi Arsip
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Radio,
  Gamepad2,
  RotateCw,
  Search,
  MapPin,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
} from "lucide-vue-next";
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const autoRefresh = ref(true);
const searchQuery = ref("");
const statusFilter = ref("");
const gameFilter = ref("");

const sessions = ref<any[]>([]);
let refreshTimer: any = null;

onMounted(async () => {
  await fetchSessions();
  // Auto refresh interval every 3 seconds for active matches
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      fetchSessions(true);
    }
  }, 3000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

async function fetchSessions(silent = false) {
  if (!silent) loading.value = true;
  try {
    const res = await api.get("/game-sessions?limit=60");
    if (res?.success && Array.isArray(res.data)) {
      sessions.value = res.data;
    }
  } catch (err) {
    if (!silent) console.error("Failed to load sessions:", err);
  } finally {
    if (!silent) loading.value = false;
  }
}

const filteredSessions = computed(() => {
  return sessions.value.filter((s) => {
    const q = searchQuery.value.toLowerCase();
    const matchSearch =
      !q ||
      s.teamName?.toLowerCase().includes(q) ||
      s.locationName?.toLowerCase().includes(q) ||
      s.gameName?.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (statusFilter.value && s.status !== statusFilter.value) return false;
    if (gameFilter.value && s.gameType !== gameFilter.value) return false;

    return true;
  });
});

function formatTime(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

async function startSession(id: string) {
  try {
    const res = await api.post(`/game-sessions/${id}/start`);
    if (res?.success) await fetchSessions(true);
  } catch (err: any) {
    alert("Gagal memulai sesi: " + err.message);
  }
}

async function pauseSession(id: string) {
  try {
    const res = await api.post(`/game-sessions/${id}/pause`);
    if (res?.success) await fetchSessions(true);
  } catch (err: any) {
    alert("Gagal menjeda sesi: " + err.message);
  }
}

async function forceCompleteSession(id: string) {
  if (!confirm("Selesaikan sesi secara paksa dan hitung skor otomatis?")) return;
  try {
    const res = await api.post(`/game-sessions/${id}/complete`, {
      submissions: [],
    });
    if (res?.success) {
      alert("Sesi berhasil diselesaikan dan skor tercatat ke Ledger!");
      await fetchSessions(true);
    }
  } catch (err: any) {
    alert("Gagal menyelesaikan sesi: " + err.message);
  }
}

async function cancelSession(id: string) {
  if (!confirm("Batalkan sesi ini dan bebaskan status lokasi menjadi AVAILABLE?")) return;
  try {
    const res = await api.post(`/game-sessions/${id}/cancel`);
    if (res?.success) {
      alert("Sesi dibatalkan dan pos ruangan telah dibebaskan.");
      await fetchSessions(true);
    }
  } catch (err: any) {
    alert("Gagal membatalkan sesi: " + err.message);
  }
}
</script>
