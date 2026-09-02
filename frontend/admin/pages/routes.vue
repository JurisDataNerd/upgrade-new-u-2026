<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCreateRouteModal"
        title="Buat Rute Baru"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">BUAT RUTE BARU</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchRoutes"
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
            placeholder="Cari nama rute atau alur waypoint..."
            class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
          />
        </div>

        <div class="font-mono text-[11px] text-muted-foreground">
          Total: <strong class="text-[#f59e0b]">{{ filteredRoutes.length }}</strong> Rute Terdaftar
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Grid) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Core Route Pathway Cards (Pixel Grid) -->
      <div class="space-y-4">
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="pixel-card p-4 animate-pulse h-48 bg-[#271d15]"></div>
      </div>

      <div v-else-if="filteredRoutes.length === 0" class="pixel-card p-8 text-center text-xs text-muted-foreground font-mono">
        Tidak ada rute perjalanan ditemukan.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div
          v-for="r in filteredRoutes"
          :key="r.id"
          class="pixel-card p-4 space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2.5">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="px-1.5 py-0.5 text-[8px] font-pixel border border-[#ca8a04]/80 bg-[#2b2014] text-[#facc15] inline-block mb-1">
                  STAGE 1
                </span>
                <h3 class="font-pixel text-xs sm:text-sm font-bold text-foreground">{{ r.name }}</h3>
                <p class="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {{ r.description || 'Rute rotasi lokasi tim' }}
                </p>
              </div>

              <span
                :class="[
                  'px-1.5 py-0.5 text-[8px] font-pixel border',
                  r.status === 'ACTIVE'
                    ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                    : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                ]"
              >
                {{ r.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
              </span>
            </div>

            <!-- Waypoint Flow Visual -->
            <div class="border border-[#4a3624] bg-[#15100c] p-2.5 font-mono text-xs space-y-1.5">
              <div class="text-[10px] text-muted-foreground flex items-center justify-between">
                <span>SEKUENS WAYPOINT:</span>
                <span class="text-[#facc15] font-bold">3 Checkpoint</span>
              </div>

              <div class="flex items-center gap-1.5 overflow-x-auto py-1">
                <span class="px-2 py-0.5 bg-[#271d15] border border-[#ca8a04] text-[#facc15] font-pixel text-[9px]">
                  POS 1 (L2)
                </span>
                <span class="text-[#f59e0b]">▶</span>
                <span class="px-2 py-0.5 bg-[#271d15] border border-[#38bdf8] text-[#38bdf8] font-pixel text-[9px]">
                  POS 2 (L5)
                </span>
                <span class="text-[#f59e0b]">▶</span>
                <span class="px-2 py-0.5 bg-[#271d15] border border-[#4ade80] text-[#4ade80] font-pixel text-[9px]">
                  POS 3 (L8)
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t border-[#3d2d1e] pt-2 flex items-center justify-between">
            <span class="text-[10px] font-mono text-muted-foreground">
              Alokasi: <strong class="text-foreground">~16 Tim</strong>
            </span>

            <div class="flex items-center gap-1">
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center text-xs"
                title="Edit Rute"
                @click="openEditRouteModal(r)"
              >
                <Edit class="h-3.5 w-3.5" />
              </button>
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                title="Hapus Rute"
                @click="confirmDelete(r)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Modal: Buat / Edit Rute -->
    <Dialog :open="showRouteModal" @update:open="showRouteModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Route class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT RUTE PERJALANAN' : 'BUAT RUTE BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitRouteForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Nama Rute:</Label>
            <input
              v-model="form.name"
              placeholder="Contoh: Rute A (Lantai Genap)"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Deskripsi Alur:</Label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Penjelasan alur rotasi tim..."
              class="w-full bg-[#15100c] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-[#f59e0b]"
            ></textarea>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Status Rute:</Label>
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
              @click="showRouteModal = false"
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
  Route,
  Plus,
  RotateCw,
  Search,
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
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const saving = ref(false);
const routes = ref<any[]>([]);
const searchQuery = ref("");

const showRouteModal = ref(false);
const isEditing = ref(false);

const form = ref({
  id: "",
  name: "",
  description: "",
  status: "ACTIVE",
});

const filteredRoutes = computed(() => {
  if (!searchQuery.value.trim()) return routes.value;
  const q = searchQuery.value.toLowerCase().trim();
  return routes.value.filter((r) => r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
});

async function fetchRoutes() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/routes");
    if (res.success && res.data) {
      routes.value = res.data;
    }
  } catch (err) {
    console.error("Failed to load routes:", err);
  } finally {
    loading.value = false;
  }
}

function openCreateRouteModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    name: "",
    description: "",
    status: "ACTIVE",
  };
  showRouteModal.value = true;
}

function openEditRouteModal(r: any) {
  isEditing.value = true;
  form.value = {
    id: r.id,
    name: r.name,
    description: r.description || "",
    status: r.status || "ACTIVE",
  };
  showRouteModal.value = true;
}

async function submitRouteForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/routes/${form.value.id}`, {
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
      });
    } else {
      await api.post("/api/routes", {
        name: form.value.name,
        description: form.value.description,
      });
    }
    showRouteModal.value = false;
    await fetchRoutes();
  } catch (err: any) {
    alert("Gagal menyimpan rute: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(r: any) {
  if (confirm(`Hapus rute '${r.name}'?`)) {
    try {
      await api.del(`/api/routes/${r.id}`);
      await fetchRoutes();
    } catch (err: any) {
      alert("Gagal menghapus rute: " + err.message);
    }
  }
}

onMounted(() => {
  fetchRoutes();
});
</script>
