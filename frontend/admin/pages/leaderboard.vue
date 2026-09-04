<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Main Page Content Area (Self-managed padding) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Topbar Actions Teleport -->
      <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCorrectionModal"
        title="Koreksi / Bonus"
      >
        <Scale class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">KOREKSI / BONUS</span>
      </button>

      <button
        type="button"
        :class="[
          'pixel-btn h-8 px-3 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer',
          isFrozen
            ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow animate-pulse'
            : 'bg-[#271d15] border-[#523e2b] text-gray-300 hover:text-white'
        ]"
        @click="toggleFreeze"
        title="Bekukan / Buka Skor Publik Mahasiswa"
      >
        <Snowflake class="h-3.5 w-3.5 text-cyan-400" />
        <span class="hidden sm:inline">{{ isFrozen ? 'FREEZE AKTIF' : 'FREEZE KLASEMEN' }}</span>
      </button>

      <NuxtLink
        to="/projector"
        target="_blank"
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#3b1d54] text-[#d8b4fe] border-[#a855f7] flex items-center gap-1.5 hover:bg-[#4c246f] transition-all shadow"
        title="Buka Mode Proyektor Layar Panggung"
      >
        <Tv class="h-3.5 w-3.5 text-[#c084fc]" />
        <span class="hidden sm:inline">LAYAR PANGGUNG</span>
      </NuxtLink>

      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#271d15] text-[#38bdf8] border-[#0284c7] flex items-center gap-1.5 hover:bg-[#3d2d1e]"
        @click="exportLedgerCSV"
        title="Export CSV"
      >
        <Download class="h-3.5 w-3.5 text-[#38bdf8]" />
        <span class="hidden sm:inline">EXPORT CSV</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchData"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Freeze Alert Notice Banner -->
    <div
      v-if="isFrozen"
      class="p-2.5 bg-cyan-950/70 border border-cyan-500/50 rounded-lg flex items-center justify-between gap-3 text-xs font-mono text-cyan-200 shadow"
    >
      <div class="flex items-center gap-2">
        <Snowflake class="h-4 w-4 text-cyan-400 shrink-0 animate-spin" />
        <span><strong>MODE FREEZE AKTIF:</strong> Tampilan skor publik mahasiswa dibekukan untuk persiapan Awarding Panggung Hari ke-3. Data di dashboard admin ini tetap sinkron realtime.</span>
      </div>
      <button
        type="button"
        @click="toggleFreeze"
        class="text-[10px] underline text-cyan-400 hover:text-white shrink-0 cursor-pointer"
      >
        Buka Freeze
      </button>
    </div>

    <!-- Top 3 Podium Visual Banner (Pixel Theme) -->
    <div class="grid grid-cols-1 gap-3 md:grid-cols-3 font-mono">
      <!-- Silver (Rank 2) -->
      <div class="pixel-card p-4 flex flex-col items-center text-center space-y-2 border-[#94a3b8]/60 bg-[#1a140f] md:order-1 order-2">
        <div class="h-10 w-10 border-2 border-[#94a3b8] bg-[#222] flex items-center justify-center text-lg font-pixel text-[#e2e8f0]">
          #2
        </div>
        <div>
          <div class="font-bold text-foreground text-xs">{{ podiumTeams[1]?.name || 'Genius 02' }}</div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Buddy: {{ podiumTeams[1]?.buddy || 'Siti R.' }} · {{ podiumTeams[1]?.floor || 'Lantai 5' }}</div>
        </div>
        <div class="font-pixel text-sm font-bold text-[#e2e8f0]">
          {{ (podiumTeams[1]?.score || 2620).toLocaleString() }} PTS
        </div>
        <span class="border border-[#523e2b] px-1.5 py-0.2 text-[8px] text-muted-foreground">12 Misi Selesai</span>
      </div>

      <!-- Gold (Rank 1 - Winner) -->
      <div class="pixel-card-gold p-4 flex flex-col items-center text-center space-y-2 md:order-2 order-1 md:-translate-y-1">
        <div class="h-12 w-12 border-2 border-[#ca8a04] bg-[#2b2014] flex items-center justify-center text-xl font-pixel text-[#facc15] animate-pulse">
          👑 #1
        </div>
        <div>
          <div class="font-pixel text-xs sm:text-sm font-bold text-[#facc15]">{{ podiumTeams[0]?.name || 'Genius 01' }}</div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Buddy: {{ podiumTeams[0]?.buddy || 'Budi Santoso' }} · {{ podiumTeams[0]?.floor || 'Lantai 2' }}</div>
        </div>
        <div class="font-pixel text-base font-bold text-[#facc15]">
          {{ (podiumTeams[0]?.score || 2850).toLocaleString() }} PTS
        </div>
        <span class="border border-[#ca8a04] bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15]">PEMIMPIN KLASEMEN</span>
      </div>

      <!-- Bronze (Rank 3) -->
      <div class="pixel-card p-4 flex flex-col items-center text-center space-y-2 border-[#c2410c]/60 bg-[#1a140f] md:order-3 order-3">
        <div class="h-10 w-10 border-2 border-[#c2410c] bg-[#2b1810] flex items-center justify-center text-lg font-pixel text-[#fb923c]">
          #3
        </div>
        <div>
          <div class="font-bold text-foreground text-xs">{{ podiumTeams[2]?.name || 'Genius 03' }}</div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Buddy: {{ podiumTeams[2]?.buddy || 'Ahmad F.' }} · {{ podiumTeams[2]?.floor || 'Lantai 6' }}</div>
        </div>
        <div class="font-pixel text-sm font-bold text-[#fb923c]">
          {{ (podiumTeams[2]?.score || 2480).toLocaleString() }} PTS
        </div>
        <span class="border border-[#523e2b] px-1.5 py-0.2 text-[8px] text-muted-foreground">10 Misi Selesai</span>
      </div>
    </div>

    <!-- Sticky Top Pixel Toolbar -->
    <div class="pixel-toolbar-sticky p-3 space-y-2.5 rounded-lg border border-[#4a3624]">
      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <!-- View Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            v-for="tab in tabOptions"
            :key="tab.key"
            @click="switchTab(tab.key)"
            :class="[
              'h-7 px-2.5 text-xs font-pixel flex items-center gap-1.5 transition-colors border',
              activeTab === tab.key
                ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
                : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
            ]"
          >
            <component :is="tab.icon" class="h-3 w-3" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Filters: Search & Stage Selector -->
        <div class="flex items-center gap-2">
          <div class="relative w-48 sm:w-60">
            <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
            <input
              v-model="searchQuery"
              placeholder="Cari tim / peserta..."
              class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <select
            v-model="stageFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="fetchData"
          >
            <option value="">Semua Stage (Akumulasi)</option>
            <option v-for="s in stages" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TAB 1: Peringkat Tim (Team Rankings) -->
    <div v-if="activeTab === 'team'" class="pixel-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="pixel-table w-full text-left text-xs font-mono">
          <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
            <tr>
              <th class="p-3 w-16 text-center">RANK</th>
              <th class="p-3">NAMA TIM</th>
              <th class="p-3">KODE TIM</th>
              <th class="p-3">BUDDY PENDAMPING</th>
              <th class="p-3">LOKASI / LANTAI</th>
              <th class="p-3 text-center">TRANSAKSI</th>
              <th class="p-3 text-right">TOTAL POIN</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60">
            <tr v-if="loading" class="text-center">
              <td colspan="7" class="p-8 text-muted-foreground">
                <div class="flex items-center justify-center gap-2">
                  <RotateCw class="h-4 w-4 animate-spin text-[#f59e0b]" />
                  <span>Memuat klasemen tim...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="paginatedTeams.length === 0" class="text-center">
              <td colspan="7" class="p-8 text-muted-foreground">
                Tidak ada data tim yang sesuai.
              </td>
            </tr>

            <tr
              v-for="t in paginatedTeams"
              :key="t.teamId"
              class="hover:bg-[#271d15]/50 transition-colors"
            >
              <td class="p-3 text-center font-pixel text-xs font-bold">
                <span
                  :class="[
                    'inline-flex h-6 w-6 items-center justify-center border text-[10px]',
                    t.rank === 1
                      ? 'bg-[#2b2014] text-[#facc15] border-[#ca8a04]'
                      : t.rank === 2
                      ? 'bg-[#222] text-[#e2e8f0] border-[#94a3b8]'
                      : t.rank === 3
                      ? 'bg-[#2b1810] text-[#fb923c] border-[#c2410c]'
                      : 'bg-[#15100c] text-muted-foreground border-[#3d2d1e]'
                  ]"
                >
                  {{ t.rank }}
                </span>
              </td>

              <td class="p-3 font-semibold text-foreground font-pixel text-xs">
                {{ t.name }}
              </td>

              <td class="p-3 text-[#facc15]">
                {{ t.code }}
              </td>

              <td class="p-3">
                <span v-if="t.buddy" class="border border-[#0284c7]/80 bg-[#16222f] text-[#38bdf8] text-[9px] px-1.5 py-0.5 font-pixel">
                  {{ t.buddy }}
                </span>
                <span v-else class="text-muted-foreground/60 italic text-[10px]">-</span>
              </td>

              <td class="p-3 text-muted-foreground">
                {{ t.floor || '-' }}
              </td>

              <td class="p-3 text-center text-muted-foreground">
                {{ t.txCount || 0 }}
              </td>

              <td class="p-3 text-right font-pixel text-xs font-bold text-[#4ade80]">
                {{ (t.totalScore || 0).toLocaleString() }} PTS
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: Peringkat Individu (Participant Rankings) -->
    <div v-else-if="activeTab === 'participant'" class="pixel-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="pixel-table w-full text-left text-xs font-mono">
          <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
            <tr>
              <th class="p-3 w-16 text-center">RANK</th>
              <th class="p-3">NAMA PESERTA</th>
              <th class="p-3">TIM PETUALANG</th>
              <th class="p-3 text-center">TRANSAKSI</th>
              <th class="p-3 text-right">TOTAL POIN</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60">
            <tr
              v-for="p in paginatedParticipants"
              :key="p.userId"
              class="hover:bg-[#271d15]/50 transition-colors"
            >
              <td class="p-3 text-center font-pixel text-xs font-bold">
                <span
                  :class="[
                    'inline-flex h-6 w-6 items-center justify-center border text-[10px]',
                    p.rank === 1
                      ? 'bg-[#2b2014] text-[#facc15] border-[#ca8a04]'
                      : p.rank === 2
                      ? 'bg-[#222] text-[#e2e8f0] border-[#94a3b8]'
                      : p.rank === 3
                      ? 'bg-[#2b1810] text-[#fb923c] border-[#c2410c]'
                      : 'bg-[#15100c] text-muted-foreground border-[#3d2d1e]'
                  ]"
                >
                  {{ p.rank }}
                </span>
              </td>

              <td class="p-3">
                <div class="flex items-center gap-2.5">
                  <div class="h-8 w-8 rounded border border-[#f59e0b]/40 overflow-hidden bg-[#1e1712] shrink-0 shadow-sm">
                    <img
                      :src="getParticipantAvatar(p)"
                      :alt="p.fullName"
                      class="h-full w-full object-cover"
                      style="image-rendering: pixelated;"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-foreground leading-tight">{{ p.fullName }}</div>
                    <div class="text-[10px] text-muted-foreground">@{{ p.username }}</div>
                  </div>
                </div>
              </td>

              <td class="p-3">
                <span v-if="p.teamName" class="font-pixel text-[10px] text-[#facc15]">
                  {{ p.teamName }} ({{ p.teamCode }})
                </span>
                <span v-else class="text-[#ca8a04] italic text-[10px]">Free Agent</span>
              </td>

              <td class="p-3 text-center text-muted-foreground">
                {{ p.txCount || 0 }}
              </td>

              <td class="p-3 text-right font-pixel text-xs font-bold text-[#4ade80]">
                {{ (p.totalScore || 0).toLocaleString() }} PTS
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: Audit Trail Point Ledger -->
    <div v-else-if="activeTab === 'ledger'" class="pixel-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="pixel-table w-full text-left text-xs font-mono">
          <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
            <tr>
              <th class="p-3">TIMESTAMP</th>
              <th class="p-3">SASARAN</th>
              <th class="p-3">TIPE SUMBER</th>
              <th class="p-3">KETERANGAN ALASAN</th>
              <th class="p-3 text-right">POIN</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60">
            <tr
              v-for="tx in paginatedLedger"
              :key="tx.id"
              class="hover:bg-[#271d15]/50 transition-colors"
            >
              <td class="p-3 text-muted-foreground text-[10px]">
                {{ formatDate(tx.createdAt) }}
              </td>

              <td class="p-3 font-semibold text-foreground">
                {{ tx.targetName || '-' }}
              </td>

              <td class="p-3">
                <span
                  :class="[
                    'px-1.5 py-0.2 text-[8px] font-pixel border',
                    tx.sourceType === 'GAME'
                      ? 'border-[#16a34a] text-[#4ade80]'
                      : tx.sourceType === 'BONUS'
                      ? 'border-[#ca8a04] text-[#facc15]'
                      : tx.sourceType === 'QR'
                      ? 'border-[#0284c7] text-[#38bdf8]'
                      : 'border-[#523e2b] text-muted-foreground'
                  ]"
                >
                  {{ tx.sourceType }}
                </span>
              </td>

              <td class="p-3 text-muted-foreground text-[11px]">
                {{ tx.reason || 'Sesi Game Selesai' }}
              </td>

              <td class="p-3 text-right font-pixel text-xs font-bold" :class="tx.amount >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'">
                {{ tx.amount >= 0 ? `+${tx.amount}` : tx.amount }} PTS
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>

    <!-- Sticky Bottom Dashboard Footer: Pixel Pagination -->
    <PixelPagination
      :current-page="currentPage"
      :total-items="activeTab === 'team' ? filteredTeams.length : activeTab === 'participant' ? filteredParticipants.length : filteredLedger.length"
      :page-size="pageSize"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Koreksi Skor -->
    <Dialog :open="showCorrectionModal" @update:open="showCorrectionModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#ca8a04] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Scale class="h-4 w-4" />
            <span>KOREKSI SKOR / BONUS MANUAL</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitCorrection" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Tim:</Label>
            <select
              v-model="correctionForm.teamId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            >
              <option value="">-- Pilih Tim Sasaran --</option>
              <option v-for="t in teams" :key="t.teamId" :value="t.teamId">
                {{ t.name }} ({{ t.code }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Nominal Poin (+ / -):</Label>
            <input
              type="number"
              v-model.number="correctionForm.amount"
              placeholder="Contoh: 100 atau -50"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Alasan Koreksi:</Label>
            <input
              v-model="correctionForm.reason"
              placeholder="Alasan penyesuaian nilai..."
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showCorrectionModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="submitting"
            >
              <RotateCw v-if="submitting" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>SIMPAN</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Trophy,
  Shield,
  User,
  History,
  RotateCw,
  Search,
  Scale,
  Download,
  Snowflake,
  Tv,
} from "lucide-vue-next";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PixelPagination from "@/components/PixelPagination.vue";
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const submitting = ref(false);
const isFrozen = ref(false);
const activeTab = ref<"team" | "participant" | "ledger">("team");
const searchQuery = ref("");
const stageFilter = ref("");

const toggleFreeze = () => {
  isFrozen.value = !isFrozen.value;
  if (import.meta.client) {
    localStorage.setItem("genius_leaderboard_frozen", isFrozen.value ? "true" : "false");
  }
};

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const tabOptions = [
  { key: "team" as const, label: "PERINGKAT TIM", icon: Shield },
  { key: "participant" as const, label: "PERINGKAT INDIVIDU", icon: User },
  { key: "ledger" as const, label: "AUDIT LEDGER", icon: History },
];

const teams = ref<any[]>([]);
const participants = ref<any[]>([]);
const ledger = ref<any[]>([]);
const stages = ref<any[]>([]);

const showCorrectionModal = ref(false);
const correctionForm = ref({
  teamId: "",
  amount: 50,
  reason: "",
});

const podiumTeams = computed(() => {
  return teams.value.slice(0, 3);
});

const filteredTeams = computed(() => {
  if (!searchQuery.value.trim()) return teams.value;
  const q = searchQuery.value.toLowerCase().trim();
  return teams.value.filter(
    (t) => t.name?.toLowerCase().includes(q) || t.code?.toLowerCase().includes(q)
  );
});

const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredTeams.value.slice(start, start + pageSize.value);
});

const filteredParticipants = computed(() => {
  if (!searchQuery.value.trim()) return participants.value;
  const q = searchQuery.value.toLowerCase().trim();
  return participants.value.filter(
    (p) => p.fullName?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
  );
});

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredParticipants.value.slice(start, start + pageSize.value);
});

const filteredLedger = computed(() => {
  if (!searchQuery.value.trim()) return ledger.value;
  const q = searchQuery.value.toLowerCase().trim();
  return ledger.value.filter(
    (l) => l.reason?.toLowerCase().includes(q) || l.targetName?.toLowerCase().includes(q)
  );
});

const paginatedLedger = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLedger.value.slice(start, start + pageSize.value);
});

function switchTab(tab: "team" | "participant" | "ledger") {
  activeTab.value = tab;
  currentPage.value = 1;
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any }>("/api/leaderboard");
    if (res.success && res.data) {
      teams.value = (res.data.teamLeaderboard || []).map((t: any, idx: number) => ({
        ...t,
        rank: idx + 1,
      }));
      participants.value = (res.data.participantLeaderboard || []).map((p: any, idx: number) => ({
        ...p,
        rank: idx + 1,
      }));
      ledger.value = res.data.recentTransactions || [];
    }
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
  } finally {
    loading.value = false;
  }
}

function openCorrectionModal() {
  correctionForm.value = {
    teamId: teams.value[0]?.teamId || "",
    amount: 50,
    reason: "",
  };
  showCorrectionModal.value = true;
}

async function submitCorrection() {
  if (!correctionForm.value.teamId) return;
  submitting.value = true;
  try {
    await api.post("/api/leaderboard/adjust", {
      teamId: correctionForm.value.teamId,
      amount: correctionForm.value.amount,
      reason: correctionForm.value.reason,
    });
    alert("Penyesuaian skor berhasil disimpan!");
    showCorrectionModal.value = false;
    await fetchData();
  } catch (err: any) {
    alert("Gagal koreksi skor: " + (err.data?.error?.message || err.message));
  } finally {
    submitting.value = false;
  }
}

function exportLedgerCSV() {
  if (ledger.value.length === 0) {
    alert("Tidak ada transaksi untuk diexport");
    return;
  }

  let csv = "ID,Timestamp,Sasaran,Tipe Sumber,Alasan,Poin\n";
  ledger.value.forEach((l) => {
    csv += `"${l.id}","${l.createdAt}","${l.targetName || '-'}","${l.sourceType}","${l.reason || '-'}","${l.amount}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ledger_genius2026_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getParticipantAvatar(p: any) {
  if (p.avatarUrl) return p.avatarUrl;
  const isFemale =
    p.gender === "FEMALE" ||
    p.fullName?.toLowerCase().includes("siti") ||
    p.fullName?.toLowerCase().includes("dewi") ||
    p.fullName?.toLowerCase().includes("annisa") ||
    p.fullName?.toLowerCase().includes("zahra") ||
    p.fullName?.toLowerCase().includes("putri") ||
    p.fullName?.toLowerCase().includes("rina");
  return isFemale ? "/character-cewek-avatar.png" : "/character-cowok-avatar.png";
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  if (import.meta.client) {
    const savedFreeze = localStorage.getItem("genius_leaderboard_frozen");
    if (savedFreeze !== null) {
      isFrozen.value = savedFreeze === "true";
    }
  }
  fetchData();
});
</script>
