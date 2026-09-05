<template>
  <div class="space-y-3 pb-8 select-none font-sans text-[#f0e0c0]">
    <!-- Compact Header -->
    <div class="sdv-card-gold p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <span class="border border-[#f0d060] bg-[#1a1008] px-1.5 py-0.5 text-[8px] font-pixel text-[#f0d060] uppercase tracking-wider rounded">
            EVALUASI BUDDY
          </span>
          <h1 class="font-pixel text-xs sm:text-sm text-[#fef08a] font-bold mt-1 flex items-center gap-1.5 uppercase">
            <FileEdit class="h-4 w-4 text-[#facc15]" />
            <span>NILAI FGD SANTRI</span>
          </h1>
        </div>

        <span class="border-2 border-[#f0d060] bg-[#1a1008] px-2.5 py-1 text-[9px] font-pixel text-[#facc15] rounded-lg shrink-0 shadow">
          {{ selectedSession }}
        </span>
      </div>

      <!-- Sesi Selector Tabs -->
      <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
        <button
          v-for="s in fgdSessions"
          :key="s.id"
          type="button"
          @click="selectedSession = s.id"
          :class="[
            'p-2 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center font-mono active:scale-95',
            selectedSession === s.id
              ? 'bg-[#ca8a04] border-[#facc15] text-[#16110d] font-bold shadow'
              : 'bg-[#1e140c] border-[#5a3a18] text-[#c4956a] hover:border-[#f0d060]'
          ]"
        >
          <span class="font-pixel text-[10px]">{{ s.id }}</span>
          <span class="text-[8px] truncate mt-0.5">{{ s.dayLabel }}</span>
        </button>
      </div>

      <!-- Topic Pill -->
      <div class="px-2.5 py-1.5 bg-[#170f07] border border-[#5a3a18] rounded-lg flex items-center justify-between text-[11px]">
        <span class="text-[#86efac] font-bold truncate">{{ currentSessionInfo?.topic }}</span>
        <span class="text-[9px] text-[#a08060] font-mono shrink-0 ml-2">Maks +200 XP</span>
      </div>
    </div>

    <!-- Member Carousel (Clean, shows UNU prodi) -->
    <div class="space-y-1">
      <span class="font-pixel text-[8px] text-[#f0d060] uppercase tracking-wider block px-1">
        PILIH MAHASISWA:
      </span>
      <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          v-for="m in teamMembers"
          :key="m.id"
          type="button"
          @click="selectMember(m)"
          :class="[
            'p-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 min-w-[160px] text-left active:scale-98',
            selectedMember?.id === m.id
              ? 'bg-[#3d2b1e] border-[#f0d060] shadow-[0_0_10px_rgba(240,208,96,0.3)]'
              : 'bg-[#1f150c] border-[#5a3a18] opacity-85 hover:opacity-100'
          ]"
        >
          <img
            :src="m.avatarUrl"
            :alt="m.fullName"
            class="h-8 w-8 rounded-lg border border-[#f0d060] object-cover bg-black/40 shrink-0"
          />
          <div class="min-w-0">
            <div class="font-bold text-xs truncate font-sans text-white">{{ m.fullName }}</div>
            <div class="text-[9px] text-[#f0d060] truncate font-mono">{{ m.prodi }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Rubrik Penilaian 3 Pilar (Compact, Punchy) -->
    <div v-if="selectedMember" class="sdv-card p-3 sm:p-4 space-y-3">
      <!-- Target Member Header -->
      <div class="flex items-center justify-between border-b border-[#5a3a18] pb-2">
        <div class="flex items-center gap-2.5">
          <img
            :src="selectedMember.avatarUrl"
            :alt="selectedMember.fullName"
            class="h-9 w-9 rounded-lg border-2 border-[#f0d060] object-cover bg-black/40 shrink-0"
          />
          <div>
            <span class="text-[8px] font-pixel text-[#86efac] uppercase">MENILAI:</span>
            <h2 class="font-bold text-xs sm:text-sm text-[#fef08a] font-sans">
              {{ selectedMember.fullName }}
            </h2>
            <span class="text-[10px] text-[#c4956a] font-mono">
              NIM {{ selectedMember.username }} &bull; {{ selectedMember.prodi }}
            </span>
          </div>
        </div>

        <div class="text-right shrink-0">
          <span class="font-pixel text-sm sm:text-base text-[#86efac] font-bold block">
            +{{ calculatedXp }} XP
          </span>
          <span class="text-[9px] text-[#c4956a] font-mono">Total Skor: {{ totalScore }}/15</span>
        </div>
      </div>

      <!-- Pilar 1: Keaktifan Diskusi -->
      <div class="bg-[#170f07] border border-[#5a3a18] p-2.5 rounded-lg space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="font-pixel text-[9px] sm:text-[10px] text-[#f0d060] flex items-center gap-1.5">
            <Sparkles class="h-3.5 w-3.5 text-[#facc15]" />
            <span>1. KEAKTIFAN DISKUSI</span>
          </label>
          <span class="font-pixel text-xs text-[#86efac] font-bold">{{ scoreKeaktifan }}/5</span>
        </div>
        <div class="grid grid-cols-5 gap-1 font-pixel text-xs">
          <button
            v-for="val in 5"
            :key="val"
            type="button"
            @click="scoreKeaktifan = val"
            :class="[
              'h-8 rounded border transition-all cursor-pointer font-bold active:scale-95',
              scoreKeaktifan === val
                ? 'bg-[#ca8a04] text-[#16110d] border-[#facc15] shadow'
                : 'bg-[#271d15] text-[#c4956a] border-[#5a3a18] hover:border-[#f0d060]'
            ]"
          >
            {{ val }}
          </button>
        </div>
      </div>

      <!-- Pilar 2: Kedalaman Gagasan -->
      <div class="bg-[#170f07] border border-[#5a3a18] p-2.5 rounded-lg space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="font-pixel text-[9px] sm:text-[10px] text-[#f0d060] flex items-center gap-1.5">
            <Lightbulb class="h-3.5 w-3.5 text-[#38bdf8]" />
            <span>2. KEDALAMAN GAGASAN</span>
          </label>
          <span class="font-pixel text-xs text-[#38bdf8] font-bold">{{ scoreKedalaman }}/5</span>
        </div>
        <div class="grid grid-cols-5 gap-1 font-pixel text-xs">
          <button
            v-for="val in 5"
            :key="val"
            type="button"
            @click="scoreKedalaman = val"
            :class="[
              'h-8 rounded border transition-all cursor-pointer font-bold active:scale-95',
              scoreKedalaman === val
                ? 'bg-[#0284c7] text-white border-[#38bdf8] shadow'
                : 'bg-[#271d15] text-[#c4956a] border-[#5a3a18] hover:border-[#38bdf8]'
            ]"
          >
            {{ val }}
          </button>
        </div>
      </div>

      <!-- Pilar 3: Adab & Tawadhu' -->
      <div class="bg-[#170f07] border border-[#5a3a18] p-2.5 rounded-lg space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="font-pixel text-[9px] sm:text-[10px] text-[#f0d060] flex items-center gap-1.5">
            <HeartHandshake class="h-3.5 w-3.5 text-[#ec4899]" />
            <span>3. ADAB &amp; TAWADHU'</span>
          </label>
          <span class="font-pixel text-xs text-[#ec4899] font-bold">{{ scoreAdab }}/5</span>
        </div>
        <div class="grid grid-cols-5 gap-1 font-pixel text-xs">
          <button
            v-for="val in 5"
            :key="val"
            type="button"
            @click="scoreAdab = val"
            :class="[
              'h-8 rounded border transition-all cursor-pointer font-bold active:scale-95',
              scoreAdab === val
                ? 'bg-[#db2777] text-white border-[#f472b6] shadow'
                : 'bg-[#271d15] text-[#c4956a] border-[#5a3a18] hover:border-[#f472b6]'
            ]"
          >
            {{ val }}
          </button>
        </div>
      </div>

      <!-- Catatan Buddy Singkat -->
      <div class="space-y-1">
        <label class="font-pixel text-[8px] text-[#c4956a] uppercase block">
          CATATAN APRESIASI:
        </label>
        <input
          v-model="feedbackNotes"
          type="text"
          placeholder="Catatan motivasi singkat..."
          class="w-full bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-sans"
        />
      </div>

      <!-- Submit Action Button -->
      <button
        type="button"
        @click="submitFgdEvaluation"
        class="rpg-btn-primary w-full h-10 font-pixel text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer active:scale-98"
      >
        <CheckCircle2 class="h-4 w-4" />
        <span>SIMPAN NILAI (+{{ calculatedXp }} XP)</span>
      </button>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      class="fixed top-16 inset-x-4 max-w-md mx-auto z-50 p-2.5 bg-[#172513] border-2 border-[#22c55e] text-[#86efac] rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2"
    >
      <CheckCircle2 class="h-4 w-4 text-[#22c55e] shrink-0" />
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  FileEdit,
  Sparkles,
  Lightbulb,
  HeartHandshake,
  CheckCircle2,
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
const route = useRoute();

const fgdSessions = [
  { id: "FGD-1", dayLabel: "H-1 Pagi", topic: "Ke UNU Apa Yang Kau Cari?" },
  { id: "FGD-2", dayLabel: "H-1 Siang", topic: "Agent of Change & Bela Negara" },
  { id: "FGD-6", dayLabel: "H-3 Siang", topic: "Refleksi & Aksi Nyata Mahasiswa" },
];

const selectedSession = ref("FGD-1");

interface FgdMember {
  id: string;
  fullName: string;
  username: string; // NIM
  prodi: string; // Jurusan UNU Resmi
  avatarUrl: string;
}

const membersTeam01: FgdMember[] = [
  { id: "p1", fullName: "Ahmad Dahlan", username: "2611101", prodi: "Informatika", avatarUrl: "/character-cowok-avatar.png" },
  { id: "p2", fullName: "Fatimah Azzahra", username: "2611102", prodi: "Farmasi", avatarUrl: "/character-cewek-avatar.png" },
  { id: "p3", fullName: "Rian Pratama", username: "2611103", prodi: "Teknik Elektro", avatarUrl: "/character-cowok-avatar.png" },
  { id: "p4", fullName: "Siti Nurhaliza", username: "2611104", prodi: "Manajemen", avatarUrl: "/character-cewek-avatar.png" },
  { id: "p5", fullName: "Kevin Wijaya", username: "2611105", prodi: "PGSD", avatarUrl: "/character-cowok-avatar.png" },
];

const membersTeam03: FgdMember[] = [
  { id: "p6", fullName: "Ilham Ramadhan", username: "2611201", prodi: "Informatika", avatarUrl: "/character-cowok-avatar.png" },
  { id: "p7", fullName: "Putri Ayu", username: "2611202", prodi: "Farmasi", avatarUrl: "/character-cewek-avatar.png" },
  { id: "p8", fullName: "Bagas Saputra", username: "2611203", prodi: "Agribisnis", avatarUrl: "/character-cowok-avatar.png" },
  { id: "p9", fullName: "Annisa Maharani", username: "2611204", prodi: "Akuntansi", avatarUrl: "/character-cewek-avatar.png" },
  { id: "p10", fullName: "Fikri Haikal", username: "2611205", prodi: "Teknologi Hasil Pertanian", avatarUrl: "/character-cowok-avatar.png" },
];

const teamMembers = computed(() => {
  if (user.value?.teamId === "team-3" || user.value?.username === "buddy03") {
    return membersTeam03;
  }
  return membersTeam01;
});

const selectedMember = ref<FgdMember | null>(teamMembers.value[0] || null);

const scoreKeaktifan = ref(5);
const scoreKedalaman = ref(4);
const scoreAdab = ref(5);
const feedbackNotes = ref("Aktif berdiskusi dan santun");
const toastMessage = ref<string | null>(null);

const currentSessionInfo = computed(() => fgdSessions.find((s) => s.id === selectedSession.value));

const totalScore = computed(() => scoreKeaktifan.value + scoreKedalaman.value + scoreAdab.value);
// Rumus konversi XP: (skala 3-15) -> +40 s/d +200 XP
const calculatedXp = computed(() => Math.round((totalScore.value / 15) * 200));

const selectMember = (m: FgdMember) => {
  selectedMember.value = m;
  // Load previous score if exists in localStorage
  if (import.meta.client) {
    const key = `genius_fgd_${selectedSession.value}_${m.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        scoreKeaktifan.value = parsed.keaktifan || 5;
        scoreKedalaman.value = parsed.kedalaman || 4;
        scoreAdab.value = parsed.adab || 5;
        feedbackNotes.value = parsed.notes || "";
      } catch (e) {
        console.error(e);
      }
    }
  }
};

const submitFgdEvaluation = () => {
  if (!selectedMember.value) return;
  const xp = calculatedXp.value;
  toastMessage.value = `Nilai ${selectedMember.value.fullName} berhasil disimpan! (+${xp} XP)`;

  if (import.meta.client) {
    const key = `genius_fgd_${selectedSession.value}_${selectedMember.value.id}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        score: totalScore.value,
        xp,
        keaktifan: scoreKeaktifan.value,
        kedalaman: scoreKedalaman.value,
        adab: scoreAdab.value,
        notes: feedbackNotes.value,
        savedAt: new Date().toISOString(),
      })
    );
  }

  setTimeout(() => {
    toastMessage.value = null;
  }, 3000);
};

onMounted(() => {
  const queryParticipantId = route.query.participantId as string;
  if (queryParticipantId) {
    const found = teamMembers.value.find((m) => m.id === queryParticipantId);
    if (found) {
      selectMember(found);
      return;
    }
  }
  if (teamMembers.value.length > 0) {
    selectMember(teamMembers.value[0]);
  }
});
</script>
