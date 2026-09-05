<template>
  <div class="space-y-3 pb-8 font-sans">
    <!-- Compact Top Group Header -->
    <div class="sdv-card-gold p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold">
            {{ currentTeamInfo.name }}
          </h1>
          <span class="text-[10px] text-[#c4956a] font-mono">
            Buddy: <strong class="text-white">{{ cleanBuddyName }}</strong> &bull; Rute: <strong class="text-[#f0d060]">{{ currentTeamInfo.startFloor }}</strong>
          </span>
        </div>

        <div class="text-right shrink-0">
          <span class="font-pixel text-xs sm:text-sm text-[#86efac] font-bold block">
            {{ currentTeamScore }} PTS
          </span>
          <span class="text-[9px] text-[#facc15] font-mono">Rank #{{ currentTeamRank }}</span>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px] pt-1 border-t border-[#5a3a18]">
        <div class="bg-[#170f07] py-1 px-2 rounded border border-[#5a3a18]">
          <span class="text-[#a08060] text-[8px] block">TOTAL MABA</span>
          <span class="font-pixel text-xs text-white">{{ activeMembers.length }}</span>
        </div>
        <div class="bg-[#170f07] py-1 px-2 rounded border border-[#5a3a18]">
          <span class="text-[#a08060] text-[8px] block">HADIR</span>
          <span class="font-pixel text-xs text-[#86efac]">{{ attendedCount }}/{{ activeMembers.length }}</span>
        </div>
        <div class="bg-[#170f07] py-1 px-2 rounded border border-[#5a3a18]">
          <span class="text-[#a08060] text-[8px] block">FGD TUNTAS</span>
          <span class="font-pixel text-xs text-[#38bdf8]">{{ fgdCompletedCount }}/{{ activeMembers.length }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions Hub (Direct access to FGD, Bonus H3, Leaderboard) -->
    <div class="grid grid-cols-3 gap-1.5 font-mono">
      <NuxtLink
        to="/buddy/fgd"
        class="sdv-card p-2 text-center flex flex-col items-center justify-center hover:border-[#f0d060] transition-all active:scale-95 group cursor-pointer"
      >
        <div class="w-7 h-7 rounded-lg bg-[#271d15] border border-[#f0d060] flex items-center justify-center text-[#facc15] mb-1 group-hover:scale-105 transition-transform">
          <FileEdit class="h-3.5 w-3.5" />
        </div>
        <span class="font-pixel text-[8px] sm:text-[9px] text-[#fef08a] block uppercase">NILAI FGD</span>
        <span class="text-[7px] text-[#c4956a]">Rubrik Sesi</span>
      </NuxtLink>

      <NuxtLink
        to="/buddy/bonus"
        class="sdv-card-gold p-2 text-center flex flex-col items-center justify-center hover:border-[#facc15] transition-all active:scale-95 group cursor-pointer"
      >
        <div class="w-7 h-7 rounded-lg bg-[#281c12] border border-[#f0d060] flex items-center justify-center text-[#f0d060] mb-1 group-hover:scale-105 transition-transform">
          <Gift class="h-3.5 w-3.5" />
        </div>
        <span class="font-pixel text-[8px] sm:text-[9px] text-[#facc15] block uppercase">BONUS H3</span>
        <span class="text-[7px] text-[#86efac]">Apresiasi</span>
      </NuxtLink>

      <NuxtLink
        to="/buddy/leaderboard"
        class="sdv-card p-2 text-center flex flex-col items-center justify-center hover:border-[#f0d060] transition-all active:scale-95 group cursor-pointer"
      >
        <div class="w-7 h-7 rounded-lg bg-[#271d15] border border-[#f0d060] flex items-center justify-center text-[#38bdf8] mb-1 group-hover:scale-105 transition-transform">
          <Trophy class="h-3.5 w-3.5" />
        </div>
        <span class="font-pixel text-[8px] sm:text-[9px] text-[#38bdf8] block uppercase">KLASEMEN</span>
        <span class="text-[7px] text-[#c4956a]">Leaderboard</span>
      </NuxtLink>
    </div>

    <!-- Student Cards (Clean, Compact, Real UNU Majors) -->
    <div class="space-y-2">
      <div
        v-for="m in activeMembers"
        :key="m.id"
        class="sdv-card p-2.5 sm:p-3 space-y-2 transition-all"
      >
        <!-- Top Row: Name, NIM, Jurusan, XP -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <!-- Mini Avatar -->
            <img
              :src="m.avatarUrl"
              :alt="m.fullName"
              class="w-8 h-8 rounded border border-[#f0d060] bg-black/40 shrink-0"
            />
            <div class="min-w-0 leading-tight">
              <h3 class="font-bold text-xs text-white truncate">
                {{ m.fullName }}
              </h3>
              <div class="text-[10px] text-[#c4956a] font-mono truncate">
                <span>{{ m.username }}</span>
                <span class="mx-1">&bull;</span>
                <span class="text-[#f0d060] font-semibold">{{ m.prodi }}</span>
              </div>
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="font-pixel text-[11px] text-[#86efac] font-bold block">
              {{ m.totalXp }} XP
            </span>
            <span class="text-[9px] text-[#38bdf8] font-mono">
              {{ m.stampsCount }}/18 Pos
            </span>
          </div>
        </div>

        <!-- Status & Direct Actions Row -->
        <div class="flex items-center justify-between gap-2 pt-1 border-t border-[#5a3a18]">
          <!-- Status Pill -->
          <div>
            <span
              v-if="m.attendanceStatus === 'ON_TIME'"
              class="text-[9px] font-mono text-[#86efac] bg-[#172513] border border-[#22c55e]/50 px-1.5 py-0.5 rounded"
            >
              ✓ Hadir ({{ m.checkInTime }})
            </span>
            <span
              v-else-if="m.attendanceStatus === 'LATE'"
              class="text-[9px] font-mono text-[#facc15] bg-[#2a1d08] border border-[#f59e0b]/50 px-1.5 py-0.5 rounded"
            >
              ⚠ Telat ({{ m.checkInTime }})
            </span>
            <span
              v-else
              class="text-[9px] font-mono text-red-400 bg-[#2a1210] border border-red-500/40 px-1.5 py-0.5 rounded"
            >
              Belum Hadir
            </span>
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              v-if="!m.checkInTime"
              type="button"
              @click="markManualAttendance(m)"
              class="rpg-btn-wood h-7 px-2 font-pixel text-[8px] font-bold flex items-center gap-1 shadow"
            >
              <span>+ HADIR</span>
            </button>

            <NuxtLink
              :to="`/buddy/fgd?participantId=${m.id}`"
              class="rpg-btn-primary h-7 px-2 font-pixel text-[8px] font-bold flex items-center gap-1 shadow"
            >
              <span>{{ m.fgdScore ? `FGD: ${m.fgdScore} XP` : 'NILAI FGD' }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { FileEdit, Gift, Trophy } from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();

interface BuddyMember {
  id: string;
  fullName: string;
  username: string; // NIM
  prodi: string; // Jurusan UNU Resmi
  avatarUrl: string;
  totalXp: number;
  attendanceStatus: "ON_TIME" | "LATE" | "ABSENT";
  checkInTime?: string;
  stampsCount: number;
  fgdScore?: number;
}

// Data Genius 01 - Budi (Jurusan resmi UNU)
const membersTeam01: BuddyMember[] = [
  { id: "p1", fullName: "Ahmad Dahlan", username: "2611101", prodi: "Informatika", avatarUrl: "/character-cowok-avatar.png", totalXp: 520, attendanceStatus: "ON_TIME", checkInTime: "07:18", stampsCount: 8, fgdScore: 186 },
  { id: "p2", fullName: "Fatimah Azzahra", username: "2611102", prodi: "Farmasi", avatarUrl: "/character-cewek-avatar.png", totalXp: 480, attendanceStatus: "ON_TIME", checkInTime: "07:25", stampsCount: 6, fgdScore: 173 },
  { id: "p3", fullName: "Rian Pratama", username: "2611103", prodi: "Teknik Elektro", avatarUrl: "/character-cowok-avatar.png", totalXp: 310, attendanceStatus: "LATE", checkInTime: "07:38", stampsCount: 4 },
  { id: "p4", fullName: "Siti Nurhaliza", username: "2611104", prodi: "Manajemen", avatarUrl: "/character-cewek-avatar.png", totalXp: 420, attendanceStatus: "ON_TIME", checkInTime: "07:15", stampsCount: 5, fgdScore: 160 },
  { id: "p5", fullName: "Kevin Wijaya", username: "2611105", prodi: "PGSD", avatarUrl: "/character-cowok-avatar.png", totalXp: 180, attendanceStatus: "ABSENT", stampsCount: 2 },
];

// Data Genius 03 - Dewi
const membersTeam03: BuddyMember[] = [
  { id: "p6", fullName: "Ilham Ramadhan", username: "2611201", prodi: "Informatika", avatarUrl: "/character-cowok-avatar.png", totalXp: 560, attendanceStatus: "ON_TIME", checkInTime: "07:12", stampsCount: 9, fgdScore: 190 },
  { id: "p7", fullName: "Putri Ayu", username: "2611202", prodi: "Teknologi Hasil Pertanian", avatarUrl: "/character-cewek-avatar.png", totalXp: 450, attendanceStatus: "ON_TIME", checkInTime: "07:22", stampsCount: 7, fgdScore: 175 },
  { id: "p8", fullName: "Bagas Saputra", username: "2611203", prodi: "Agribisnis", avatarUrl: "/character-cowok-avatar.png", totalXp: 390, attendanceStatus: "ON_TIME", checkInTime: "07:29", stampsCount: 6 },
  { id: "p9", fullName: "Annisa Maharani", username: "2611204", prodi: "Akuntansi", avatarUrl: "/character-cewek-avatar.png", totalXp: 410, attendanceStatus: "LATE", checkInTime: "07:41", stampsCount: 5 },
  { id: "p10", fullName: "Fikri Haikal", username: "2611205", prodi: "Studi Islam Interdisipliner", avatarUrl: "/character-cowok-avatar.png", totalXp: 340, attendanceStatus: "ON_TIME", checkInTime: "07:18", stampsCount: 5 },
];

// Data Genius 07 - Farhan
const membersTeam07: BuddyMember[] = [
  { id: "p11", fullName: "Zahra Kusuma", username: "2611301", prodi: "Farmasi", avatarUrl: "/character-cewek-avatar.png", totalXp: 540, attendanceStatus: "ON_TIME", checkInTime: "07:14", stampsCount: 8, fgdScore: 185 },
  { id: "p12", fullName: "Rizki Fauzi", username: "2611302", prodi: "Informatika", avatarUrl: "/character-cowok-avatar.png", totalXp: 460, attendanceStatus: "ON_TIME", checkInTime: "07:20", stampsCount: 7 },
  { id: "p13", fullName: "Nabila Safitri", username: "2611303", prodi: "Pendidikan Bahasa Inggris", avatarUrl: "/character-cewek-avatar.png", totalXp: 380, attendanceStatus: "ON_TIME", checkInTime: "07:26", stampsCount: 5 },
  { id: "p14", fullName: "Wahyu Hidayat", username: "2611304", prodi: "Teknik Elektro", avatarUrl: "/character-cowok-avatar.png", totalXp: 310, attendanceStatus: "LATE", checkInTime: "07:44", stampsCount: 4 },
];

const activeMembers = ref<BuddyMember[]>(membersTeam01);

const cleanBuddyName = computed(() => {
  const raw = user.value?.fullName || "Agnes Anggraini Risdiyanto";
  return raw.replace(/^Kak(ak)?\s+/i, "").trim();
});

const currentTeamInfo = computed(() => {
  const teamName = user.value?.teamName || "Genius 01";
  const floor = user.value?.assignedFloor ? `Lantai ${user.value.assignedFloor}` : "Lantai 1";
  return {
    name: teamName.replace(/^Team\s+/i, "").trim(),
    startFloor: floor,
  };
});

const currentTeamScore = computed(() => {
  if (user.value?.teamId) {
    const num = parseInt(user.value.teamId.replace(/\D/g, ""), 10);
    if (!isNaN(num)) {
      const score = Math.max(1850, 2850 - (num - 1) * 20);
      return score.toLocaleString();
    }
  }
  return "2.850";
});

const currentTeamRank = computed(() => {
  if (user.value?.teamId) {
    const num = parseInt(user.value.teamId.replace(/\D/g, ""), 10);
    if (!isNaN(num) && num > 0) return num;
  }
  return 1;
});

const attendedCount = computed(
  () => activeMembers.value.filter((m) => m.attendanceStatus !== "ABSENT").length
);

const fgdCompletedCount = computed(
  () => activeMembers.value.filter((m) => !!m.fgdScore).length
);

const markManualAttendance = (member: BuddyMember) => {
  member.attendanceStatus = "ON_TIME";
  member.checkInTime = "07:30 (Manual)";
  member.totalXp += 100;
  saveMembersState();
};

const saveMembersState = () => {
  if (import.meta.client) {
    const key = `genius_buddy_members_${user.value?.teamId || "group-01"}`;
    localStorage.setItem(key, JSON.stringify(activeMembers.value));
  }
};

const loadMembersState = () => {
  if (import.meta.client) {
    if (user.value?.teamId === "group-03" || user.value?.username === "buddy03") {
      activeMembers.value = [...membersTeam03];
    } else if (user.value?.teamId === "group-07" || user.value?.username === "buddy07") {
      activeMembers.value = [...membersTeam07];
    } else {
      activeMembers.value = [...membersTeam01];
    }

    const key = `genius_buddy_members_${user.value?.teamId || "group-01"}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        activeMembers.value = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  }
};

onMounted(() => {
  loadMembersState();
});
</script>
