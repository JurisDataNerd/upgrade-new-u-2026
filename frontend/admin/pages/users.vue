<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCreateModal"
        title="Tambah Pengguna"
      >
        <UserPlus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">TAMBAH PENGGUNA</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchUsers"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Sticky Top Pixel Toolbar (Flush nempel Topbar) -->
    <div class="pixel-toolbar-sticky px-4 md:px-6 py-2.5 space-y-2.5 shrink-0">
      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <!-- Role Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            v-for="r in roleTabs"
            :key="r.value"
            @click="setRole(r.value)"
            :class="[
              'h-7 px-2.5 text-xs font-pixel transition-colors border',
              selectedRole === r.value
                ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
                : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
            ]"
          >
            {{ r.label }}
          </button>
        </div>

        <!-- Search & Status Select -->
        <div class="flex items-center gap-2">
          <div class="relative w-48 sm:w-60">
            <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
            <input
              v-model="searchQuery"
              placeholder="Cari nama atau username..."
              class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              @input="debounceFetch"
            />
          </div>

          <select
            v-model="selectedStatus"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchUsers()"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Table) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Users Table (Pixel RPG Table) -->
      <div class="pixel-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="pixel-table w-full text-left text-xs">
          <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
            <tr>
              <th class="p-3">PENGGUNA</th>
              <th class="p-3 text-center">ROLE / PERAN</th>
              <th class="p-3">TIM TERKAIT</th>
              <th class="p-3 text-center">STATUS</th>
              <th class="p-3">TERDAFTAR</th>
              <th class="p-3 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60 font-mono">
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="p-8 text-muted-foreground">
                <div class="flex items-center justify-center gap-2">
                  <RotateCw class="h-4 w-4 animate-spin text-[#f59e0b]" />
                  <span>Memuat data pengguna...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="paginatedUsers.length === 0" class="text-center">
              <td colspan="6" class="p-8 text-muted-foreground">
                Tidak ada akun pengguna ditemukan.
              </td>
            </tr>

            <tr
              v-for="u in paginatedUsers"
              :key="u.id"
              class="hover:bg-[#271d15]/50 transition-colors"
            >
              <!-- Name & Username -->
              <td class="p-3">
                <div class="flex items-center gap-2.5">
                  <div
                    :class="[
                      'h-7 w-7 border flex items-center justify-center font-pixel text-[9px] shrink-0',
                      u.role === 'ADMIN'
                        ? 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                        : u.role === 'BUDDY'
                          ? 'border-[#0284c7]/60 bg-[#16222f] text-[#38bdf8]'
                          : 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                    ]"
                  >
                    {{ getInitials(u.fullName) }}
                  </div>
                  <div>
                    <div class="font-sans font-semibold text-foreground text-xs leading-tight">
                      {{ u.fullName }}
                    </div>
                    <div class="text-[10px] text-muted-foreground">
                      @{{ u.username }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Role Badge -->
              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 text-[9px] font-pixel border',
                    u.role === 'ADMIN'
                      ? 'border-[#dc2626]/80 bg-[#2a1414] text-[#f87171]'
                      : u.role === 'BUDDY'
                        ? 'border-[#0284c7]/80 bg-[#16222f] text-[#38bdf8]'
                        : 'border-[#ca8a04]/80 bg-[#2b2014] text-[#facc15]'
                  ]"
                >
                  {{ u.role }}
                </span>
              </td>

              <!-- Team -->
              <td class="p-3">
                <span v-if="u.teamName" class="text-[#facc15] font-pixel text-[10px]">
                  {{ u.teamName }} ({{ u.teamCode }})
                </span>
                <span v-else class="text-muted-foreground/60 italic text-[11px]">-</span>
              </td>

              <!-- Status -->
              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 text-[9px] font-pixel border',
                    u.status === 'ACTIVE'
                      ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                      : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                  ]"
                >
                  {{ u.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
                </span>
              </td>

              <!-- Created At -->
              <td class="p-3 text-[11px] text-muted-foreground">
                {{ formatDate(u.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center"
                    title="Edit Pengguna"
                    @click="openEditModal(u)"
                  >
                    <Edit class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#facc15] hover:border-[#facc15] flex items-center justify-center"
                    title="Reset Password"
                    @click="openResetPasswordModal(u)"
                  >
                    <KeyRound class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center"
                    title="Hapus Pengguna"
                    @click="confirmDelete(u)"
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
      :total-items="filteredUsers.length"
      :page-size="pageSize"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Create / Edit User -->
    <Dialog :open="showFormModal" @update:open="showFormModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <UserPlus class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT DATA PENGGUNA' : 'TAMBAH PENGGUNA BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Username:</Label>
            <input
              v-model="form.username"
              placeholder="Username login..."
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b] disabled:opacity-50"
              :disabled="isEditing"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Nama Lengkap:</Label>
            <input
              v-model="form.fullName"
              placeholder="Nama lengkap pengguna..."
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Peran Sistem (Role):</Label>
            <select
              v-model="form.role"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              :disabled="isEditing"
            >
              <option value="PARTICIPANT">PARTICIPANT (Mahasiswa Peserta)</option>
              <option value="BUDDY">BUDDY (Game Master)</option>
              <option value="ADMIN">ADMIN (Super Administrator)</option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">
              {{ isEditing ? 'Ganti Password (Kosongkan jika tetap):' : 'Password Awal:' }}
            </Label>
            <input
              type="password"
              v-model="form.password"
              :placeholder="isEditing ? '••••••••' : 'Default: genius2026'"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Status Akun:</Label>
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
  UserPlus,
  RotateCw,
  Search,
  KeyRound,
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
const users = ref<any[]>([]);
const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const roleTabs = [
  { label: "SEMUA", value: "" },
  { label: "ADMIN", value: "ADMIN" },
  { label: "BUDDY", value: "BUDDY" },
  { label: "PESERTA", value: "PARTICIPANT" },
];

const showFormModal = ref(false);
const isEditing = ref(false);
const form = ref({
  id: "",
  username: "",
  fullName: "",
  role: "PARTICIPANT",
  password: "",
  status: "ACTIVE",
});

const totalUsers = computed(() => users.value.length);

const filteredUsers = computed(() => {
  return users.value;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

function setRole(role: string) {
  selectedRole.value = role;
  currentPage.value = 1;
  fetchUsers();
}

let debounceTimer: any = null;
function debounceFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchUsers();
  }, 300);
}

async function fetchUsers() {
  loading.value = true;
  try {
    const params: Record<string, string> = {
      pageSize: "1000",
    };
    if (selectedRole.value) params.role = selectedRole.value;
    if (searchQuery.value) params.search = searchQuery.value;

    const res = await api.get<{ success: boolean; data: any[] }>("/api/users", params);
    if (res.success && res.data) {
      let list = res.data;
      if (selectedStatus.value) {
        list = list.filter((u) => u.status === selectedStatus.value);
      }
      users.value = list;
    }
  } catch (err) {
    console.error("Failed to fetch users:", err);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    username: "",
    fullName: "",
    role: selectedRole.value || "PARTICIPANT",
    password: "",
    status: "ACTIVE",
  };
  showFormModal.value = true;
}

function openEditModal(u: any) {
  isEditing.value = true;
  form.value = {
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    password: "",
    status: u.status || "ACTIVE",
  };
  showFormModal.value = true;
}

async function submitForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      const payload: any = {
        fullName: form.value.fullName,
        status: form.value.status,
      };
      if (form.value.password) payload.password = form.value.password;
      await api.put(`/api/users/${form.value.id}`, payload);
      toast.success("Pengguna Diperbarui!", `Data @${form.value.username} berhasil disimpan.`);
    } else {
      await api.post("/api/users", {
        username: form.value.username,
        fullName: form.value.fullName,
        role: form.value.role,
        password: form.value.password || "genius2026",
        status: form.value.status,
      });
      toast.success("Pengguna Dibuat!", `Akun @${form.value.username} berhasil didaftarkan.`);
    }
    showFormModal.value = false;
    await fetchUsers();
  } catch (err: any) {
    toast.error("Gagal Menyimpan", err.data?.error?.message || err.message || "Gagal menyimpan pengguna.");
  } finally {
    saving.value = false;
  }
}

async function openResetPasswordModal(u: any) {
  const confirmed = await confirmModal.show({
    title: "Reset Password Pengguna?",
    description: `Reset password untuk ${u.fullName} (@${u.username}) ke default 'genius2026'? Pengguna harus menggunakan password baru ini untuk login.`,
    confirmText: "Ya, Reset Password",
    cancelText: "Batal",
    variant: "warning",
    icon: "shield",
  });
  if (!confirmed) return;

  try {
    await api.post(`/api/users/${u.id}/reset-password`, { password: "genius2026" });
    toast.success("Password Di-reset!", `Password untuk @${u.username} berhasil di-reset ke: genius2026`);
  } catch (err: any) {
    toast.error("Gagal Reset Password", err.message || "Terjadi kesalahan sistem.");
  }
}

async function confirmDelete(u: any) {
  const confirmed = await confirmModal.show({
    title: "Hapus Pengguna?",
    description: `Apakah Anda yakin ingin menghapus akun ${u.fullName} (@${u.username})? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: "Ya, Hapus Akun",
    cancelText: "Batal",
    variant: "danger",
    icon: "trash",
  });
  if (!confirmed) return;

  try {
    await api.del(`/api/users/${u.id}`);
    toast.success("Pengguna Dihapus", `Akun @${u.username} berhasil dihapus.`);
    await fetchUsers();
  } catch (err: any) {
    toast.error("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus pengguna.");
  }
}

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

onMounted(() => {
  fetchUsers();
});
</script>
