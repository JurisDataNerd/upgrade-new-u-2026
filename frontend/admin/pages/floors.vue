<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCreateLocationModal"
        title="Tambah Lokasi Baru"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">TAMBAH LOKASI</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchLocations"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Sticky Top Pixel Toolbar & Floor Selector (Flush nempel Topbar) -->
    <div class="pixel-toolbar-sticky px-4 md:px-6 py-2.5 space-y-2.5 shrink-0">
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          @click="selectFloor(0)"
          :class="[
            'h-7 px-2.5 text-xs font-pixel shrink-0 transition-colors border',
            selectedFloorNumber === 0
              ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
              : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
          ]"
        >
          SEMUA LANTAI
        </button>

        <button
          v-for="f in floorList"
          :key="f.number"
          @click="selectFloor(f.number)"
          :class="[
            'h-7 px-2 text-xs font-pixel shrink-0 transition-colors border',
            selectedFloorNumber === f.number
              ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
              : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
          ]"
        >
          L{{ f.number }}
        </button>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1 border-t border-[#4a3624]">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari nama lokasi, kode pos, atau ruangan..."
            class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
          />
        </div>

        <div class="font-mono text-[11px] text-muted-foreground">
          Total: <strong class="text-[#f59e0b]">{{ filteredLocations.length }}</strong> titik pos lokasi
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Grid) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Locations Grid (Pixel Theme) -->
      <div class="space-y-4">
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="pixel-card p-4 animate-pulse h-40 bg-[#271d15]"></div>
      </div>

      <div v-else-if="paginatedLocations.length === 0" class="pixel-card p-8 text-center text-xs text-muted-foreground font-mono">
        Tidak ada lokasi ditemukan pada filter ini.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="loc in paginatedLocations"
          :key="loc.id"
          class="pixel-card p-4 space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2.5">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 border-2 border-[#f59e0b] bg-[#271d15] flex items-center justify-center font-pixel text-xs text-[#f59e0b] shrink-0">
                  L{{ loc.floorNumber || 1 }}
                </div>
                <div>
                  <div class="font-bold text-foreground text-xs leading-tight">
                    {{ loc.name }}
                  </div>
                  <div class="font-mono text-[10px] text-[#facc15]">
                    LANTAI {{ loc.floorNumber || 1 }}
                  </div>
                </div>
              </div>

              <span
                :class="[
                  'px-1.5 py-0.5 text-[8px] font-pixel border',
                  loc.status === 'ACTIVE'
                    ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                    : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                ]"
              >
                {{ loc.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
              </span>
            </div>

            <!-- Description / Capacity -->
            <p class="text-[11px] font-mono text-muted-foreground line-clamp-2">
              {{ loc.description || 'Pos tantangan & checkpoint lokasi UNU.' }}
            </p>

            <div class="flex items-center justify-between border border-[#4a3624] bg-[#15100c] px-2.5 py-1.5 font-mono text-xs">
              <span class="text-muted-foreground text-[10px]">KAPASITAS:</span>
              <span class="text-[#4ade80] font-pixel text-[10px]">
                {{ loc.capacity || 10 }} TIM MAKS
              </span>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="border-t border-[#3d2d1e] pt-2 flex items-center justify-between">
            <button
              class="pixel-btn h-7 px-2.5 text-[10px] font-pixel bg-[#16222f] text-[#38bdf8] border-[#0284c7] flex items-center gap-1"
              @click="openQrModal(loc)"
            >
              <QrCode class="h-3 w-3" />
              <span>QR KODE</span>
            </button>

            <div class="flex items-center gap-1">
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center text-xs"
                title="Edit Lokasi"
                @click="openEditLocationModal(loc)"
              >
                <Edit class="h-3.5 w-3.5" />
              </button>
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                title="Hapus Lokasi"
                @click="confirmDelete(loc)"
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
      :total-items="filteredLocations.length"
      :page-size="pageSize"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Tambah / Edit Lokasi -->
    <Dialog :open="showLocationModal" @update:open="showLocationModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Building2 class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT LOKASI POS' : 'TAMBAH LOKASI POS BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitLocationForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Nama Lokasi / Ruangan:</Label>
            <input
              v-model="form.name"
              placeholder="Contoh: Lab AI & Multimedia"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Lantai Gedung (1 - 9):</Label>
            <select
              v-model.number="form.floorNumber"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            >
              <option v-for="f in floorList" :key="f.number" :value="f.number">
                Lantai {{ f.number }} — {{ f.name }}
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Kapasitas Maksimal Tim:</Label>
            <input
              type="number"
              v-model.number="form.capacity"
              placeholder="10"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Deskripsi / Petunjuk Lokasi:</Label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Petunjuk posisi ruangan..."
              class="w-full bg-[#15100c] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-[#f59e0b]"
            ></textarea>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Status Pos:</Label>
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
              @click="showLocationModal = false"
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

    <!-- Modal: View QR Code -->
    <Dialog :open="showQrModal" @update:open="showQrModal = $event">
      <DialogContent class="sm:max-w-[400px] pixel-card border-2 border-[#38bdf8] bg-[#1a140f] text-foreground text-center">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center justify-center gap-2">
            <QrCode class="h-4 w-4" />
            <span>QR CODE POS: {{ selectedLocForQr?.name }}</span>
          </DialogTitle>
        </DialogHeader>

        <div v-if="selectedLocForQr" class="space-y-3 py-2 font-mono text-xs">
          <!-- QR Code Visual -->
          <div class="mx-auto w-48 h-48 bg-white border-4 border-[#38bdf8] p-3 flex flex-col items-center justify-center shadow-lg">
            <div class="text-black font-arcade text-center text-xs leading-tight">
              GENIUS 2026
            </div>
            <div class="text-black font-mono text-[9px] mt-1 break-all text-center">
              {{ selectedLocForQr.qrCode || `QR-L${selectedLocForQr.floorNumber || 1}-${selectedLocForQr.id.slice(0, 6)}` }}
            </div>
          </div>

          <p class="text-[11px] text-muted-foreground">
            Cetak atau tampilkan QR ini di pintu masuk ruangan <strong>Lantai {{ selectedLocForQr.floorNumber || 1 }}</strong>.
          </p>

          <DialogFooter class="pt-2 flex justify-center">
            <button
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#0284c7] text-white border-[#38bdf8] font-bold"
              @click="showQrModal = false"
            >
              TUTUP
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Building2,
  Plus,
  RotateCw,
  Search,
  QrCode,
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
const locations = ref<any[]>([]);
const selectedFloorNumber = ref<number>(0);
const searchQuery = ref("");

// Pagination
const currentPage = ref(1);
const pageSize = ref(12);

const showLocationModal = ref(false);
const isEditing = ref(false);
const showQrModal = ref(false);
const selectedLocForQr = ref<any>(null);

const form = ref({
  id: "",
  name: "",
  floorNumber: 1,
  capacity: 10,
  description: "",
  status: "ACTIVE",
});

const floorList = [
  { number: 1, name: "Lobby & Atrium" },
  { number: 2, name: "Lab Komputer & AI" },
  { number: 3, name: "Inkubator Bisnis" },
  { number: 4, name: "Creative Space" },
  { number: 5, name: "Smart Classroom" },
  { number: 6, name: "Perpustakaan Digital" },
  { number: 7, name: "Fakultas & Riset" },
  { number: 8, name: "Auditorium Utama" },
  { number: 9, name: "Rooftop Lounge" },
];

const filteredLocations = computed(() => {
  let list = locations.value;
  if (selectedFloorNumber.value > 0) {
    list = list.filter((l) => Number(l.floorNumber) === selectedFloorNumber.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((l) => l.name?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
  }
  return list;
});

const paginatedLocations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLocations.value.slice(start, start + pageSize.value);
});

function selectFloor(num: number) {
  selectedFloorNumber.value = num;
  currentPage.value = 1;
}

async function fetchLocations() {
  loading.value = true;
  try {
    const res: any = await api.get("/api/floors/locations");
    const data = res?.data !== undefined ? res.data : res;
    if (Array.isArray(data)) {
      locations.value = data;
    }
  } catch (err) {
    console.error("Failed to load locations:", err);
  } finally {
    loading.value = false;
  }
}

function openCreateLocationModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    name: "",
    floorNumber: selectedFloorNumber.value > 0 ? selectedFloorNumber.value : 1,
    capacity: 10,
    description: "",
    status: "ACTIVE",
  };
  showLocationModal.value = true;
}

function openEditLocationModal(loc: any) {
  isEditing.value = true;
  form.value = {
    id: loc.id,
    name: loc.name,
    floorNumber: Number(loc.floorNumber) || 1,
    capacity: loc.capacity || 10,
    description: loc.description || "",
    status: loc.status || "ACTIVE",
  };
  showLocationModal.value = true;
}

async function submitLocationForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/floors/locations/${form.value.id}`, {
        name: form.value.name,
        floorNumber: form.value.floorNumber,
        capacity: form.value.capacity,
        description: form.value.description,
        status: form.value.status,
      });
    } else {
      await api.post("/api/floors/locations", {
        name: form.value.name,
        floorNumber: form.value.floorNumber,
        capacity: form.value.capacity,
        description: form.value.description,
      });
    }
    showLocationModal.value = false;
    await fetchLocations();
  } catch (err: any) {
    alert("Gagal menyimpan lokasi: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

function openQrModal(loc: any) {
  selectedLocForQr.value = loc;
  showQrModal.value = true;
}

async function confirmDelete(loc: any) {
  if (confirm(`Hapus lokasi pos '${loc.name}'?`)) {
    try {
      await api.del(`/api/floors/locations/${loc.id}`);
      await fetchLocations();
    } catch (err: any) {
      alert("Gagal menghapus lokasi: " + err.message);
    }
  }
}

onMounted(() => {
  fetchLocations();
});
</script>
