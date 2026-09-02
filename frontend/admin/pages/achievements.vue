<template>
  <div class="p-4 md:p-6 space-y-6 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308] shadow-md transition-transform active:scale-95"
        @click="sync99Titles"
        :disabled="syncing"
        title="Sinkronkan seluruh 99 Gelar Codex resmi ke database"
      >
        <Sparkles :class="['h-3.5 w-3.5', syncing && 'animate-spin']" />
        <span class="hidden sm:inline">{{ syncing ? 'MENYINKRONKAN...' : 'SINKRONKAN 99 GELAR' }}</span>
      </button>

      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#8b5cf6] text-white border-[#a78bfa] flex items-center gap-1.5 hover:bg-[#7c3aed]"
        @click="openAwardModal"
        title="Sematkan Gelar"
      >
        <Award class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">SEMATKAN GELAR</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchAchievements"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Pustaka 99 gelar kehormatan petualang, sistem rarity (Rare, Epic, SR, SSR), syarat pembukaan, dan penganugerahan manual.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/60 bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15] flex items-center gap-1">
          <Sparkles class="h-3 w-3 text-amber-400" />
          {{ achievementsList.length }} GELAR CODEX
        </span>
      </div>
    </div>

    <!-- Quick Stats Breakdown by Rarity -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div class="pixel-card p-3 border-l-4 border-l-amber-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-gray-400 uppercase">TOTAL GELAR CODEX</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-[#facc15] mt-1">{{ achievementsList.length }}</div>
        <div class="text-[10px] font-mono text-gray-400 mt-0.5">Koleksi Terdaftar</div>
      </div>

      <div class="pixel-card p-3 border-l-4 border-l-blue-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-blue-400 uppercase">🟦 RARE (36)</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-blue-400 mt-1">
          {{ countByRarity('RARE') }}
        </div>
        <div class="text-[10px] font-mono text-gray-400 mt-0.5">Tier Inisiasi & Eksplorasi</div>
      </div>

      <div class="pixel-card p-3 border-l-4 border-l-purple-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-purple-400 uppercase">🟪 EPIC (33)</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-purple-400 mt-1">
          {{ countByRarity('EPIC') }}
        </div>
        <div class="text-[10px] font-mono text-gray-400 mt-0.5">Tier Mahir & Mini Games</div>
      </div>

      <div class="pixel-card p-3 border-l-4 border-l-amber-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-amber-400 uppercase">🟨 SR (20)</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-amber-400 mt-1">
          {{ countByRarity('SR') }}
        </div>
        <div class="text-[10px] font-mono text-gray-400 mt-0.5">Tier Master & Rekor Khusus</div>
      </div>

      <div class="pixel-card p-3 border-l-4 border-l-pink-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-pink-400 uppercase">🌈 SSR (10)</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-pink-400 mt-1">
          {{ countByRarity('SSR') }}
        </div>
        <div class="text-[10px] font-mono text-pink-300 mt-0.5">Tier Legenda Juara Umum</div>
      </div>
    </div>

    <!-- Search & Filter Toolbar -->
    <div class="pixel-toolbar-sticky p-3 space-y-3 bg-[#17120d] border border-[#3d2d1e] rounded-lg">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari nama gelar, deskripsi, atau kategori..."
            class="w-full h-8 text-xs font-mono pl-8 pr-3 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <div class="font-mono text-xs text-gray-400">
          Menampilkan: <strong class="text-[#f59e0b]">{{ filteredAchievements.length }}</strong> Gelar
        </div>
      </div>

      <!-- Rarity Filter Badges -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-mono">
        <button
          v-for="tab in RARITY_TABS"
          :key="tab.value"
          @click="selectedRarity = tab.value"
          :class="[
            'px-3 py-1.5 rounded border whitespace-nowrap flex items-center gap-1.5 transition-all font-bold',
            selectedRarity === tab.value
              ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
              : 'bg-[#0e0c0a] text-gray-400 border-[#3d2d1e] hover:border-gray-500'
          ]"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span class="px-1.5 py-0.2 rounded-full bg-black/50 text-[9px]">
            {{ tab.value === 'ALL' ? achievementsList.length : countByRarity(tab.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Achievements Grid Cards -->
    <div v-if="loading" class="py-16 text-center space-y-2">
      <RotateCw class="h-8 w-8 text-[#f59e0b] animate-spin mx-auto" />
      <p class="font-mono text-xs text-muted-foreground">Memuat 99 katalog gelar...</p>
    </div>

    <div v-else-if="filteredAchievements.length === 0" class="pixel-card p-12 text-center text-muted-foreground space-y-2 bg-[#140f0c]">
      <Trophy class="h-10 w-10 text-[#523e2b] mx-auto" />
      <p class="font-mono text-xs text-foreground font-bold">Tidak Ada Gelar yang Cocok</p>
      <p class="font-mono text-[11px]">Klik tombol "SINKRONKAN 99 GELAR CODEX" untuk memuat katalog lengkap.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="ach in filteredAchievements"
        :key="ach.id"
        class="pixel-card p-4 space-y-3 transition-all hover:border-[#f59e0b] group flex flex-col justify-between bg-[#15110d] rounded-xl relative overflow-hidden"
        :style="{ borderColor: getRarityBorderColor(ach) }"
      >
        <!-- Ambient Top Glow -->
        <div
          class="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
          :style="{ background: getRarityColor(ach) }"
        ></div>

        <div class="space-y-3">
          <!-- Card Header with Clean Icon & Rarity Badge -->
          <div class="flex items-start justify-between gap-2.5">
            <div class="flex items-center gap-3">
              <!-- Icon Frame (Clean Emoji / Symbol Display without raw text) -->
              <div
                class="h-11 w-11 shrink-0 flex items-center justify-center border-2 rounded-lg text-2xl shadow-md select-none"
                :style="{
                  borderColor: getRarityColor(ach),
                  backgroundColor: getRarityBg(ach),
                }"
              >
                {{ getCleanEmoji(ach.icon) }}
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded"
                    :style="{
                      backgroundColor: getRarityBg(ach),
                      color: getRarityColor(ach),
                      border: `1px solid ${getRarityColor(ach)}66`,
                    }"
                  >
                    {{ getRarityShortLabel(ach) }}
                  </span>
                  <span v-if="ach.condition?.category" class="text-[9px] font-mono text-gray-400">
                    {{ ach.condition.category }}
                  </span>
                </div>

                <h3 class="font-pixel text-xs sm:text-sm font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">
                  {{ ach.title || ach.name }}
                </h3>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p class="text-[11px] font-mono text-gray-300 line-clamp-2 leading-relaxed">
            {{ ach.description || 'Gelar kehormatan mahasiswa dalam petualangan GENIUS 2026.' }}
          </p>

          <!-- Condition & Unlock Rule Box -->
          <div class="border border-[#3d2d1e] bg-[#0c0a08] p-2.5 rounded-lg font-mono text-xs space-y-1">
            <div class="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
              <span>Syarat Perolehan:</span>
            </div>
            <div class="text-gray-300 text-[11px]">
              {{ formatUnlockCondition(ach) }}
            </div>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="border-t border-[#2b2014] pt-2.5 flex items-center justify-between">
          <span class="text-[10px] font-mono text-gray-500">
            {{ ach.condition?.associatedClass ? `Khusus: ${ach.condition.associatedClass}` : 'Terbuka untuk Semua Kelas' }}
          </span>

          <div class="flex items-center gap-1.5">
            <button
              class="px-2.5 py-1.5 border border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-purple-300 hover:bg-[#8b5cf6]/30 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              title="Sematkan Gelar ini ke Peserta Tertentu"
              @click="openAwardSpecificModal(ach)"
            >
              <Award class="h-3.5 w-3.5" />
              <span>Sematkan</span>
            </button>

            <button
              class="h-8 w-8 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] rounded flex items-center justify-center text-xs transition-colors"
              title="Hapus Gelar"
              @click="confirmDelete(ach)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: SEMATKAN GELAR KE PESERTA -->
    <Dialog :open="showAwardModal" @update:open="showAwardModal = $event">
      <DialogContent class="sm:max-w-[480px] pixel-card border-2 border-[#8b5cf6] bg-[#140f0c] text-foreground p-5">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-purple-400 flex items-center gap-2">
            <Award class="h-4 w-4" />
            <span>SEMATKAN GELAR KE PESERTA</span>
          </DialogTitle>
          <p class="text-xs font-mono text-gray-400 mt-0.5">
            Gelar yang disematkan akan langsung menjadi <strong>1 Active Title</strong> pada KTM & profil peserta.
          </p>
        </DialogHeader>

        <form @submit.prevent="submitAwardForm" class="space-y-3 py-2 font-mono text-xs">
          <!-- Pilih Peserta -->
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Mahasiswa / Peserta:</Label>
            <select
              v-model="awardForm.participantId"
              class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-purple-400"
              required
            >
              <option value="" disabled>-- Pilih Mahasiswa --</option>
              <option v-for="p in participantsList" :key="p.id" :value="p.id">
                {{ p.name }} (@{{ p.username }}) · Saat ini: [{{ p.characterTitle || 'Novice Adventurer' }}]
              </option>
            </select>
          </div>

          <!-- Pilih Gelar dari 99 Codex -->
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Gelar yang Diberikan:</Label>
            <select
              v-model="awardForm.title"
              class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-purple-400"
              required
            >
              <option value="" disabled>-- Pilih Gelar dari Codex --</option>
              <option v-for="a in achievementsList" :key="a.id" :value="a.title">
                [{{ getRarityShortLabel(a) }}] {{ a.title }} ({{ a.condition?.category || 'Umum' }})
              </option>
            </select>
          </div>

          <!-- Alasan Penganugerahan -->
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Alasan / Catatan Penghargaan (Opsional):</Label>
            <textarea
              v-model="awardForm.reason"
              rows="2"
              placeholder="Contoh: Juara 1 Mini Quiz Sesi Pagi Lantai 2"
              class="w-full bg-[#0e0c0a] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-purple-400"
            ></textarea>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2 border-t border-[#3d2d1e]">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground rounded"
              @click="showAwardModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#8b5cf6] text-white border-[#a78bfa] font-bold shadow-md"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>SEMATKAN GELAR SEKARANG</span>
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
  Award,
  Sparkles,
  RotateCw,
  Search,
  Trash2,
  X,
} from "lucide-vue-next";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const saving = ref(false);
const syncing = ref(false);
const achievementsList = ref<any[]>([]);
const participantsList = ref<any[]>([]);
const searchQuery = ref("");
const selectedRarity = ref("ALL");

const showAwardModal = ref(false);

const RARITY_TABS = [
  { value: "ALL", label: "Semua Gelar", icon: "🏆" },
  { value: "RARE", label: "🟦 Rare (36)", icon: "🟦" },
  { value: "EPIC", label: "🟪 Epic (33)", icon: "🟪" },
  { value: "SR", label: "🟨 SR (20)", icon: "🟨" },
  { value: "SSR", label: "🌈 SSR (10)", icon: "🌈" },
];

const awardForm = ref({
  participantId: "",
  title: "",
  reason: "",
});

const filteredAchievements = computed(() => {
  return achievementsList.value.filter((ach) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ach.name?.toLowerCase().includes(q) ||
      ach.title?.toLowerCase().includes(q) ||
      ach.description?.toLowerCase().includes(q) ||
      ach.condition?.category?.toLowerCase().includes(q);

    const rarity = ach.condition?.rarity || "RARE";
    const matchesRarity =
      selectedRarity.value === "ALL" || rarity === selectedRarity.value;

    return matchesSearch && matchesRarity;
  });
});

function countByRarity(r: string) {
  return achievementsList.value.filter((a) => {
    const rar = a.condition?.rarity || "RARE";
    return rar === r;
  }).length;
}

function getCleanEmoji(rawIcon?: string) {
  if (!rawIcon) return "🏆";
  if (rawIcon.length <= 4) return rawIcon; // Valid emoji like 🌈, 👑, ⚔️

  // Mapping known string icons to emojis
  const map: Record<string, string> = {
    "boot-outline": "🥾",
    "compass-outline": "🧭",
    "sparkles": "✨",
    "heart-handshake": "🤝",
    "trophy-award": "🏆",
    "shield-check": "🛡️",
    "lightning-bolt": "⚡",
    "fire": "🔥",
    "brain": "🧠",
    "palette": "🎨",
    "puzzle-piece": "🧩",
    "crown": "👑",
    "star": "⭐",
  };

  return map[rawIcon] || "🏆";
}

function getRarityShortLabel(ach: any) {
  const r = ach.condition?.rarity || "RARE";
  return r;
}

function getRarityColor(ach: any) {
  const r = ach.condition?.rarity || "RARE";
  switch (r) {
    case "SSR":
      return "#ec4899"; // Pink
    case "SR":
      return "#f59e0b"; // Gold
    case "EPIC":
      return "#a855f7"; // Purple
    case "RARE":
    default:
      return "#38bdf8"; // Cyan
  }
}

function getRarityBorderColor(ach: any) {
  const r = ach.condition?.rarity || "RARE";
  switch (r) {
    case "SSR":
      return "#ec489966";
    case "SR":
      return "#f59e0b55";
    case "EPIC":
      return "#a855f755";
    case "RARE":
    default:
      return "#38bdf844";
  }
}

function getRarityBg(ach: any) {
  const r = ach.condition?.rarity || "RARE";
  switch (r) {
    case "SSR":
      return "rgba(236, 72, 153, 0.15)";
    case "SR":
      return "rgba(245, 158, 11, 0.15)";
    case "EPIC":
      return "rgba(168, 85, 247, 0.15)";
    case "RARE":
    default:
      return "rgba(56, 189, 248, 0.15)";
  }
}

function formatUnlockCondition(ach: any) {
  const cond = ach.condition || {};
  if (cond.unlockType === "DEFAULT") return "Gelar Bawaan Awal (Unlocked by Default)";
  if (cond.unlockType === "POINTS") return `Mencapai Akumulasi Minimal ${cond.requiredPoints || 100} PTS`;
  if (cond.unlockType === "TIER") return `Mencapai Evolusi Karakter Tier ${cond.requiredTier || 2}`;
  if (cond.unlockType === "SPECIAL") return "Penyelesaian Misi Rahasia / Grand Boss Raid Lantai 9";
  if (cond.unlockType === "ADMIN") return "Penganugerahan Khusus oleh Game Master / Admin";
  return "Penyelesaian Tantangan Pos & Milestone";
}

async function fetchAchievements() {
  loading.value = true;
  try {
    const res: any = await api.get("/api/achievements");
    if (res.success && res.data) {
      achievementsList.value = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch achievements:", err);
  } finally {
    loading.value = false;
  }
}

async function fetchParticipants() {
  try {
    const res: any = await api.get("/api/users?role=PARTICIPANT&pageSize=100");
    if (res.success && res.data) {
      participantsList.value = res.data;
    }
  } catch (err) {
    console.warn("Failed to fetch participants:", err);
  }
}

async function sync99Titles() {
  syncing.value = true;
  try {
    const res: any = await api.post("/api/achievements/sync-99-titles", {});
    if (res.success) {
      await fetchAchievements();
      alert(res.message || "Berhasil menyinkronkan 99 Gelar Codex!");
    }
  } catch (err: any) {
    alert("Gagal sinkronisasi: " + (err.message || "Error"));
  } finally {
    syncing.value = false;
  }
}

function openAwardModal() {
  awardForm.value = {
    participantId: participantsList.value[0]?.id || "",
    title: achievementsList.value[0]?.title || "",
    reason: "",
  };
  showAwardModal.value = true;
}

function openAwardSpecificModal(ach: any) {
  awardForm.value = {
    participantId: participantsList.value[0]?.id || "",
    title: ach.title,
    reason: "",
  };
  showAwardModal.value = true;
}

async function submitAwardForm() {
  saving.value = true;
  try {
    const res: any = await api.post("/api/achievements/award-to-participant", {
      participantId: awardForm.value.participantId,
      title: awardForm.value.title,
      reason: awardForm.value.reason,
    });

    if (res.success) {
      alert(res.message || "Gelar berhasil disematkan!");
      showAwardModal.value = false;
      await fetchParticipants();
    }
  } catch (err: any) {
    alert("Gagal menyematkan gelar: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(ach: any) {
  if (confirm(`Hapus gelar '${ach.title}'?`)) {
    try {
      await api.del(`/api/achievements/${ach.id}`);
      await fetchAchievements();
    } catch (err: any) {
      alert("Gagal menghapus gelar: " + err.message);
    }
  }
}

onMounted(() => {
  fetchAchievements();
  fetchParticipants();
});
</script>
