<template>
  <div class="space-y-3 pb-8 select-none font-sans text-[#f0e0c0]">
    <!-- Compact Header Banner -->
    <div class="sdv-card-gold p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <span class="border border-[#f0d060] bg-[#1a1008] px-1.5 py-0.5 text-[8px] font-pixel text-[#f0d060] uppercase tracking-wider rounded">
            KLASEMEN KAMPUS
          </span>
          <h1 class="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold mt-1">
            LEADERBOARD GENIUS 2026
          </h1>
        </div>
        <div class="w-8 h-8 rounded-lg bg-[#281c12] border border-[#f0d060] flex items-center justify-center shrink-0 shadow">
          <Trophy class="h-4 w-4 text-[#f0d060]" />
        </div>
      </div>

      <!-- Live / Freeze Status Pill -->
      <div class="flex items-center justify-between pt-1 border-t border-[#5a3a18] text-[10px] font-mono">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span class="text-[#86efac]">LIVE CLOUD SYNC</span>
        </div>
        <span class="text-[#c4956a]">
          Regu Anda: <strong class="text-[#f0d060] font-pixel text-[9px]">{{ myTeamRankLabel }}</strong>
        </span>
      </div>
    </div>

    <!-- Tab Switcher: Kelompok vs Individu (Stardew Style) -->
    <div class="grid grid-cols-2 gap-2 font-mono text-xs p-1 bg-[#170f07] border-2 border-[#5a3a18] rounded-xl">
      <button
        type="button"
        @click="activeTab = 'teams'"
        :class="[
          'py-2 px-3 rounded-lg font-pixel text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition-all',
          activeTab === 'teams'
            ? 'rpg-btn-primary shadow text-white'
            : 'text-[#c4956a] hover:text-white'
        ]"
      >
        <Users class="h-3.5 w-3.5" />
        <span>KLASEMEN REGU</span>
      </button>

      <button
        type="button"
        @click="activeTab = 'individuals'"
        :class="[
          'py-2 px-3 rounded-lg font-pixel text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition-all',
          activeTab === 'individuals'
            ? 'rpg-btn-primary shadow text-white'
            : 'text-[#c4956a] hover:text-white'
        ]"
      >
        <User class="h-3.5 w-3.5" />
        <span>INDIVIDU MABA</span>
      </button>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="activeTab === 'teams' ? 'Cari nama kelompok...' : 'Cari nama maba atau NIM...'"
        class="w-full bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none font-mono placeholder:text-[#a08060]"
      />
      <Search class="h-4 w-4 text-[#f0d060] absolute left-2.5 top-2.5" />
    </div>

    <!-- TAB 1: KLASEMEN REGU (TEAMS) -->
    <div v-if="activeTab === 'teams'" class="space-y-3">
      <!-- Loading indicator -->
      <div v-if="loading" class="sdv-card p-6 text-center text-[#c4956a] font-mono text-xs">
        <div class="inline-block w-5 h-5 border-2 border-[#f0d060] border-t-transparent rounded-full animate-spin mb-2"></div>
        <div>Memuat data klasemen kampus...</div>
      </div>

      <!-- Top 3 Podium (Mini Physical Cards) -->
      <div v-else class="grid grid-cols-3 gap-2 pt-1 pb-1 font-mono">
        <!-- 2nd Place -->
        <div class="sdv-card p-2 text-center flex flex-col justify-end items-center">
          <Medal class="h-5 w-5 text-gray-300 mb-1" />
          <span class="font-pixel text-[7.5px] text-gray-300">#2 PERAK</span>
          <span class="font-sans text-[10px] font-bold text-white line-clamp-1 mt-0.5">{{ rank2Team?.name || '-' }}</span>
          <span class="font-pixel text-[8.5px] text-[#f0d060] font-bold mt-1">{{ rank2Team ? `${rank2Team.score.toLocaleString()} PTS` : '- PTS' }}</span>
        </div>

        <!-- 1st Place (Winner / Highlight) -->
        <div class="sdv-card-gold p-2.5 text-center flex flex-col justify-end items-center scale-105 shadow-xl">
          <Crown class="h-6 w-6 text-[#facc15] mb-1 animate-bounce" />
          <span class="font-pixel text-[8px] text-[#facc15]">#1 EMAS</span>
          <span class="font-sans text-[10.5px] font-bold text-[#fef08a] line-clamp-1 mt-0.5">{{ rank1Team?.name || '-' }}</span>
          <span class="font-pixel text-[9.5px] text-[#86efac] font-bold mt-1">{{ rank1Team ? `${rank1Team.score.toLocaleString()} PTS` : '- PTS' }}</span>
        </div>

        <!-- 3rd Place -->
        <div class="sdv-card p-2 text-center flex flex-col justify-end items-center">
          <Medal class="h-5 w-5 text-[#ea580c] mb-1" />
          <span class="font-pixel text-[7.5px] text-[#fb923c]">#3 PERUNGGU</span>
          <span class="font-sans text-[10px] font-bold text-white line-clamp-1 mt-0.5">{{ rank3Team?.name || '-' }}</span>
          <span class="font-pixel text-[8.5px] text-[#f0d060] font-bold mt-1">{{ rank3Team ? `${rank3Team.score.toLocaleString()} PTS` : '- PTS' }}</span>
        </div>
      </div>

      <!-- Team List -->
      <div v-if="!loading" class="space-y-2">
        <div v-if="filteredTeams.length === 0" class="sdv-card p-4 text-center text-[#c4956a] font-mono text-xs">
          Tidak ada regu yang cocok.
        </div>
        <div
          v-for="team in filteredTeams"
          :key="team.id"
          :class="[
            'p-3 rounded-xl border-2 flex items-center justify-between transition-all',
            isMyTeam(team.id)
              ? 'sdv-card-gold border-[#f0d060] ring-1 ring-[#f0d060] shadow-md'
              : 'sdv-card'
          ]"
        >
          <div class="flex items-center gap-2.5">
            <!-- Rank Badge -->
            <div
              :class="[
                'w-6 h-6 rounded flex items-center justify-center font-pixel text-xs shrink-0',
                team.rank === 1 ? 'bg-[#ca8a04] text-[#140e08] font-bold' :
                team.rank === 2 ? 'bg-gray-400 text-black font-bold' :
                team.rank === 3 ? 'bg-amber-800 text-white font-bold' :
                'bg-[#261a11] text-[#a08060]'
              ]"
            >
              #{{ team.rank }}
            </div>

            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-sans text-xs text-white font-bold">
                  {{ team.name }}
                </span>
                <span
                  v-if="isMyTeam(team.id)"
                  class="font-pixel text-[7px] text-[#f0d060] bg-[#2d1b0e] border border-[#f0d060] px-1.5 py-0.2 rounded"
                >
                  BINAAN ANDA
                </span>
              </div>
              <span class="text-[9.5px] text-[#c4956a] font-mono">
                Kode: {{ team.code }} &bull; {{ team.completedStamps }}/18 Pos
              </span>
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="font-pixel text-xs text-[#86efac] font-bold block">
              {{ team.score.toLocaleString() }}
            </span>
            <span class="text-[7.5px] text-[#a08060] font-mono">POIN REGU</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: KLASEMEN INDIVIDU (INDIVIDUALS) -->
    <div v-else class="space-y-2">
      <!-- Loading indicator -->
      <div v-if="loading" class="sdv-card p-6 text-center text-[#c4956a] font-mono text-xs">
        <div class="inline-block w-5 h-5 border-2 border-[#f0d060] border-t-transparent rounded-full animate-spin mb-2"></div>
        <div>Memuat data mahasiswa kampus...</div>
      </div>
      <div v-else-if="filteredStudents.length === 0" class="sdv-card p-4 text-center text-[#c4956a] font-mono text-xs">
        Tidak ada mahasiswa yang cocok.
      </div>
      <div
        v-else
        v-for="student in filteredStudents"
        :key="student.id"
        :class="[
          'p-3 rounded-xl border-2 flex items-center justify-between transition-all',
          isMyMember(student.id)
            ? 'sdv-card-gold border-[#f0d060]'
            : 'sdv-card'
        ]"
      >
        <div class="flex items-center gap-2.5">
          <!-- Rank Badge -->
          <div
            :class="[
              'w-6 h-6 rounded flex items-center justify-center font-pixel text-xs shrink-0',
              student.rank === 1 ? 'bg-[#ca8a04] text-[#140e08] font-bold' :
              student.rank === 2 ? 'bg-gray-400 text-black font-bold' :
              student.rank === 3 ? 'bg-amber-800 text-white font-bold' :
              'bg-[#261a11] text-[#a08060]'
            ]"
          >
            #{{ student.rank }}
          </div>

          <img
            :src="student.avatarUrl"
            :alt="student.fullName"
            class="w-8 h-8 rounded-lg border border-[#f0d060] bg-black/40 shrink-0"
          />

          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-sans text-xs text-white font-bold">
                {{ student.fullName }}
              </span>
              <span
                v-if="isMyMember(student.id)"
                class="font-pixel text-[7px] text-[#86efac] bg-[#172513] border border-[#22c55e]/60 px-1 py-0.2 rounded"
              >
                ANGGOTA SAYA
              </span>
            </div>
            <span class="text-[9.5px] text-[#c4956a] font-mono">
              NIM {{ student.username }} &bull; <strong class="text-[#f0d060]">{{ student.prodi }}</strong> &bull; {{ student.teamName }}
            </span>
          </div>
        </div>

        <div class="text-right shrink-0">
          <span class="font-pixel text-xs text-[#86efac] font-bold block">
            {{ student.totalXp.toLocaleString() }} XP
          </span>
          <span class="text-[8px] text-[#f0d060] font-mono">
            {{ student.stamps }} Stempel
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Trophy,
  Users,
  User,
  Search,
  Crown,
  Medal,
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useApi } from "@/composables/useApi";
import { useRealtime } from "@/composables/useRealtime";

const { user } = useAuth();
const api = useApi();
const { onLeaderboardUpdate } = useRealtime();

const activeTab = ref<"teams" | "individuals">("teams");
const searchQuery = ref("");
const loading = ref(true);

interface TeamRankItem {
  id: string;
  rank: number;
  name: string;
  code: string;
  score: number;
  completedStamps: number;
  buddyName: string;
}

interface StudentRankItem {
  id: string;
  rank: number;
  fullName: string;
  username: string;
  prodi: string;
  teamName: string;
  teamId?: string;
  totalXp: number;
  stamps: number;
  avatarUrl: string;
}

const allTeams = ref<TeamRankItem[]>([]);
const allStudents = ref<StudentRankItem[]>([]);

const rank1Team = computed(() => allTeams.value.find((t) => t.rank === 1) || allTeams.value[0]);
const rank2Team = computed(() => allTeams.value.find((t) => t.rank === 2) || allTeams.value[1]);
const rank3Team = computed(() => allTeams.value.find((t) => t.rank === 3) || allTeams.value[2]);

const currentTeamId = computed(() => {
  return user.value?.teamId || "";
});

const isMyTeam = (teamId: string) => {
  if (!currentTeamId.value) return false;
  return teamId === currentTeamId.value;
};

const isMyMember = (studentId: string) => {
  const student = allStudents.value.find((s) => s.id === studentId);
  if (!currentTeamId.value || !student?.teamId) return false;
  return student.teamId === currentTeamId.value;
};

const myTeamRankLabel = computed(() => {
  if (!currentTeamId.value) {
    const first = allTeams.value[0];
    return first ? `#${first.rank} (${first.score.toLocaleString()} PTS)` : "#-";
  }
  const found = allTeams.value.find((t) => t.id === currentTeamId.value || t.name === user.value?.teamName);
  if (found) return `#${found.rank} (${found.score.toLocaleString()} PTS)`;
  return "#-";
});

const filteredTeams = computed(() => {
  if (!searchQuery.value.trim()) return allTeams.value;
  const q = searchQuery.value.toLowerCase();
  return allTeams.value.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.buddyName.toLowerCase().includes(q)
  );
});

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return allStudents.value;
  const q = searchQuery.value.toLowerCase();
  return allStudents.value.filter(
    (s) =>
      s.fullName.toLowerCase().includes(q) ||
      s.username.includes(q) ||
      s.teamName.toLowerCase().includes(q)
  );
});

async function fetchLeaderboard() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any }>("/api/leaderboard");
    if (res.success && res.data) {
      const rawTeams = res.data.teamLeaderboard || [];
      allTeams.value = rawTeams.map((t: any, idx: number) => ({
        id: t.teamId,
        rank: t.rank || idx + 1,
        name: t.teamName || "Genius Tim",
        code: t.teamCode || "-",
        score: Number(t.totalScore || 0),
        completedStamps: Math.min(18, Math.floor(Number(t.totalScore || 0) / 100)),
        buddyName: t.buddyName || "Buddy",
      }));

      const rawParticipants = res.data.participantLeaderboard || [];
      allStudents.value = rawParticipants.map((p: any, idx: number) => ({
        id: p.participantId,
        rank: p.rank || idx + 1,
        fullName: p.participantName || "Mahasiswa",
        username: p.username || "-",
        prodi: p.characterClass || p.characterTitle || "Informatika",
        teamName: p.teamName || "Genius",
        teamId: p.teamId,
        totalXp: Number(p.totalScore || 0),
        stamps: Math.min(18, Math.floor(Number(p.totalScore || 0) / 50)),
        avatarUrl: p.gender === "FEMALE" ? "/character-cewek-avatar.png" : "/character-cowok-avatar.png",
      }));
    }
  } catch (err: any) {
    console.error("Gagal memuat leaderboard buddy:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchLeaderboard();
  onLeaderboardUpdate(() => {
    fetchLeaderboard();
  });
});
</script>
