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

    <!-- Loading / Empty State -->
    <div v-if="loading" class="sdv-card p-6 text-center text-[#c4956a] font-mono text-xs">
      <div class="inline-block w-5 h-5 border-2 border-[#f0d060] border-t-transparent rounded-full animate-spin mb-2"></div>
      <div>Memuat data regu dari server...</div>
    </div>
    <div v-else-if="activeMembers.length === 0" class="sdv-card p-6 text-center text-[#c4956a] font-mono text-xs">
      Belum ada mahasiswa baru yang terdaftar di regu ini.
    </div>

    <!-- Student Cards (Clean, Compact, Real UNU Majors) -->
    <div v-else class="space-y-2">
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
              :src="m.avatarUrl || '/character-cowok-avatar.png'"
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
              class="rpg-btn-wood h-7 px-2 font-pixel text-[8px] font-bold flex items-center gap-1 shadow cursor-pointer"
            >
              <span>+ HADIR</span>
            </button>

            <NuxtLink
              :to="`/buddy/fgd?participantId=${m.id}`"
              class="rpg-btn-primary h-7 px-2 font-pixel text-[8px] font-bold flex items-center gap-1 shadow cursor-pointer"
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
import { useApi } from "@/composables/useApi";

const { user } = useAuth();
const api = useApi();

interface BuddyMember {
  id: string;
  fullName: string;
  username: string; // NIM
  prodi: string; // Jurusan / Class
  avatarUrl: string;
  totalXp: number;
  attendanceStatus: "ON_TIME" | "LATE" | "ABSENT";
  checkInTime?: string;
  stampsCount: number;
  fgdScore?: number;
}

const loading = ref(true);
const teamData = ref<any>(null);
const activeMembers = ref<BuddyMember[]>([]);
const leaderboardTeams = ref<any[]>([]);

const cleanBuddyName = computed(() => {
  const raw = user.value?.fullName || "Buddy";
  return raw.replace(/^Kak(ak)?\s+/i, "").trim();
});

const currentTeamInfo = computed(() => {
  const name = teamData.value?.name || user.value?.teamName || "Genius 01";
  const routeName = teamData.value?.routeName || "Lantai 3";
  return {
    name,
    startFloor: routeName,
  };
});

const currentTeamScore = computed(() => {
  const found = leaderboardTeams.value.find(
    (t: any) => t.teamId === teamData.value?.id || t.teamName === currentTeamInfo.value.name
  );
  if (found?.totalScore != null) return Number(found.totalScore).toLocaleString();
  return Number(teamData.value?.totalScore || 0).toLocaleString();
});

const currentTeamRank = computed(() => {
  const found = leaderboardTeams.value.find(
    (t: any) => t.teamId === teamData.value?.id || t.teamName === currentTeamInfo.value.name
  );
  return found?.rank || 1;
});

const attendedCount = computed(
  () => activeMembers.value.filter((m) => m.attendanceStatus !== "ABSENT").length
);

const fgdCompletedCount = computed(
  () => activeMembers.value.filter((m) => !!m.fgdScore).length
);

async function markManualAttendance(member: BuddyMember) {
  try {
    const res = await api.post<{ success: boolean; data: any }>("/api/attendance/check-in", {
      participantId: member.id,
      day: 1,
      qrToken: "QR-PRESENSI-H1-GATE",
    });

    if (res.success) {
      member.attendanceStatus = res.data?.checkInStatus || "ON_TIME";
      const now = new Date();
      member.checkInTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} (Manual)`;
      member.totalXp += 100;
    }
  } catch (err: any) {
    console.error("Gagal presensi manual:", err);
  }
}

async function loadData() {
  loading.value = true;
  try {
    // 1. Resolve Team ID
    let targetTeamId = user.value?.teamId;
    if (!targetTeamId) {
      const teamsRes = await api.get<{ success: boolean; data: any[] }>("/api/teams");
      if (teamsRes.success && teamsRes.data?.length) {
        const myTeam = teamsRes.data.find((t: any) =>
          t.buddies?.some((b: any) => b.userId === user.value?.id)
        );
        targetTeamId = myTeam ? myTeam.id : teamsRes.data[0].id;
      }
    }

    if (targetTeamId) {
      // 2. Fetch Team Details, Leaderboard, FGD Evaluations, and Attendance
      const [teamRes, lbRes, evalsRes, attRes] = await Promise.allSettled([
        api.get<{ success: boolean; data: any }>(`/api/teams/${targetTeamId}`),
        api.get<{ success: boolean; data: any }>("/api/leaderboard"),
        api.get<{ success: boolean; data: any }>(`/api/buddy/evaluations/team/${targetTeamId}`),
        api.get<{ success: boolean; data: any }>("/api/attendance/recap?day=1"),
      ]);

      if (teamRes.status === "fulfilled" && teamRes.value.success) {
        teamData.value = teamRes.value.data;
      }

      if (lbRes.status === "fulfilled" && lbRes.value.success) {
        leaderboardTeams.value = lbRes.value.data?.teamLeaderboard || [];
      }

      const fgdEvalsMap = new Map<string, number>();
      if (evalsRes.status === "fulfilled" && evalsRes.value.success) {
        const evalsMembers = evalsRes.value.data?.members || [];
        evalsMembers.forEach((em: any) => {
          if (em.userId) fgdEvalsMap.set(em.userId, em.totalFgdXp || 0);
        });
      }

      const attendanceMap = new Map<string, { status: "ON_TIME" | "LATE"; time: string }>();
      if (attRes.status === "fulfilled" && attRes.value.success) {
        const attendees = attRes.value.data?.attendees || [];
        attendees.forEach((a: any) => {
          if (a.participantId) {
            const timeStr = a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "07:30";
            attendanceMap.set(a.participantId, {
              status: a.checkInStatus === "LATE" ? "LATE" : "ON_TIME",
              time: timeStr,
            });
          }
        });
      }

      // Map team members (participants only)
      const rawMembers = (teamData.value?.members || []).filter((m: any) => m.role === "PARTICIPANT" || !m.role);
      activeMembers.value = rawMembers.map((m: any) => {
        const att = attendanceMap.get(m.userId || m.id);
        const fgdScore = fgdEvalsMap.get(m.userId || m.id);
        return {
          id: m.userId || m.id,
          fullName: m.fullName || "Mahasiswa",
          username: m.username || "-",
          prodi: m.characterClass || m.characterTitle || "Informatika",
          avatarUrl: m.avatarUrl || "/character-cowok-avatar.png",
          totalXp: Number(m.totalScore || 0),
          attendanceStatus: att ? att.status : "ABSENT",
          checkInTime: att ? att.time : undefined,
          stampsCount: Math.min(18, Math.floor(Number(m.totalScore || 0) / 50)),
          fgdScore: fgdScore && fgdScore > 0 ? fgdScore : undefined,
        };
      });
    }
  } catch (err: any) {
    console.error("Failed to load buddy dashboard data:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
