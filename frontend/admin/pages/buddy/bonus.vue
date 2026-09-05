<template>
  <div class="space-y-3 pb-8 select-none font-sans text-[#f0e0c0]">
    <!-- Compact Header (Stardew Gold Banner) -->
    <div class="sdv-card-gold p-3 space-y-1.5">
      <div class="flex items-center justify-between">
        <div>
          <span class="border border-[#f0d060] bg-[#1a1008] px-1.5 py-0.5 text-[8px] font-pixel text-[#f0d060] uppercase tracking-wider rounded">
            PENUTUPAN HARI KE-3
          </span>
          <h1 class="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold mt-1">
            POIN BONUS &amp; APRESIASI REGU
          </h1>
          <p class="text-[10px] text-[#c4956a]">
            {{ currentTeamName }}
          </p>
        </div>
        <div class="w-8 h-8 rounded-lg bg-[#281c12] border border-[#f0d060] flex items-center justify-center shrink-0 shadow">
          <Gift class="h-4 w-4 text-[#f0d060]" />
        </div>
      </div>
    </div>

    <!-- Status Saved Badge -->
    <div
      v-if="isSubmitted"
      class="p-2.5 bg-[#172513] border-2 border-[#22c55e] rounded-xl text-center space-y-0.5 shadow"
    >
      <div class="flex items-center justify-center gap-1.5 text-[#86efac] font-pixel text-xs">
        <CheckCircle2 class="h-3.5 w-3.5" />
        <span>BONUS HARI KE-3 TERSIMPAN</span>
      </div>
      <p class="text-[10px] text-gray-300 font-mono">
        Total <strong class="text-[#f0d060]">+{{ totalDistributedXp }} XP</strong> terdistribusi ke anggota regu.
      </p>
    </div>

    <!-- Section 1: Bonus Kekompakan Regu -->
    <div class="sdv-card p-3 space-y-2.5">
      <div class="flex items-center justify-between border-b border-[#5a3a18] pb-2">
        <div class="flex items-center gap-2">
          <Award class="h-4 w-4 text-[#f0d060]" />
          <div>
            <h2 class="font-pixel text-[10px] sm:text-[11px] text-[#fef08a] font-bold">
              1. KEKOMPAKAN REGU
            </h2>
            <span class="text-[9px] text-[#c4956a]">Rata untuk {{ activeMembers.length }} anggota</span>
          </div>
        </div>
        <span class="font-pixel text-xs text-[#86efac] font-bold bg-[#172513] px-2 py-0.5 rounded border border-[#22c55e]/50">
          +{{ teamSynergyBonus }} XP/Maba
        </span>
      </div>

      <!-- Presets Option Buttons -->
      <div class="grid grid-cols-3 gap-1.5 font-mono">
        <button
          type="button"
          v-for="preset in synergyPresets"
          :key="preset.xp"
          @click="teamSynergyBonus = preset.xp"
          :class="[
            'p-2 rounded-lg border-2 text-center cursor-pointer transition-all active:scale-95',
            teamSynergyBonus === preset.xp
              ? 'bg-[#1a1008] border-[#f0d060] shadow-[0_0_10px_rgba(240,208,96,0.3)]'
              : 'bg-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e]'
          ]"
        >
          <span class="text-[8px] text-[#a08060] font-bold uppercase block">{{ preset.label }}</span>
          <span class="font-pixel text-xs text-[#f0d060] mt-0.5 block">+{{ preset.xp }} XP</span>
        </button>
      </div>

      <!-- Checklist Kriteria Singkat -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        <label
          v-for="(crit, idx) in synergyCriteria"
          :key="idx"
          class="flex items-center gap-2 p-1.5 bg-[#170f07] border border-[#5a3a18] rounded-lg cursor-pointer"
        >
          <input
            type="checkbox"
            v-model="crit.checked"
            class="h-3.5 w-3.5 rounded bg-[#170f07] border-[#5a3a18] text-[#ca8a04] focus:ring-0 cursor-pointer"
          />
          <span class="text-[10px] text-[#f0e0c0]">{{ crit.text }}</span>
        </label>
      </div>
    </div>

    <!-- Section 2: Star Maba Teraktif (Official UNU Majors) -->
    <div class="sdv-card p-3 space-y-2.5">
      <div class="flex items-center justify-between border-b border-[#5a3a18] pb-2">
        <div class="flex items-center gap-2">
          <Star class="h-4 w-4 text-[#f0d060]" />
          <div>
            <h2 class="font-pixel text-[10px] sm:text-[11px] text-[#fef08a] font-bold">
              2. STAR MABA TERAKTIF
            </h2>
            <span class="text-[9px] text-[#c4956a]">Penghargaan maba teladan</span>
          </div>
        </div>
        <span class="font-pixel text-xs text-[#f0d060] font-bold bg-[#1a1008] px-2 py-0.5 rounded border border-[#f0d060]/50">
          +{{ starBonusXp }} XP
        </span>
      </div>

      <!-- Member Selector -->
      <div v-if="loading" class="p-4 text-center text-[#c4956a] font-mono text-xs">
        <div class="inline-block w-4 h-4 border-2 border-[#f0d060] border-t-transparent rounded-full animate-spin mb-1"></div>
        <div>Memuat anggota...</div>
      </div>
      <div v-else-if="activeMembers.length === 0" class="p-4 text-center text-[#c4956a] font-mono text-xs">
        Belum ada anggota terdaftar.
      </div>
      <div v-else class="space-y-1">
        <div class="grid grid-cols-1 gap-1.5">
          <div
            v-for="m in activeMembers"
            :key="m.id"
            @click="selectedStarId = m.id"
            :class="[
              'p-2 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all active:scale-98',
              selectedStarId === m.id
                ? 'bg-[#1a1008] border-[#f0d060] shadow-[0_0_10px_rgba(240,208,96,0.25)]'
                : 'bg-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e]'
            ]"
          >
            <div class="flex items-center gap-2">
              <img
                :src="m.avatarUrl"
                :alt="m.fullName"
                class="w-7 h-7 rounded border border-[#f0d060] bg-black/40 shrink-0"
              />
              <div class="min-w-0">
                <span class="font-bold text-xs text-white block truncate">
                  {{ m.fullName }}
                </span>
                <span class="text-[9px] text-[#c4956a] font-mono truncate">
                  NIM {{ m.username }} &bull; <strong class="text-[#f0d060]">{{ m.prodi }}</strong>
                </span>
              </div>
            </div>

            <div class="shrink-0 ml-2">
              <span
                v-if="selectedStarId === m.id"
                class="font-pixel text-[8px] text-[#f0d060] bg-[#2d1b0e] px-1.5 py-0.5 rounded border border-[#f0d060] flex items-center gap-1"
              >
                <Star class="h-2.5 w-2.5 fill-[#f0d060]" />
                BINTANG
              </span>
              <div
                v-else
                class="w-3.5 h-3.5 rounded-full border border-[#5a3a18]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Pesan Apresiasi Buddy -->
    <div class="sdv-card p-3 space-y-1.5">
      <div class="flex items-center gap-2 border-b border-[#5a3a18] pb-1.5">
        <MessageSquareQuote class="h-4 w-4 text-[#f0d060]" />
        <h2 class="font-pixel text-[10px] sm:text-[11px] text-[#fef08a] font-bold">
          3. PESAN KELULUSAN DARI BUDDY
        </h2>
      </div>

      <textarea
        v-model="buddyNote"
        rows="2"
        placeholder="Tuliskan apresiasi singkat untuk adik-adik bimbingan..."
        class="w-full bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg p-2 text-xs text-white outline-none resize-none font-sans"
      ></textarea>
    </div>

    <!-- Summary Box & Submit CTA -->
    <div class="sdv-card-gold p-3 space-y-2">
      <div class="flex items-center justify-between text-xs font-mono">
        <span class="text-[#c4956a]">Distribusi Poin:</span>
        <span class="font-pixel text-[#86efac] text-sm font-bold">
          +{{ totalDistributedXp }} XP
        </span>
      </div>

      <button
        type="button"
        @click="saveDay3Bonus"
        class="rpg-btn-primary w-full h-10 font-pixel text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer active:scale-98"
      >
        <Save class="h-4 w-4" />
        <span>{{ submitting ? 'MENYIMPAN...' : (isSubmitted ? 'PERBARUI POIN BONUS' : 'SIMPAN & DISTRIBUSIKAN POIN') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Gift,
  Award,
  Star,
  MessageSquareQuote,
  Save,
  CheckCircle2,
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useApi } from "@/composables/useApi";

const { user } = useAuth();
const api = useApi();

const loading = ref(true);
const submitting = ref(false);
const activeTeamId = ref<string>("");
const teamName = ref<string>("Genius 01");

interface Member {
  id: string;
  fullName: string;
  username: string; // NIM
  prodi: string; // Jurusan / Class
  avatarUrl: string;
  totalXp: number;
}

const activeMembers = ref<Member[]>([]);

const currentTeamName = computed(() => {
  return teamName.value || user.value?.teamName || "Genius 01";
});

const teamSynergyBonus = ref(100);
const starBonusXp = 150;
const selectedStarId = ref("");
const buddyNote = ref("Selamat telah menyelesaikan seluruh petualangan PKKMB UNU 2026!");
const isSubmitted = ref(false);

const synergyPresets = [
  { xp: 50, label: "Cukup" },
  { xp: 100, label: "Solid" },
  { xp: 150, label: "Juara" },
];

const synergyCriteria = ref([
  { text: "Kehadiran 100% lengkap 3 hari", checked: true },
  { text: "Yel-yel kelompok kompak & tertib", checked: true },
  { text: "Menyelesaikan 18 pos eksplorasi", checked: true },
  { text: "Saling tolong & menjaga kebersihan", checked: true },
]);

const totalDistributedXp = computed(() => {
  let total = activeMembers.value.length * teamSynergyBonus.value;
  if (selectedStarId.value) {
    total += starBonusXp;
  }
  return total;
});

async function saveDay3Bonus() {
  if (submitting.value) return;
  submitting.value = true;

  try {
    const promises: Promise<any>[] = [];

    // 1. Award synergy bonus to all active members
    for (const m of activeMembers.value) {
      promises.push(
        api.post("/api/scores", {
          participantId: m.id,
          teamId: activeTeamId.value,
          amount: teamSynergyBonus.value,
          sourceType: "BONUS",
          reason: `Bonus Kekompakan Regu Hari 3: ${buddyNote.value.slice(0, 50)}`,
        })
      );
    }

    // 2. Award star maba bonus
    if (selectedStarId.value) {
      promises.push(
        api.post("/api/scores", {
          participantId: selectedStarId.value,
          teamId: activeTeamId.value,
          amount: starBonusXp,
          sourceType: "BONUS",
          reason: "Penghargaan Star Maba Teraktif Regu Hari Ke-3",
        })
      );
    }

    await Promise.allSettled(promises);
    isSubmitted.value = true;
  } catch (err: any) {
    console.error("Gagal mendistribusikan bonus:", err);
  } finally {
    submitting.value = false;
  }
}

async function loadData() {
  loading.value = true;
  try {
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
      activeTeamId.value = targetTeamId;
      const teamRes = await api.get<{ success: boolean; data: any }>(`/api/teams/${targetTeamId}`);

      if (teamRes.success && teamRes.data) {
        teamName.value = teamRes.data.name || "Genius 01";
        const rawMembers = (teamRes.data.members || []).filter(
          (m: any) => m.role === "PARTICIPANT" || !m.role
        );

        activeMembers.value = rawMembers.map((m: any) => ({
          id: m.userId || m.id,
          fullName: m.fullName || "Mahasiswa",
          username: m.username || "-",
          prodi: m.characterClass || m.characterTitle || "Informatika",
          avatarUrl: m.avatarUrl || "/character-cowok-avatar.png",
          totalXp: Number(m.totalScore || 0),
        }));

        if (activeMembers.value.length > 0 && !selectedStarId.value) {
          selectedStarId.value = activeMembers.value[0].id;
        }
      }
    }
  } catch (err: any) {
    console.error("Gagal memuat anggota regu untuk bonus:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
