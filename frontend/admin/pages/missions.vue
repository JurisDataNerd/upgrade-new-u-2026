<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCreateModal"
        title="Buat Misi Baru"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">BUAT MISI BARU</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchMissions"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Sticky Top Pixel Toolbar (Flush nempel Topbar) -->
    <div class="pixel-toolbar-sticky px-4 md:px-6 py-2.5 space-y-2 shrink-0">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari nama misi atau lantai..."
            class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
          />
        </div>

        <div class="font-mono text-[11px] text-muted-foreground">
          Total: <strong class="text-[#f59e0b]">{{ filteredMissions.length }}</strong> Misi Aktif
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Grid) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Quests Grid (Pixel Theme) -->
      <div class="space-y-4">
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="pixel-card p-4 animate-pulse h-40 bg-[#271d15]"></div>
      </div>

      <div v-else-if="paginatedMissions.length === 0" class="pixel-card p-8 text-center text-xs text-muted-foreground font-mono">
        Tidak ada misi ditemukan.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="m in paginatedMissions"
          :key="m.id"
          class="pixel-card p-4 space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2.5">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 border-2 border-[#ca8a04] bg-[#271d15] flex items-center justify-center font-pixel text-xs text-[#facc15] shrink-0">
                  <Gamepad2 class="h-4 w-4" />
                </div>
                <div>
                  <div class="font-bold text-foreground text-xs leading-tight">
                    {{ m.title }}
                  </div>
                  <div class="font-mono text-[10px] text-[#38bdf8]">
                    {{ m.locationName || 'Lokasi Kampus' }}
                  </div>
                </div>
              </div>

              <span
                :class="[
                  'px-1.5 py-0.5 text-[8px] font-pixel border',
                  m.status === 'ACTIVE'
                    ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                    : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                ]"
              >
                {{ m.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
              </span>
            </div>

            <!-- Description / Points -->
            <p class="text-[11px] font-mono text-muted-foreground line-clamp-2">
              {{ m.description || 'Selesaikan tantangan di pos ini bersama tim.' }}
            </p>

            <div class="flex items-center justify-between border border-[#4a3624] bg-[#15100c] px-2.5 py-1.5 font-mono text-xs">
              <span class="text-muted-foreground text-[10px]">REWARD MAKS:</span>
              <span class="text-[#4ade80] font-pixel text-[10px]">
                {{ m.maxPoints || 100 }} PTS
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t border-[#3d2d1e] pt-2 flex items-center justify-between">
            <span class="text-[10px] font-mono text-[#facc15]">
              Game: {{ m.gameType || 'Speed Reflex' }}
            </span>

            <div class="flex items-center gap-1">
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center text-xs"
                title="Edit Misi"
                @click="openEditModal(m)"
              >
                <Edit class="h-3.5 w-3.5" />
              </button>
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                title="Hapus Misi"
                @click="confirmDelete(m)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Sticky Bottom Dashboard Footer: Pixel Pagination -->
    <PixelPagination
      :current-page="currentPage"
      :total-items="filteredMissions.length"
      :page-size="pageSize"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Buat / Edit Misi -->
    <Dialog :open="showMissionModal" @update:open="showMissionModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Target class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT MISI TANTANGAN' : 'BUAT MISI BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitMissionForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Judul Misi:</Label>
            <input
              v-model="form.title"
              placeholder="Contoh: Speed Reflex Challenge Lantai 5"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Tipe Mini Game:</Label>
            <select
              v-model="form.gameType"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="SPEED_REFLEX">Speed Reflex (Refleks Cepat)</option>
              <option value="MEMORY_MATCH">Memory Match (Tebak Pola)</option>
              <option value="TEAM_QUIZ">Team Quiz Hub (Kuis Wawasan)</option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Maksimal Skor Poin:</Label>
            <input
              type="number"
              v-model.number="form.maxPoints"
              placeholder="100"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Deskripsi Misi:</Label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Aturan main dan petunjuk..."
              class="w-full bg-[#15100c] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-[#f59e0b]"
            ></textarea>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Status Misi:</Label>
            <select
              v-model="form.status"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="ACTIVE">AKTIF</option>
              <option value="INACTIVE">NONAKTIF</option>
            </select>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showMissionModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>{{ isEditing ? 'SIMPAN' : 'BUAT' }}</span>
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
  Target,
  Plus,
  RotateCw,
  Search,
  Gamepad2,
  Edit,
  Trash2,
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
const saving = ref(false);
const missions = ref<any[]>([]);
const searchQuery = ref("");

// Pagination
const currentPage = ref(1);
const pageSize = ref(9);

const showMissionModal = ref(false);
const isEditing = ref(false);

const form = ref({
  id: "",
  title: "",
  gameType: "SPEED_REFLEX",
  maxPoints: 100,
  description: "",
  status: "ACTIVE",
});

const filteredMissions = computed(() => {
  if (!searchQuery.value.trim()) return missions.value;
  const q = searchQuery.value.toLowerCase().trim();
  return missions.value.filter((m) => m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q));
});

const paginatedMissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredMissions.value.slice(start, start + pageSize.value);
});

async function fetchMissions() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/missions");
    if (res.success && res.data) {
      missions.value = res.data;
    }
  } catch (err) {
    console.error("Failed to load missions:", err);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    title: "",
    gameType: "SPEED_REFLEX",
    maxPoints: 100,
    description: "",
    status: "ACTIVE",
  };
  showMissionModal.value = true;
}

function openEditModal(m: any) {
  isEditing.value = true;
  form.value = {
    id: m.id,
    title: m.title,
    gameType: m.gameType || "SPEED_REFLEX",
    maxPoints: m.maxPoints || 100,
    description: m.description || "",
    status: m.status || "ACTIVE",
  };
  showMissionModal.value = true;
}

async function submitMissionForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/missions/${form.value.id}`, {
        title: form.value.title,
        gameType: form.value.gameType,
        maxPoints: form.value.maxPoints,
        description: form.value.description,
        status: form.value.status,
      });
    } else {
      await api.post("/api/missions", {
        title: form.value.title,
        gameType: form.value.gameType,
        maxPoints: form.value.maxPoints,
        description: form.value.description,
      });
    }
    showMissionModal.value = false;
    await fetchMissions();
  } catch (err: any) {
    alert("Gagal menyimpan misi: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(m: any) {
  if (confirm(`Hapus misi '${m.title}'?`)) {
    try {
      await api.del(`/api/missions/${m.id}`);
      await fetchMissions();
    } catch (err: any) {
      alert("Gagal menghapus misi: " + err.message);
    }
  }
}

onMounted(() => {
  fetchMissions();
});
</script>
