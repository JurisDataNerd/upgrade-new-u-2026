<template>
  <div class="flex-1 flex flex-col min-h-0 select-none font-mono">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        @click="handleRefresh"
        :disabled="loading"
        class="pixel-btn h-8 px-3 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center gap-1.5 text-xs font-mono font-bold hover:bg-[#3d2d1e] cursor-pointer"
        title="Segarkan Log Audit"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span class="hidden sm:inline font-pixel">SEGARKAN LOG</span>
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Header -->
    <div class="px-4 md:px-6 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#4a3624]/60 text-xs text-muted-foreground">
      <div>
        <h1 class="font-pixel text-xs sm:text-sm text-[#f59e0b] font-bold uppercase tracking-wider flex items-center gap-2">
          <History class="h-4 w-4 text-[#facc15]" />
          <span>SECURITY & OPERATIONAL AUDIT TRAIL</span>
        </h1>
        <p class="text-[11px] text-gray-400 mt-0.5">
          Pencatatan real-time seluruh aktivitas otentikasi, alokasi tim, koreksi skor, dan aksi krusial platform.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-2.5 py-1 text-[10px] font-pixel text-[#facc15] flex items-center gap-1.5">
          <ShieldAlert class="h-3.5 w-3.5 text-[#f59e0b]" />
          SECURITY AUDIT
        </span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
      <!-- 1. Stats HUD Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Total Log -->
        <div class="pixel-card p-3 border border-[#523e2b] bg-[#1a140f] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-gray-400 uppercase">TOTAL LOG AKTIVITAS</span>
            <span class="text-xs">📜</span>
          </div>
          <div class="font-pixel text-lg text-foreground font-bold">
            {{ meta.total || 0 }}
          </div>
          <span class="text-[10px] text-muted-foreground">Rekam Jejak Server</span>
        </div>

        <!-- Aksi Admin -->
        <div class="pixel-card p-3 border border-rose-800 bg-[#201010] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-rose-400 uppercase">AKSI ADMIN</span>
            <span class="text-xs">👑</span>
          </div>
          <div class="font-pixel text-lg text-rose-400 font-bold">
            {{ adminActionCount }}
          </div>
          <span class="text-[10px] text-rose-300/80">Koreksi & Pengaturan</span>
        </div>

        <!-- Aksi Buddy -->
        <div class="pixel-card p-3 border border-[#16a34a] bg-[#132215] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#4ade80] uppercase">AKSI BUDDY (GM)</span>
            <span class="text-xs">🛡️</span>
          </div>
          <div class="font-pixel text-lg text-[#4ade80] font-bold">
            {{ buddyActionCount }}
          </div>
          <span class="text-[10px] text-[#86efac]">FGD & Evaluasi Lapangan</span>
        </div>

        <!-- Status Keamanan -->
        <div class="pixel-card p-3 border border-[#0284c7] bg-[#0c1a24] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#38bdf8] uppercase">INTEGRITAS LOG</span>
            <span class="text-xs">🔒</span>
          </div>
          <div class="font-pixel text-xs text-[#38bdf8] font-bold flex items-center gap-1.5 mt-1">
            <CheckCircle2 class="w-4 h-4 text-[#38bdf8]" />
            <span>TERENKRIPSI & PERMANEN</span>
          </div>
          <span class="text-[10px] text-[#7dd3fc]">Audit Trail Standar Kampus</span>
        </div>
      </div>

      <!-- 2. Filters & Search Bar -->
      <div class="pixel-toolbar-sticky p-3 rounded-lg border border-[#4a3624] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex flex-1 items-center gap-2 max-w-md">
          <div class="relative w-full">
            <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
            <input
              v-model="search"
              @input="debounceSearch"
              type="text"
              placeholder="Cari Aksi, Nama Aktor, atau Sasaran Target..."
              class="w-full h-8 pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-xs text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <!-- Filter Peran Aktor -->
          <select
            v-model="roleFilter"
            class="h-8 bg-[#1d1611] border border-[#523e2b] px-2.5 text-foreground focus:outline-none focus:border-[#f59e0b]"
          >
            <option value="">Semua Peran Aktor</option>
            <option value="ADMIN">ADMIN (Super Admin)</option>
            <option value="BUDDY">BUDDY (Pendamping Regu)</option>
            <option value="PARTICIPANT">PARTICIPANT (Mahasiswa)</option>
          </select>

          <!-- Ukuran Halaman -->
          <select
            v-model="meta.pageSize"
            @change="handlePageSizeChange"
            class="h-8 bg-[#1d1611] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#f59e0b]"
          >
            <option :value="25">25 Baris</option>
            <option :value="50">50 Baris</option>
            <option :value="100">100 Baris</option>
          </select>
        </div>
      </div>

      <!-- 3. Audit Logs Table -->
      <div class="pixel-card overflow-hidden border border-[#523e2b] bg-[#1a140f] rounded-lg shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-[#140f0b] border-b-2 border-[#523e2b] text-[#f59e0b] font-pixel text-[10px] tracking-wider">
                <th class="p-3">WAKTU (WIB)</th>
                <th class="p-3">AKTOR / PELAKU</th>
                <th class="p-3">PERAN</th>
                <th class="p-3">JENIS AKSI</th>
                <th class="p-3">SASARAN TARGET</th>
                <th class="p-3">RINCIAN DATA</th>
                <th class="p-3 text-center">DETAIL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#3a2818] font-mono">
              <tr v-if="loading" class="text-center text-gray-500">
                <td colspan="7" class="p-8">
                  <div class="flex items-center justify-center gap-2 text-gray-400">
                    <RotateCw class="w-4 h-4 animate-spin text-[#f59e0b]" />
                    <span>Memuat log aktivitas server...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredLogs.length === 0" class="text-center text-gray-500">
                <td colspan="7" class="p-8 text-gray-400">
                  Tidak ada catatan audit log yang sesuai dengan filter.
                </td>
              </tr>
              <tr
                v-for="log in filteredLogs"
                :key="log.id"
                class="hover:bg-[#251b13] transition-colors"
              >
                <!-- Waktu -->
                <td class="p-3 text-gray-400 whitespace-nowrap text-[11px]">
                  {{ formatDateTime(log.createdAt) }}
                </td>

                <!-- Aktor -->
                <td class="p-3 whitespace-nowrap">
                  <div class="font-sans font-bold text-foreground text-xs">
                    {{ log.actorName || 'System Automated' }}
                  </div>
                  <span v-if="log.actorUsername" class="text-gray-400 font-mono text-[11px] block mt-0.5">
                    @{{ log.actorUsername }}
                  </span>
                </td>

                <!-- Peran -->
                <td class="p-3">
                  <span
                    class="px-2 py-0.5 rounded text-[9px] font-pixel border inline-flex items-center gap-1"
                    :class="{
                      'bg-[#220d0d] text-[#fca5a5] border-rose-800': log.actorRole === 'ADMIN',
                      'bg-[#132215] text-[#86efac] border-[#16a34a]': log.actorRole === 'BUDDY',
                      'bg-[#0c1a24] text-[#7dd3fc] border-[#0284c7]': log.actorRole === 'PARTICIPANT',
                      'bg-[#1a140f] text-gray-400 border-gray-700': !log.actorRole || log.actorRole === 'SYSTEM',
                    }"
                  >
                    {{ log.actorRole || 'SYSTEM' }}
                  </span>
                </td>

                <!-- Aksi -->
                <td class="p-3">
                  <span class="font-pixel text-[10px] text-[#facc15]">
                    {{ log.action }}
                  </span>
                </td>

                <!-- Sasaran -->
                <td class="p-3 text-gray-300 font-sans">
                  <span v-if="log.targetType" class="border border-[#4a3624] bg-[#221812] px-1.5 py-0.5 text-[10px] font-pixel text-amber-300/80">
                    {{ log.targetType }}
                  </span>
                  <span v-else class="text-gray-500">-</span>
                </td>

                <!-- Rincian Singkat -->
                <td class="p-3 font-sans text-gray-400 max-w-xs truncate text-[11px]">
                  {{ formatDetails(log.details) }}
                </td>

                <!-- Tombol Detail -->
                <td class="p-3 text-center">
                  <button
                    @click="openDetailModal(log)"
                    class="pixel-btn h-7 px-2.5 bg-[#271d15] text-[#f59e0b] border border-[#523e2b] hover:border-[#f59e0b] text-[10px] font-pixel rounded cursor-pointer transition-all flex items-center gap-1 mx-auto"
                  >
                    <Eye class="w-3 h-3" />
                    <span>LIHAT</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="p-3 bg-[#140f0b] border-t border-[#523e2b] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <div>
            Menampilkan <span class="text-white font-bold">{{ filteredLogs.length }}</span> dari
            <span class="text-white font-bold">{{ meta.total }}</span> total log
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="meta.page <= 1 || loading"
              class="pixel-btn h-7 px-2.5 bg-[#271d15] text-[#f59e0b] border border-[#523e2b] text-[10px] font-pixel disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d2d1e] cursor-pointer"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
              <span>SEBELUMNYA</span>
            </button>

            <span class="px-2 font-mono text-gray-300 text-[11px]">
              Hal. <strong class="text-[#facc15]">{{ meta.page }}</strong> / {{ totalPages }}
            </span>

            <button
              @click="nextPage"
              :disabled="meta.page >= totalPages || loading"
              class="pixel-btn h-7 px-2.5 bg-[#271d15] text-[#f59e0b] border border-[#523e2b] text-[10px] font-pixel disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d2d1e] cursor-pointer"
            >
              <span>BERIKUTNYA</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detail Log JSON Viewer -->
    <div
      v-if="selectedLog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none font-mono"
    >
      <div class="w-full max-w-xl bg-[#1a140f] border-2 border-[#f59e0b] rounded-xl p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-[#4a3624] pb-2.5">
          <div>
            <h3 class="font-pixel text-xs sm:text-sm text-[#facc15] font-bold flex items-center gap-2">
              <ShieldAlert class="w-4 h-4 text-[#f59e0b]" />
              <span>RINCIAN LOG AUDIT SISTEM</span>
            </h3>
            <p class="text-[11px] text-gray-400 font-sans mt-0.5">
              ID Log: {{ selectedLog.id }}
            </p>
          </div>
          <button
            @click="selectedLog = null"
            class="h-7 w-7 rounded bg-[#2d1b0e] border border-[#5a3a18] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-black/40 border border-[#523e2b] rounded space-y-0.5">
            <span class="text-[9px] text-gray-400 font-pixel uppercase block">Aktor:</span>
            <div class="font-bold text-white font-sans">{{ selectedLog.actorName || 'System' }}</div>
            <div class="text-[10px] text-gray-400">@{{ selectedLog.actorUsername || '-' }} ({{ selectedLog.actorRole || 'SYSTEM' }})</div>
          </div>

          <div class="p-2.5 bg-black/40 border border-[#523e2b] rounded space-y-0.5">
            <span class="text-[9px] text-gray-400 font-pixel uppercase block">Aksi & Waktu:</span>
            <div class="font-pixel text-xs text-[#facc15]">{{ selectedLog.action }}</div>
            <div class="text-[10px] text-gray-400">{{ formatDateTime(selectedLog.createdAt) }}</div>
          </div>

          <div class="p-2.5 bg-black/40 border border-[#523e2b] rounded space-y-0.5">
            <span class="text-[9px] text-gray-400 font-pixel uppercase block">Sasaran Target:</span>
            <div class="text-white font-sans">{{ selectedLog.targetType || '-' }}</div>
            <div class="text-[10px] text-gray-400 truncate">ID: {{ selectedLog.targetId || '-' }}</div>
          </div>

          <div class="p-2.5 bg-black/40 border border-[#523e2b] rounded space-y-0.5">
            <span class="text-[9px] text-gray-400 font-pixel uppercase block">Alamat IP:</span>
            <div class="text-white font-mono">{{ selectedLog.ipAddress || 'LAN-local' }}</div>
          </div>
        </div>

        <!-- JSON Payload Inspector -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-pixel text-gray-400 uppercase">Payload Data JSON (Details):</span>
            <span class="text-[10px] text-emerald-400 font-mono">Immutable Recorded State</span>
          </div>
          <pre class="p-3 bg-[#110c08] border border-[#4a301a] rounded text-xs text-[#86efac] font-mono overflow-x-auto max-h-48 custom-scrollbar leading-relaxed">{{ prettyJson(selectedLog.details) }}</pre>
        </div>

        <div class="text-right pt-2 border-t border-[#4a3624]">
          <button
            @click="selectedLog = null"
            class="pixel-btn h-8 px-4 bg-[#ca8a04] text-black font-pixel text-xs font-bold rounded cursor-pointer hover:bg-[#eab308]"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  History,
  ShieldAlert,
  Search,
  RotateCw,
  CheckCircle2,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';
import { useApi } from '@/composables/useApi';

const api = useApi();

const logs = ref<any[]>([]);
const loading = ref(false);
const search = ref('');
const roleFilter = ref('');
const selectedLog = ref<any | null>(null);
let searchTimeout: any = null;

const meta = ref({
  page: 1,
  pageSize: 25,
  total: 0,
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil((meta.value.total || 0) / meta.value.pageSize));
});

const adminActionCount = computed(() => {
  return logs.value.filter((l) => l.actorRole === 'ADMIN').length;
});

const buddyActionCount = computed(() => {
  return logs.value.filter((l) => l.actorRole === 'BUDDY').length;
});

const filteredLogs = computed(() => {
  let list = logs.value;
  if (roleFilter.value) {
    list = list.filter((l) => l.actorRole === roleFilter.value);
  }
  return list;
});

const fetchLogs = async (page = meta.value.page) => {
  loading.value = true;
  meta.value.page = page;
  try {
    const params: Record<string, any> = {
      page: meta.value.page,
      pageSize: meta.value.pageSize,
    };
    if (search.value.trim()) {
      params.search = search.value.trim();
    }

    const res: any = await api.get('/api/audit-logs', params);
    if (res?.success && Array.isArray(res.data)) {
      logs.value = res.data;
      if (res.meta) {
        meta.value.total = res.meta.total;
      }
    }
  } catch (err) {
    console.error('Gagal memuat data audit log:', err);
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  fetchLogs(1);
};

const handlePageSizeChange = () => {
  fetchLogs(1);
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchLogs(1);
  }, 300);
};

const prevPage = () => {
  if (meta.value.page > 1) {
    fetchLogs(meta.value.page - 1);
  }
};

const nextPage = () => {
  if (meta.value.page < totalPages.value) {
    fetchLogs(meta.value.page + 1);
  }
};

const openDetailModal = (log: any) => {
  selectedLog.value = log;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const formatDetails = (details: any) => {
  if (!details) return '-';
  if (typeof details === 'string') return details;
  try {
    return JSON.stringify(details);
  } catch {
    return '-';
  }
};

const prettyJson = (details: any) => {
  if (!details) return '{}';
  try {
    if (typeof details === 'string') {
      return JSON.stringify(JSON.parse(details), null, 2);
    }
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
};

onMounted(() => {
  fetchLogs();
});
</script>