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
      <div class="space-y-1">
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
        <span>{{ isSubmitted ? 'PERBARUI POIN BONUS' : 'SIMPAN & DISTRIBUSIKAN POIN' }}</span>
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

const { user } = useAuth();

const currentTeamName = computed(() => {
  const name = user.value?.teamName || "Genius 01";
  return name.replace(/^Team\s+/i, "").trim();
});

const teamSynergyBonus = ref(100);
const starBonusXp = 150;
const selectedStarId = ref("p1");
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

interface Member {
  id: string;
  fullName: string;
  username: string;
  prodi: string; // Jurusan UNU Resmi
  avatarUrl: string;
  totalXp: number;
}

// Data Mahasiswa dengan Prodi Resmi UNU Yogyakarta
const membersTeam01: Member[] = [
  { id: "p1", fullName: "Ahmad Dahlan", username: "2611101", prodi: "Informatika", avatarUrl: "/character-cowok-avatar.png", totalXp: 520 },
  { id: "p2", fullName: "Fatimah Azzahra", username: "2611102", prodi: "Farmasi", avatarUrl: "/character-cewek-avatar.png", totalXp: 480 },
  { id: "p3", fullName: "Rian Pratama", username: "2611103", prodi: "Teknik Elektro", avatarUrl: "/character-cowok-avatar.png", totalXp: 310 },
  { id: "p4", fullName: "Siti Nurhaliza", username: "2611104", prodi: "Manajemen", avatarUrl: "/character-cewek-avatar.png", totalXp: 420 },
  { id: "p5", fullName: "Kevin Wijaya", username: "2611105", prodi: "PGSD", avatarUrl: "/character-cowok-avatar.png", totalXp: 180 },
];

const membersTeam03: Member[] = [
  { id: "p6", fullName: "Ilham Ramadhan", username: "2611201", prodi: "Informatika", avatarUrl: "/character-cowok-avatar.png", totalXp: 560 },
  { id: "p7", fullName: "Putri Ayu", username: "2611202", prodi: "Farmasi", avatarUrl: "/character-cewek-avatar.png", totalXp: 450 },
  { id: "p8", fullName: "Bagas Saputra", username: "2611203", prodi: "Agribisnis", avatarUrl: "/character-cowok-avatar.png", totalXp: 390 },
  { id: "p9", fullName: "Annisa Maharani", username: "2611204", prodi: "Akuntansi", avatarUrl: "/character-cewek-avatar.png", totalXp: 410 },
  { id: "p10", fullName: "Fikri Haikal", username: "2611205", prodi: "Teknologi Hasil Pertanian", avatarUrl: "/character-cowok-avatar.png", totalXp: 340 },
];

const activeMembers = computed(() => {
  if (user.value?.teamId === "group-03" || user.value?.username === "buddy03") {
    return membersTeam03;
  }
  return membersTeam01;
});

const totalDistributedXp = computed(() => {
  let total = activeMembers.value.length * teamSynergyBonus.value;
  if (selectedStarId.value) {
    total += starBonusXp;
  }
  return total;
});

const loadSavedData = () => {
  if (import.meta.client) {
    const key = `genius_buddy_day3_bonus_${user.value?.teamId || "group-01"}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        teamSynergyBonus.value = parsed.teamSynergyBonus || 100;
        selectedStarId.value = parsed.selectedStarId || (activeMembers.value[0]?.id ?? "p1");
        buddyNote.value = parsed.buddyNote || "";
        isSubmitted.value = true;
      } catch (e) {
        console.error(e);
      }
    } else {
      selectedStarId.value = activeMembers.value[0]?.id ?? "p1";
    }
  }
};

const saveDay3Bonus = () => {
  if (import.meta.client) {
    const key = `genius_buddy_day3_bonus_${user.value?.teamId || "group-01"}`;
    const payload = {
      teamSynergyBonus: teamSynergyBonus.value,
      selectedStarId: selectedStarId.value,
      buddyNote: buddyNote.value,
      totalDistributedXp: totalDistributedXp.value,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    isSubmitted.value = true;
  }
};

onMounted(() => {
  loadSavedData();
});
</script>
