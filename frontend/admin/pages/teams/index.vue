<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCreateModal"
        title="Buat Tim Baru"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">BUAT TIM BARU</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchTeams"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Sticky Top Pixel Toolbar (Flush nempel Topbar) -->
    <div class="pixel-toolbar-sticky px-4 md:px-6 py-2.5 space-y-2.5 shrink-0">
      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <!-- View Mode Switcher -->
        <div class="flex items-center gap-1">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'h-7 px-2.5 text-xs font-pixel flex items-center gap-1.5 transition-colors border',
              viewMode === 'grid'
                ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
                : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
            ]"
          >
            <LayoutGrid class="h-3 w-3" />
            <span>KARTU</span>
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'h-7 px-2.5 text-xs font-pixel flex items-center gap-1.5 transition-colors border',
              viewMode === 'table'
                ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
                : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
            ]"
          >
            <TableIcon class="h-3 w-3" />
            <span>TABEL</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari nama tim, kode, atau buddy..."
            class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
          />
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Grid / Table) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Content Area: Grid View (Pixel Squad Cards) -->
      <div v-if="viewMode === 'grid'" class="space-y-4">
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="pixel-card p-4 animate-pulse h-40 bg-[#271d15]"></div>
      </div>

      <div v-else-if="paginatedTeams.length === 0" class="pixel-card p-8 text-center text-xs text-muted-foreground font-mono">
        Tidak ada tim ditemukan.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="t in paginatedTeams"
          :key="t.id"
          class="pixel-card p-4 space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2.5">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <NuxtLink :to="'/teams/' + t.id" class="flex items-center gap-2.5 cursor-pointer group">
                <div class="h-9 w-9 border-2 border-[#f59e0b] bg-[#271d15] flex items-center justify-center font-pixel text-xs text-[#f59e0b] shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  {{ t.name.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="font-bold text-foreground text-xs leading-tight group-hover:text-[#f59e0b] transition-colors">
                    {{ t.name }}
                  </div>
                  <div class="font-mono text-[10px] text-[#facc15]">
                    {{ t.code }}
                  </div>
                </div>
              </NuxtLink>

              <span
                :class="[
                  'px-1.5 py-0.5 text-[8px] font-pixel border',
                  t.status === 'ACTIVE'
                    ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                    : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                ]"
              >
                {{ t.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
              </span>
            </div>

            <!-- Route Info -->
            <div class="flex items-center justify-between border border-[#4a3624] bg-[#15100c] px-2.5 py-1.5 font-mono text-xs">
              <span class="text-muted-foreground text-[10px]">RUTE POS:</span>
              <span v-if="t.routeName" class="text-[#facc15] font-pixel text-[10px] flex items-center gap-1">
                <Route class="h-3 w-3" />
                {{ t.routeName }}
              </span>
              <span v-else class="text-muted-foreground/60 italic text-[10px]">Belum Ditugaskan</span>
            </div>

            <!-- Buddies List -->
            <div class="space-y-1 font-mono text-xs">
              <div class="text-muted-foreground text-[10px]">BUDDY PENDAMPING:</div>
              <div v-if="t.buddies && t.buddies.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="b in t.buddies"
                  :key="b.userId"
                  class="border border-[#0284c7]/80 bg-[#16222f] text-[#38bdf8] text-[9px] px-1.5 py-0.5 font-pixel flex items-center gap-1"
                >
                  <UserCheck class="h-2.5 w-2.5" />
                  <span>{{ b.fullName }} ({{ b.buddyRole }})</span>
                </span>
              </div>
              <div v-else class="text-[#ca8a04] text-[10px] italic">
                Belum ada Buddy
              </div>
            </div>

            <!-- Members Count -->
            <div class="flex items-center justify-between font-mono text-xs border-t border-[#3d2d1e] pt-1.5">
              <span class="text-muted-foreground text-[11px]">Anggota Mahasiswa:</span>
              <span class="font-bold text-[#4ade80] font-pixel text-xs">
                {{ t.participantCount || 0 }} PESERTA
              </span>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="border-t border-[#3d2d1e] pt-2 flex items-center justify-between">
            <NuxtLink
              :to="'/teams/' + t.id"
              class="pixel-btn h-7 px-2.5 text-[10px] font-pixel bg-[#16222f] text-[#38bdf8] border-[#0284c7] hover:bg-[#0284c7]/20 flex items-center gap-1.5 transition-all"
            >
              <Users class="h-3 w-3" />
              <span>INSPECT SQUAD</span>
            </NuxtLink>

            <div class="flex items-center gap-1">
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center text-xs"
                title="Edit Tim"
                @click="openEditModal(t)"
              >
                <Edit class="h-3.5 w-3.5" />
              </button>
              <button
                class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                title="Hapus Tim"
                @click="confirmDelete(t)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area: Table View -->
    <div v-else class="pixel-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="pixel-table w-full text-left text-xs">
          <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
            <tr>
              <th class="p-3">NAMA TIM</th>
              <th class="p-3">KODE TIM</th>
              <th class="p-3">RUTE POS</th>
              <th class="p-3">BUDDY PENDAMPING</th>
              <th class="p-3 text-center">ANGGOTA</th>
              <th class="p-3 text-center">STATUS</th>
              <th class="p-3 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60 font-mono">
            <tr v-if="loading" class="text-center">
              <td colspan="7" class="p-8 text-muted-foreground">
                <div class="flex items-center justify-center gap-2">
                  <RotateCw class="h-4 w-4 animate-spin text-[#f59e0b]" />
                  <span>Memuat data tim...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="paginatedTeams.length === 0" class="text-center">
              <td colspan="7" class="p-8 text-muted-foreground">
                Tidak ada data tim ditemukan.
              </td>
            </tr>

            <tr v-for="t in paginatedTeams" :key="t.id" class="hover:bg-[#271d15]/50 transition-colors">
              <td class="p-3 font-semibold text-foreground">
                <NuxtLink :to="'/teams/' + t.id" class="flex items-center gap-2 font-pixel text-xs text-[#f59e0b] hover:text-[#facc15] transition-colors cursor-pointer group">
                  <Shield class="h-3.5 w-3.5 text-[#f59e0b] group-hover:scale-110 transition-transform" />
                  <span>{{ t.name }}</span>
                </NuxtLink>
              </td>

              <td class="p-3 text-[#facc15] font-bold text-[11px]">
                {{ t.code }}
              </td>

              <td class="p-3">
                <span v-if="t.routeName" class="text-[#38bdf8] font-pixel text-[10px]">
                  {{ t.routeName }}
                </span>
                <span v-else class="text-muted-foreground/60 italic text-[11px]">-</span>
              </td>

              <td class="p-3">
                <div v-if="t.buddies && t.buddies.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="b in t.buddies"
                    :key="b.userId"
                    class="border border-[#0284c7]/80 bg-[#16222f] text-[#38bdf8] text-[9px] px-1.5 py-0.5 font-pixel"
                  >
                    {{ b.fullName }} ({{ b.buddyRole }})
                  </span>
                </div>
                <span v-else class="text-[#ca8a04] italic text-[10px]">Belum Ada</span>
              </td>

              <td class="p-3 text-center font-bold text-[#4ade80]">
                {{ t.participantCount || 0 }}
              </td>

              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 text-[9px] font-pixel border',
                    t.status === 'ACTIVE'
                      ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                      : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                  ]"
                >
                  {{ t.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
                </span>
              </td>

              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="'/teams/' + t.id"
                    class="h-7 px-2 border border-[#0284c7] bg-[#16222f] text-[#38bdf8] hover:bg-[#0284c7]/20 flex items-center gap-1 text-[10px] font-pixel rounded"
                  >
                    <Users class="h-3 w-3" />
                    <span>SQUAD</span>
                  </NuxtLink>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center"
                    title="Edit Tim"
                    @click="openEditModal(t)"
                  >
                    <Edit class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center"
                    title="Hapus Tim"
                    @click="confirmDelete(t)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>

    <!-- Sticky Bottom Dashboard Footer: Pixel Pagination -->
    <PixelPagination
      :current-page="currentPage"
      :total-items="filteredTeams.length"
      :page-size="pageSize"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Create / Edit Team -->
    <Dialog :open="showFormModal" @update:open="showFormModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Shield class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT DATA TIM' : 'BUAT TIM PETUALANG BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Nama Tim:</Label>
            <input
              v-model="form.name"
              placeholder="Contoh: Genius 01"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Kode Unik Tim:</Label>
            <input
              v-model="form.code"
              placeholder="Contoh: GENIUS-01"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-[#facc15] font-bold uppercase focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Alokasi Rute Perjalanan:</Label>
            <select
              v-model="form.routeId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option :value="null">-- Belum Ditugaskan Rute --</option>
              <option v-for="r in routesList" :key="r.id" :value="r.id">
                {{ r.name }}
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Status Tim:</Label>
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
              @click="showFormModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>{{ isEditing ? 'SIMPAN' : 'BUAT TIM' }}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal: Kelola Roster Anggota & Buddy Tim -->
    <Dialog :open="showRosterModal" @update:open="showRosterModal = $event">
      <DialogContent class="sm:max-w-[560px] pixel-card border-2 border-[#38bdf8] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center gap-2">
            <Users class="h-4 w-4" />
            <span>ROSTER TIM: {{ selectedTeam?.name }} ({{ selectedTeam?.code }})</span>
          </DialogTitle>
        </DialogHeader>

        <div v-if="selectedTeam" class="space-y-3 py-1 font-mono text-xs">
          <!-- Add Member Section -->
          <div class="border border-[#4a3624] bg-[#15100c] p-3 space-y-2">
            <div class="font-semibold text-foreground text-xs">Tambah Anggota / Buddy (Free Agent):</div>
            <div class="flex items-center gap-2">
              <select
                v-model="selectedUserToAdd"
                class="flex-1 h-8 bg-[#271d15] border border-[#523e2b] px-2 text-xs text-foreground focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="">-- Pilih Peserta / Buddy (Free Agent) --</option>
                <option
                  v-for="u in availableUsers"
                  :key="u.id"
                  :value="u.id"
                >
                  [{{ u.role }}] {{ u.fullName }} (@{{ u.username }})
                </option>
              </select>

              <button
                class="pixel-btn h-8 px-3 text-xs font-pixel bg-[#0284c7] text-white border-[#38bdf8] font-bold"
                :disabled="!selectedUserToAdd || saving"
                @click="addMemberToTeam"
              >
                Tambah
              </button>
            </div>
          </div>

          <!-- Current Members List -->
          <div class="space-y-1.5">
            <div class="font-semibold text-foreground text-xs">
              Daftar Anggota Saat Ini ({{ teamRoster.length }} orang):
            </div>

            <div v-if="teamRoster.length === 0" class="p-6 text-center border border-[#4a3624] bg-[#15100c] text-muted-foreground text-xs">
              Belum ada anggota atau buddy dalam tim ini.
            </div>

            <div v-else class="max-h-60 overflow-y-auto space-y-1 pr-1">
              <div
                v-for="m in teamRoster"
                :key="m.userId"
                class="flex items-center justify-between border border-[#3d2d1e] bg-[#271d15] p-2 text-xs"
              >
                <div class="flex items-center gap-2">
                  <div class="font-semibold text-foreground">{{ m.fullName }}</div>
                  <div class="text-[10px] text-muted-foreground">@{{ m.username }}</div>
                  <span
                    :class="[
                      'px-1.5 py-0.5 text-[8px] font-pixel border',
                      m.role === 'BUDDY'
                        ? 'border-[#0284c7]/80 bg-[#16222f] text-[#38bdf8]'
                        : 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                    ]"
                  >
                    {{ m.role === 'BUDDY' ? `BUDDY (${m.buddyRole || 'GM'})` : 'PESERTA' }}
                  </span>
                </div>

                <button
                  class="h-6 w-6 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                  title="Keluarkan dari Tim"
                  @click="removeMemberFromTeam(m.userId)"
                >
                  <Trash2 class="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <DialogFooter class="pt-2 flex justify-end">
            <button
              class="h-7 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showRosterModal = false"
            >
              Tutup
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
  Shield,
  Plus,
  RotateCw,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Route,
  UserCheck,
  Users,
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
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";

const api = useApi();
const toast = useToast();
const confirmModal = useConfirm();

const loading = ref(false);
const saving = ref(false);
const teamsList = ref<any[]>([]);
const routesList = ref<any[]>([]);
const allUsers = ref<any[]>([]);
const viewMode = ref<"grid" | "table">("grid");
const searchQuery = ref("");

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

// Modals
const showFormModal = ref(false);
const isEditing = ref(false);
const form = ref({
  id: "",
  name: "",
  code: "",
  routeId: null as string | null,
  status: "ACTIVE",
});

const showRosterModal = ref(false);
const selectedTeam = ref<any>(null);
const teamRoster = ref<any[]>([]);
const selectedUserToAdd = ref("");

const filteredTeams = computed(() => {
  if (!searchQuery.value.trim()) return teamsList.value;
  const q = searchQuery.value.toLowerCase().trim();
  return teamsList.value.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.buddies?.some((b: any) => b.fullName.toLowerCase().includes(q))
  );
});

const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredTeams.value.slice(start, start + pageSize.value);
});

// Free agents
const availableUsers = computed(() => {
  return allUsers.value.filter((u) => !u.teamId);
});

async function fetchRoutes() {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/routes");
    if (res.success && res.data) routesList.value = res.data;
  } catch (err) {
    console.error("Failed to load routes:", err);
  }
}

async function fetchAllUsers() {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/users?pageSize=500");
    if (res.success && res.data) allUsers.value = res.data;
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

async function fetchTeams() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/teams?pageSize=100");
    if (res.success && res.data) {
      teamsList.value = res.data;
    }
  } catch (err) {
    console.error("Failed to load teams:", err);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    name: "",
    code: "",
    routeId: null,
    status: "ACTIVE",
  };
  showFormModal.value = true;
}

function openEditModal(t: any) {
  isEditing.value = true;
  form.value = {
    id: t.id,
    name: t.name,
    code: t.code,
    routeId: t.routeId || null,
    status: t.status || "ACTIVE",
  };
  showFormModal.value = true;
}

async function submitForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/teams/${form.value.id}`, {
        name: form.value.name,
        code: form.value.code,
        routeId: form.value.routeId,
        status: form.value.status,
      });
      toast.success("Tim Diperbarui!", `Data tim "${form.value.name}" berhasil disimpan.`);
    } else {
      await api.post("/api/teams", {
        name: form.value.name,
        code: form.value.code,
        routeId: form.value.routeId,
      });
      toast.success("Tim Dibuat!", `Tim "${form.value.name}" (${form.value.code}) berhasil didaftarkan.`);
    }
    showFormModal.value = false;
    await fetchTeams();
  } catch (err: any) {
    toast.error("Gagal Menyimpan Tim", err.data?.error?.message || err.message || "Gagal menyimpan tim.");
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(t: any) {
  const confirmed = await confirmModal.show({
    title: "Hapus Tim Petualang?",
    description: `Yakin ingin menghapus tim '${t.name}' (${t.code})? Semua anggota tim akan kembali berstatus petualang independen.`,
    confirmText: "Ya, Hapus Tim",
    cancelText: "Batal",
    variant: "danger",
    icon: "trash",
  });
  if (!confirmed) return;

  try {
    await api.del(`/api/teams/${t.id}`);
    toast.success("Tim Dihapus", `Tim '${t.name}' berhasil dihapus.`);
    await fetchTeams();
  } catch (err: any) {
    toast.error("Gagal Menghapus Tim", err.message || "Terjadi kesalahan sistem.");
  }
}

// Roster Management
async function openRosterModal(t: any) {
  selectedTeam.value = t;
  selectedUserToAdd.value = "";
  showRosterModal.value = true;
  await reloadTeamRoster(t.id);
  await fetchAllUsers();
}

async function reloadTeamRoster(teamId: string) {
  try {
    const res = await api.get(`/api/teams/${teamId}`);
    if (res.success && res.data?.members) {
      teamRoster.value = res.data.members;
    }
  } catch (err) {
    console.error("Failed to load team roster:", err);
  }
}

async function addMemberToTeam() {
  if (!selectedUserToAdd.value || !selectedTeam.value) return;
  saving.value = true;
  try {
    const targetUser = allUsers.value.find((u) => u.id === selectedUserToAdd.value);
    const isBuddy = targetUser?.role === "BUDDY";

    await api.post(`/api/teams/${selectedTeam.value.id}/members`, {
      userId: selectedUserToAdd.value,
      buddyRole: isBuddy ? "PRIMARY" : null,
    });
    toast.success("Anggota Ditambahkan!", `${targetUser?.fullName || "Pengguna"} dimasukkan ke dalam tim.`);
    selectedUserToAdd.value = "";
    await reloadTeamRoster(selectedTeam.value.id);
    await fetchTeams();
    await fetchAllUsers();
  } catch (err: any) {
    toast.error("Gagal Menambahkan Anggota", err.data?.error?.message || err.message || "Terjadi kesalahan sistem.");
  } finally {
    saving.value = false;
  }
}

async function removeMemberFromTeam(userId: string) {
  if (!selectedTeam.value) return;
  try {
    await api.del(`/api/teams/${selectedTeam.value.id}/members/${userId}`);
    toast.info("Anggota Dikeluarkan", "Anggota tim telah dilepaskan dari roster.");
    await reloadTeamRoster(selectedTeam.value.id);
    await fetchTeams();
    await fetchAllUsers();
  } catch (err: any) {
    toast.error("Gagal Mengeluarkan Anggota", err.message || "Terjadi kesalahan sistem.");
  }
}

onMounted(() => {
  fetchTeams();
  fetchRoutes();
  fetchAllUsers();
});
</script>
