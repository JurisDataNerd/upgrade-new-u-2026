<script setup>
const logs = ref([])
const loading = ref(false)
const search = ref('')
let searchTimeout = null

const fetchLogs = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('genius_admin_token')
    let url = `/api/audit-logs?page=1&pageSize=50`
    if (search.value.trim()) {
      url += `&search=${encodeURIComponent(search.value.trim())}`
    }
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const json = await res.json()
    if (json.success && json.data) {
      logs.value = json.data
    }
  } catch (err) {
    console.error('Failed to fetch audit logs:', err)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchLogs()
  }, 300)
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatDetails = (details) => {
  if (!details) return '-'
  if (typeof details === 'string') return details
  try {
    return JSON.stringify(details)
  } catch {
    return '-'
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        @click="fetchLogs"
        class="pixel-btn h-8 px-3 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center gap-1.5 text-xs font-mono font-bold hover:bg-[#3d2d1e]"
        title="Segarkan Log"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span class="hidden sm:inline">SEGARKAN LOG</span>
      </button>
    </TopbarActions>

    <!-- Header / Subtitle Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Pencatatan real-time seluruh aktivitas otentikasi, alokasi tim, koreksi skor, dan aksi krusial platform.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15] flex items-center gap-1">
          <span>🛡️</span>
          SECURITY AUDIT TRAIL
        </span>
      </div>
    </div>

    <!-- Filters -->
    <div class="p-4 rounded-xl bg-[#0F172A]/70 border border-white/5 flex flex-wrap items-center gap-4">
      <div class="relative flex-1 min-w-[240px]">
        <Search class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="search"
          @input="debounceSearch"
          placeholder="Cari aksi, tipe target, atau nama aktor..."
          class="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-[#0F172A]/70 border border-white/5 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-black/40 border-b border-white/5 text-gray-400 font-mono">
            <tr>
              <th class="p-3.5">TIMESTAMP</th>
              <th class="p-3.5">AKTOR</th>
              <th class="p-3.5">PERAN</th>
              <th class="p-3.5">AKSI</th>
              <th class="p-3.5">TARGET</th>
              <th class="p-3.5">RINCIAN (DETAILS)</th>
              <th class="p-3.5">IP ADDRESS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-mono">
            <tr v-if="loading" class="text-center text-gray-500">
              <td colspan="7" class="p-8">Memuat audit log server...</td>
            </tr>
            <tr v-else-if="logs.length === 0" class="text-center text-gray-500">
              <td colspan="7" class="p-8">Belum ada audit log yang sesuai.</td>
            </tr>
            <tr v-for="log in logs" :key="log.id" class="hover:bg-white/[0.02] transition">
              <td class="p-3.5 text-gray-400 whitespace-nowrap">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="p-3.5 font-sans font-bold text-white whitespace-nowrap">
                {{ log.actorName || 'System' }}
                <span class="text-gray-500 font-mono text-[11px] block" v-if="log.actorUsername">@{{ log.actorUsername }}</span>
              </td>
              <td class="p-3.5">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="{
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20': log.actorRole === 'ADMIN',
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': log.actorRole === 'BUDDY',
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20': log.actorRole === 'PARTICIPANT',
                  }"
                >
                  {{ log.actorRole || 'SYSTEM' }}
                </span>
              </td>
              <td class="p-3.5 font-bold text-amber-400">
                {{ log.action }}
              </td>
              <td class="p-3.5 text-gray-300">
                {{ log.targetType || '-' }}
              </td>
              <td class="p-3.5 font-sans text-gray-400 max-w-xs truncate">
                {{ formatDetails(log.details) }}
              </td>
              <td class="p-3.5 text-gray-500">
                {{ log.ipAddress || 'LAN-local' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>