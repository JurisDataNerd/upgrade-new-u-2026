<template>
  <div class="min-h-screen bg-[#0d0906] text-white flex flex-col justify-between overflow-hidden select-none font-mono relative">
    <!-- Ambient Stage Lighting Effects -->
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-500/20 via-yellow-600/10 to-transparent blur-3xl"></div>
      <div class="absolute bottom-0 left-10 w-96 h-96 bg-amber-600/10 blur-[140px]"></div>
      <div class="absolute bottom-0 right-10 w-96 h-96 bg-emerald-600/10 blur-[140px]"></div>
    </div>

    <!-- Top Floating Stage Controls (Can be hidden for clean projector screen) -->
    <header class="relative z-30 px-6 py-3 border-b border-[#3d2c1e] bg-[#140e08]/90 backdrop-blur flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-[#f59e0b]/20 border border-[#f59e0b] flex items-center justify-center font-pixel text-[#facc15] text-xs">
          UNU
        </div>
        <div>
          <h1 class="font-pixel text-xs sm:text-sm text-[#f0d060] font-bold tracking-wider">
            GENIUS 2026 &bull; LAYAR PANGGUNG UTAMA
          </h1>
          <span class="text-[10px] text-gray-400">
            Panggung Penutupan &amp; Awarding &bull; Jam: <strong class="text-white">{{ currentTime }}</strong>
          </span>
        </div>
      </div>

      <!-- Stage Mode Switcher -->
      <div class="flex items-center gap-1.5 bg-[#1f150d] p-1 rounded-lg border border-[#3d2c1e]">
        <button
          type="button"
          @click="activeMode = 'podium'"
          :class="[
            'px-2.5 py-1 text-[10px] font-pixel rounded transition-all cursor-pointer flex items-center gap-1.5',
            activeMode === 'podium'
              ? 'bg-[#ca8a04] text-[#16110d] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          ]"
        >
          <Trophy class="h-3 w-3" />
          <span>PODIUM JUARA</span>
        </button>

        <button
          type="button"
          @click="activeMode = 'all-teams'"
          :class="[
            'px-2.5 py-1 text-[10px] font-pixel rounded transition-all cursor-pointer flex items-center gap-1.5',
            activeMode === 'all-teams'
              ? 'bg-[#ca8a04] text-[#16110d] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          ]"
        >
          <Users class="h-3 w-3" />
          <span>KLASEMEN REGU</span>
        </button>

        <button
          type="button"
          @click="activeMode = 'reveal'"
          :class="[
            'px-2.5 py-1 text-[10px] font-pixel rounded transition-all cursor-pointer flex items-center gap-1.5',
            activeMode === 'reveal'
              ? 'bg-[#9333ea] text-white font-bold shadow'
              : 'text-gray-400 hover:text-white'
          ]"
        >
          <Sparkles class="h-3 w-3" />
          <span>REVEAL DRAMATIS</span>
        </button>
      </div>

      <!-- Actions: Freeze Indicator & Fullscreen -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="toggleFreeze"
          :class="[
            'px-2.5 py-1 text-[10px] font-pixel rounded border flex items-center gap-1.5 cursor-pointer transition-all',
            isFrozen
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-pulse'
              : 'bg-[#1e150e] border-[#523e2b] text-gray-300 hover:border-amber-500'
          ]"
        >
          <Snowflake class="h-3.5 w-3.5 text-cyan-400" />
          <span>{{ isFrozen ? 'FREEZE AKTIF' : 'KLASEMEN LIVE' }}</span>
        </button>

        <button
          type="button"
          @click="toggleFullScreen"
          class="p-1.5 rounded bg-[#1e150e] border border-[#523e2b] text-gray-300 hover:text-white hover:border-[#f59e0b] cursor-pointer"
          title="Layar Penuh (F11)"
        >
          <Maximize2 class="h-3.5 w-3.5" />
        </button>

        <NuxtLink
          to="/leaderboard"
          class="px-2.5 py-1 text-[10px] font-pixel rounded bg-[#2a1d13] border border-[#523e2b] text-gray-300 hover:text-[#facc15]"
        >
          KEMBALI
        </NuxtLink>
      </div>
    </header>

    <!-- Main Stage Canvas Area -->
    <main class="relative z-10 flex-1 p-6 flex flex-col justify-center max-w-6xl mx-auto w-full">
      <!-- MODE 1: PODIUM JUARA (DEFAULT SHOWCASE) -->
      <div v-if="activeMode === 'podium'" class="space-y-8 animate-fade-in">
        <!-- Stage Title -->
        <div class="text-center space-y-1.5">
          <span class="inline-block px-3 py-0.5 rounded-full border border-[#f59e0b]/50 bg-[#2b1c11] text-[10px] font-pixel text-[#facc15] tracking-widest uppercase">
            HALL OF FAME &bull; GRAND CHAMPIONS
          </span>
          <h2 class="font-pixel text-xl sm:text-3xl text-[#fef08a] font-bold tracking-wider drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)]">
            REKAPITULASI JUARA UMUM GENIUS 2026
          </h2>
          <p class="text-xs text-gray-300 font-sans max-w-lg mx-auto">
            Berdasarkan akumulasi skor ekspedisi 9 lantai, 18 pos mini-games, evaluasi 3 pilar FGD Aswaja, &amp; stan ormawa expo.
          </p>
        </div>

        <!-- 3-Podium Display (Physical Pixel Pedestals) -->
        <div class="grid grid-cols-3 gap-4 sm:gap-6 items-end max-w-4xl mx-auto pt-4">
          <!-- Rank 2: Silver Pedestal -->
          <div class="flex flex-col items-center text-center space-y-3 order-1">
            <div class="relative">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-[#475569] to-[#1e293b] border-2 border-[#94a3b8] flex flex-col items-center justify-center shadow-lg">
                <Medal class="h-8 w-8 text-gray-200" />
                <span class="font-pixel text-[9px] text-gray-200 font-bold mt-0.5">#2 PERAK</span>
              </div>
            </div>

            <div class="space-y-1">
              <h3 class="font-sans text-sm sm:text-base font-bold text-white line-clamp-1">
                {{ podiumData[1].name }}
              </h3>
              <span class="text-[10px] text-gray-400 block">Buddy: {{ podiumData[1].buddy }}</span>
              <div class="font-pixel text-sm sm:text-base text-[#e2e8f0] font-bold">
                {{ podiumData[1].score.toLocaleString() }} PTS
              </div>
            </div>

            <!-- Pedestal Block 2 (Height 120px) -->
            <div class="w-full h-28 sm:h-36 bg-gradient-to-t from-[#111827] to-[#1e293b] border-2 border-t-4 border-[#94a3b8] rounded-t-xl flex flex-col items-center justify-center p-2 shadow-xl">
              <span class="font-pixel text-2xl sm:text-4xl text-gray-300 font-bold opacity-60">2</span>
              <span class="text-[9px] text-gray-400 font-mono mt-1">17 Pos Selesai</span>
            </div>
          </div>

          <!-- Rank 1: Gold Pedestal (Center, Elevated) -->
          <div class="flex flex-col items-center text-center space-y-3 order-2 -translate-y-4">
            <div class="relative">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-[#ca8a04] to-[#713f12] border-3 border-[#facc15] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)] animate-bounce">
                <Crown class="h-10 w-10 text-[#facc15]" />
                <span class="font-pixel text-[10px] text-[#fef08a] font-bold mt-0.5">#1 EMAS</span>
              </div>
            </div>

            <div class="space-y-1">
              <div class="inline-block px-2 py-0.5 rounded bg-[#3b2714] border border-[#f59e0b] text-[8px] font-pixel text-[#facc15]">
                JUARA UMUM ANGKATAN 2026
              </div>
              <h3 class="font-sans text-base sm:text-lg font-bold text-[#fef08a]">
                {{ podiumData[0].name }}
              </h3>
              <span class="text-[11px] text-amber-200/90 block">Buddy: {{ podiumData[0].buddy }}</span>
              <div class="font-pixel text-lg sm:text-2xl text-[#86efac] font-bold">
                {{ podiumData[0].score.toLocaleString() }} PTS
              </div>
            </div>

            <!-- Pedestal Block 1 (Height 170px) -->
            <div class="w-full h-40 sm:h-52 bg-gradient-to-t from-[#20140a] to-[#452712] border-2 border-t-4 border-[#facc15] rounded-t-xl flex flex-col items-center justify-center p-2 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <span class="font-pixel text-4xl sm:text-6xl text-[#facc15] font-bold">1</span>
              <span class="text-[10px] text-[#86efac] font-mono mt-1 font-bold">18/18 Pos Sempurna</span>
            </div>
          </div>

          <!-- Rank 3: Bronze Pedestal -->
          <div class="flex flex-col items-center text-center space-y-3 order-3">
            <div class="relative">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-[#9a3412] to-[#431407] border-2 border-[#ea580c] flex flex-col items-center justify-center shadow-lg">
                <Medal class="h-8 w-8 text-[#ea580c]" />
                <span class="font-pixel text-[9px] text-[#fb923c] font-bold mt-0.5">#3 PERUNGGU</span>
              </div>
            </div>

            <div class="space-y-1">
              <h3 class="font-sans text-sm sm:text-base font-bold text-white line-clamp-1">
                {{ podiumData[2].name }}
              </h3>
              <span class="text-[10px] text-gray-400 block">Buddy: {{ podiumData[2].buddy }}</span>
              <div class="font-pixel text-sm sm:text-base text-[#fb923c] font-bold">
                {{ podiumData[2].score.toLocaleString() }} PTS
              </div>
            </div>

            <!-- Pedestal Block 3 (Height 100px) -->
            <div class="w-full h-24 sm:h-32 bg-gradient-to-t from-[#1a0c06] to-[#2f140a] border-2 border-t-4 border-[#ea580c] rounded-t-xl flex flex-col items-center justify-center p-2 shadow-xl">
              <span class="font-pixel text-2xl sm:text-4xl text-[#ea580c] font-bold opacity-60">3</span>
              <span class="text-[9px] text-gray-400 font-mono mt-1">16 Pos Selesai</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MODE 2: KLASEMEN LENGKAP SEMUA REGU (GRID TICKER) -->
      <div v-else-if="activeMode === 'all-teams'" class="space-y-4 animate-fade-in">
        <div class="text-center space-y-1">
          <h2 class="font-pixel text-base sm:text-xl text-[#fef08a] font-bold tracking-wider">
            KLASEMEN LENGKAP SELURUH KELOMPOK GENIUS 2026
          </h2>
          <p class="text-xs text-gray-300 font-sans">
            Total 10 Kelompok Peserta PKKMB UNU Yogyakarta
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-4xl mx-auto">
          <div
            v-for="team in allTeamsData"
            :key="team.rank"
            :class="[
              'p-3 rounded-xl border flex items-center justify-between transition-all',
              team.rank <= 3
                ? 'bg-[#2b1c11] border-[#f59e0b] shadow-md'
                : 'bg-[#150f09] border-[#382618]'
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-7 h-7 rounded flex items-center justify-center font-pixel text-xs font-bold shrink-0',
                  team.rank === 1 ? 'bg-[#ca8a04] text-[#140e08]' :
                  team.rank === 2 ? 'bg-gray-400 text-black' :
                  team.rank === 3 ? 'bg-amber-800 text-white' :
                  'bg-[#271a10] text-gray-400'
                ]"
              >
                #{{ team.rank }}
              </div>

              <div>
                <span class="font-sans text-xs font-bold text-white block">
                  {{ team.name }}
                </span>
                <span class="text-[10px] text-gray-400 font-mono">
                  Buddy: {{ team.buddy }} &bull; {{ team.completedStamps }}/18 Pos
                </span>
              </div>
            </div>

            <div class="text-right shrink-0">
              <span class="font-pixel text-xs sm:text-sm text-[#facc15] font-bold block">
                {{ team.score.toLocaleString() }} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- MODE 3: DRAMATIC STEP-BY-STEP REVEAL -->
      <div v-else-if="activeMode === 'reveal'" class="space-y-6 max-w-2xl mx-auto text-center animate-fade-in">
        <div class="space-y-1">
          <span class="px-3 py-0.5 rounded-full border border-purple-500 bg-purple-950/60 text-[9px] font-pixel text-purple-300 uppercase">
            CEREMONY MODE
          </span>
          <h2 class="font-pixel text-lg sm:text-2xl text-white font-bold">
            PENGUMUMAN JUARA UMUM BERTARAF RESMI
          </h2>
          <p class="text-xs text-gray-300">
            Klik tombol di bawah ini untuk membuka juara satu per satu dengan efek visual dramatis!
          </p>
        </div>

        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            @click="revealStep = 1"
            :class="[
              'px-3 py-2 rounded-lg font-pixel text-xs border cursor-pointer transition-all',
              revealStep >= 1 ? 'bg-[#7c2d12] border-[#ea580c] text-white' : 'bg-[#1a110a] border-[#3d2c1e] text-gray-500'
            ]"
          >
            1. BUKA JUARA 3
          </button>
          <button
            type="button"
            @click="revealStep = 2"
            :class="[
              'px-3 py-2 rounded-lg font-pixel text-xs border cursor-pointer transition-all',
              revealStep >= 2 ? 'bg-[#334155] border-[#94a3b8] text-white' : 'bg-[#1a110a] border-[#3d2c1e] text-gray-500'
            ]"
          >
            2. BUKA JUARA 2
          </button>
          <button
            type="button"
            @click="revealStep = 3"
            :class="[
              'px-3 py-2 rounded-lg font-pixel text-xs border cursor-pointer transition-all',
              revealStep >= 3 ? 'bg-[#ca8a04] border-[#facc15] text-[#140e08] font-bold shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'bg-[#1a110a] border-[#3d2c1e] text-gray-500'
            ]"
          >
            3. BUKA JUARA 1 (EMAS)
          </button>
        </div>

        <!-- Revealed Winner Display Card -->
        <div class="p-6 bg-[#181009] border-2 border-[#f59e0b] rounded-2xl shadow-2xl min-h-[220px] flex flex-col items-center justify-center space-y-3">
          <div v-if="revealStep === 0" class="text-gray-400 text-xs font-mono">
            Silakan tekan tombol di atas untuk memulai pengumuman juara.
          </div>

          <div v-else-if="revealStep === 1" class="space-y-2 animate-bounce">
            <Medal class="h-12 w-12 text-[#ea580c] mx-auto" />
            <span class="font-pixel text-sm text-[#fb923c] uppercase">SELAMAT KEPADA JUARA 3 (PERUNGGU)</span>
            <h3 class="font-sans text-xl font-bold text-white">{{ podiumData[2]?.name || 'Regu Juara 3' }}</h3>
            <span class="font-pixel text-lg text-[#fb923c] block">{{ (podiumData[2]?.score || 0).toLocaleString() }} PTS</span>
          </div>

          <div v-else-if="revealStep === 2" class="space-y-2 animate-bounce">
            <Medal class="h-12 w-12 text-gray-300 mx-auto" />
            <span class="font-pixel text-sm text-gray-300 uppercase">SELAMAT KEPADA JUARA 2 (PERAK)</span>
            <h3 class="font-sans text-xl font-bold text-white">{{ podiumData[1]?.name || 'Regu Juara 2' }}</h3>
            <span class="font-pixel text-lg text-[#e2e8f0] block">{{ (podiumData[1]?.score || 0).toLocaleString() }} PTS</span>
          </div>

          <div v-else-if="revealStep === 3" class="space-y-3 animate-pulse">
            <Crown class="h-16 w-16 text-[#facc15] mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
            <span class="font-pixel text-base text-[#facc15] uppercase tracking-wider block">
              MAHAKARYA JUARA UMUM PKKMB UNU 2026!
            </span>
            <h3 class="font-sans text-2xl sm:text-3xl font-bold text-[#fef08a]">{{ podiumData[0]?.name || 'Regu Juara 1' }}</h3>
            <p class="text-xs text-gray-300 font-mono">Buddy: {{ podiumData[0]?.buddy || 'Pendamping Regu' }} &bull; Sinergi Regu Sempurna</p>
            <span class="font-pixel text-2xl text-[#86efac] block">{{ (podiumData[0]?.score || 0).toLocaleString() }} PTS</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Stage Footer -->
    <footer class="relative z-20 px-6 py-2.5 border-t border-[#3d2c1e] bg-[#100a06] flex items-center justify-between text-[10px] text-gray-400 font-mono">
      <span>UNU YOGYAKARTA &bull; PKKMB GENIUS 2026</span>
      <span class="text-[#f59e0b]">TEKAN F11 UNTUK MODE LAYAR PENUH PROYEKTOR</span>
      <span>STATUS SERVER: {{ isConnected ? 'REALTIME WEBSOCKET (LIVE)' : 'SYNCING...' }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Trophy,
  Users,
  Sparkles,
  Snowflake,
  Maximize2,
  Crown,
  Medal,
} from "lucide-vue-next";
import { useApi } from "@/composables/useApi";
import { useRealtime } from "@/composables/useRealtime";

definePageMeta({
  layout: false, // Bebas dari sidebar admin untuk tampilan proyektor panggung
});

const api = useApi();
const { isConnected, onEvent } = useRealtime();

const activeMode = ref<"podium" | "all-teams" | "reveal">("podium");
const isFrozen = ref(true);
const revealStep = ref(0);
const currentTime = ref("");

interface TeamRankItem {
  rank: number;
  id?: string;
  name: string;
  buddy: string;
  score: number;
  completedStamps: number;
}

const rawTeamsList = ref<TeamRankItem[]>([]);

const podiumData = computed(() => {
  return rawTeamsList.value.slice(0, 3);
});

const allTeamsData = computed(() => {
  return rawTeamsList.value;
});

let timerInterval: ReturnType<typeof setInterval> | null = null;
let unsubscribeWs: (() => void) | null = null;

const updateClock = () => {
  const now = new Date();
  currentTime.value =
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " WIB";
};

async function fetchLiveLeaderboard() {
  try {
    const res: any = await api.get("/api/leaderboard?limit=50");
    const data = res?.data !== undefined ? res.data : res;
    if (data && Array.isArray(data.topTeams)) {
      rawTeamsList.value = data.topTeams.map((t: any, idx: number) => ({
        rank: t.rank || idx + 1,
        id: t.teamId,
        name: t.teamName || `Regu ${t.teamCode || idx + 1}`,
        buddy: t.buddyName || "Game Master",
        score: Number(t.totalScore || 0),
        completedStamps: Number(t.transactionCount || 0),
      }));
    }
  } catch (err) {
    console.error("[Projector] Gagal memuat data leaderboard live:", err);
  }
}

const toggleFreeze = () => {
  isFrozen.value = !isFrozen.value;
  if (import.meta.client) {
    localStorage.setItem("genius_leaderboard_frozen", isFrozen.value ? "true" : "false");
  }
};

const toggleFullScreen = () => {
  if (typeof document !== "undefined") {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
  }
};

onMounted(() => {
  updateClock();
  timerInterval = setInterval(updateClock, 1000);

  if (import.meta.client) {
    const savedFreeze = localStorage.getItem("genius_leaderboard_frozen");
    if (savedFreeze !== null) {
      isFrozen.value = savedFreeze === "true";
    }
  }

  fetchLiveLeaderboard();

  // Listen to realtime WebSocket updates
  unsubscribeWs = onEvent((event) => {
    if (event === "LEADERBOARD_UPDATED" || event === "SCORE_SUBMITTED") {
      fetchLiveLeaderboard();
    }
  });
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (unsubscribeWs) unsubscribeWs();
});
</script>
