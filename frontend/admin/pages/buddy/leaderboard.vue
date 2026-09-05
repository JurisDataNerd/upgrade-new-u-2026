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
      <!-- Top 3 Podium (Mini Physical Cards) -->
      <div class="grid grid-cols-3 gap-2 pt-1 pb-1 font-mono">
        <!-- 2nd Place -->
        <div class="sdv-card p-2 text-center flex flex-col justify-end items-center">
          <Medal class="h-5 w-5 text-gray-300 mb-1" />
          <span class="font-pixel text-[7.5px] text-gray-300">#2 PERAK</span>
          <span class="font-sans text-[10px] font-bold text-white line-clamp-1 mt-0.5">Genius 03</span>
          <span class="font-pixel text-[8.5px] text-[#f0d060] font-bold mt-1">2.620 PTS</span>
        </div>

        <!-- 1st Place (Winner / Highlight) -->
        <div class="sdv-card-gold p-2.5 text-center flex flex-col justify-end items-center scale-105 shadow-xl">
          <Crown class="h-6 w-6 text-[#facc15] mb-1 animate-bounce" />
          <span class="font-pixel text-[8px] text-[#facc15]">#1 EMAS</span>
          <span class="font-sans text-[10.5px] font-bold text-[#fef08a] line-clamp-1 mt-0.5">Genius 01</span>
          <span class="font-pixel text-[9.5px] text-[#86efac] font-bold mt-1">2.850 PTS</span>
        </div>

        <!-- 3rd Place -->
        <div class="sdv-card p-2 text-center flex flex-col justify-end items-center">
          <Medal class="h-5 w-5 text-[#ea580c] mb-1" />
          <span class="font-pixel text-[7.5px] text-[#fb923c]">#3 PERUNGGU</span>
          <span class="font-sans text-[10px] font-bold text-white line-clamp-1 mt-0.5">Genius 07</span>
          <span class="font-pixel text-[8.5px] text-[#f0d060] font-bold mt-1">2.410 PTS</span>
        </div>
      </div>

      <!-- Team List -->
      <div class="space-y-2">
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
                Buddy: {{ team.buddyName }} &bull; {{ team.completedStamps }}/18 Pos
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
      <div
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
import { ref, computed } from "vue";
import {
  Trophy,
  Users,
  User,
  Search,
  Crown,
  Medal,
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();

const activeTab = ref<"teams" | "individuals">("teams");
const searchQuery = ref("");

// Mock data seluruh tim kampus (PKKMB UNU 2026)
const allTeams = ref([
  { id: "group-01", rank: 1, name: "Genius 01", buddyName: "Budi Santoso", score: 2850, completedStamps: 18 },
  { id: "group-03", rank: 2, name: "Genius 03", buddyName: "Dewi Lestari", score: 2620, completedStamps: 17 },
  { id: "group-07", rank: 3, name: "Genius 07", buddyName: "Farhan Hakim", score: 2410, completedStamps: 16 },
  { id: "group-04", rank: 4, name: "Genius 04", buddyName: "Siti Rahma", score: 2380, completedStamps: 15 },
  { id: "group-02", rank: 5, name: "Genius 02", buddyName: "Hendra Wijaya", score: 2190, completedStamps: 14 },
  { id: "group-05", rank: 6, name: "Genius 05", buddyName: "Nurul Hidayah", score: 2050, completedStamps: 13 },
  { id: "group-06", rank: 7, name: "Genius 06", buddyName: "Agus Tri", score: 1980, completedStamps: 12 },
  { id: "group-08", rank: 8, name: "Genius 08", buddyName: "Lina Marlina", score: 1850, completedStamps: 11 },
]);

// Mock data mahasiswa teratas kampus dengan Prodi Resmi UNU
const allStudents = ref([
  { id: "p1", rank: 1, fullName: "Ahmad Dahlan", username: "2611101", prodi: "Informatika", teamName: "Genius 01", teamId: "group-01", totalXp: 980, stamps: 18, avatarUrl: "/character-cowok-avatar.png" },
  { id: "p6", rank: 2, fullName: "Ilham Ramadhan", username: "2611201", prodi: "Informatika", teamName: "Genius 03", teamId: "group-03", totalXp: 940, stamps: 18, avatarUrl: "/character-cowok-avatar.png" },
  { id: "p2", rank: 3, fullName: "Fatimah Azzahra", username: "2611102", prodi: "Farmasi", teamName: "Genius 01", teamId: "group-01", totalXp: 920, stamps: 17, avatarUrl: "/character-cewek-avatar.png" },
  { id: "p11", rank: 4, fullName: "Zahra Kusuma", username: "2611301", prodi: "PGSD", teamName: "Genius 07", teamId: "group-07", totalXp: 890, stamps: 17, avatarUrl: "/character-cewek-avatar.png" },
  { id: "p7", rank: 5, fullName: "Putri Ayu", username: "2611202", prodi: "Farmasi", teamName: "Genius 03", teamId: "group-03", totalXp: 870, stamps: 16, avatarUrl: "/character-cewek-avatar.png" },
  { id: "p4", rank: 6, fullName: "Siti Nurhaliza", username: "2611104", prodi: "Manajemen", teamName: "Genius 01", teamId: "group-01", totalXp: 840, stamps: 16, avatarUrl: "/character-cewek-avatar.png" },
  { id: "p8", rank: 7, fullName: "Bagas Saputra", username: "2611203", prodi: "Agribisnis", teamName: "Genius 03", teamId: "group-03", totalXp: 810, stamps: 15, avatarUrl: "/character-cowok-avatar.png" },
  { id: "p3", rank: 8, fullName: "Rian Pratama", username: "2611103", prodi: "Teknik Elektro", teamName: "Genius 01", teamId: "group-01", totalXp: 790, stamps: 14, avatarUrl: "/character-cowok-avatar.png" },
]);

const currentTeamId = computed(() => {
  if (user.value?.teamId === "group-03" || user.value?.username === "buddy03") return "group-03";
  if (user.value?.teamId === "group-07" || user.value?.username === "buddy07") return "group-07";
  return "group-01";
});

const isMyTeam = (teamId: string) => teamId === currentTeamId.value;

const isMyMember = (studentId: string) => {
  const student = allStudents.value.find((s) => s.id === studentId);
  return student?.teamId === currentTeamId.value;
};

const myTeamRankLabel = computed(() => {
  if (currentTeamId.value === "group-03") return "#2 (2.620 PTS)";
  if (currentTeamId.value === "group-07") return "#3 (2.410 PTS)";
  return "#1 (2.850 PTS)";
});

const filteredTeams = computed(() => {
  if (!searchQuery.value.trim()) return allTeams.value;
  const q = searchQuery.value.toLowerCase();
  return allTeams.value.filter(
    (t) => t.name.toLowerCase().includes(q) || t.buddyName.toLowerCase().includes(q)
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
</script>
