<template>
  <div class="p-4 md:p-6 space-y-6 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        @click="openCorrectionModal"
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        title="Koreksi Skor Baru"
      >
        <Plus class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">KOREKSI SKOR</span>
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Audit trail buku besar perolehan skor petualang dan penyesuaian manual Admin.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15] flex items-center gap-1">
          <span>📊</span>
          POINT LEDGER
        </span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-[#0F172A]/70 border border-white/5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
          📜
        </div>
        <div>
          <div class="text-xs text-gray-400">Total Transaksi Skor</div>
          <div class="text-xl font-mono font-black text-white">{{ meta.total || 0 }}</div>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-[#0F172A]/70 border border-white/5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
          ⚖️
        </div>
        <div>
          <div class="text-xs text-gray-400">Koreksi Admin Tercatat</div>
          <div class="text-xl font-mono font-black text-amber-400">{{ correctionCount }}</div>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-[#0F172A]/70 border border-white/5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
          🔒
        </div>
        <div>
          <div class="text-xs text-gray-400">Integritas Ledger</div>
          <div class="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 class="w-3.5 h-3.5" /> Append-Only Immutable
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="p-4 rounded-xl bg-[#0F172A]/70 border border-white/5 flex flex-wrap items-center gap-4">
      <div class="relative flex-1 min-w-[240px]">
        <Search class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="filters.sourceType"
          placeholder="Filter tipe: GAME, BONUS, CORRECTION..."
          class="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <button
        @click="fetchTransactions"
        class="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition border border-white/10"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>Refresh Ledger</span>
      </button>
    </div>

    <!-- Table -->
    <div class="bg-[#0F172A]/70 border border-white/5 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-black/40 border-b border-white/5 text-gray-400 font-mono">
            <tr>
              <th class="p-3.5">WAKTU</th>
              <th class="p-3.5">PETUALANG</th>
              <th class="p-3.5">TIM</th>
              <th class="p-3.5">TIPE SUMBER</th>
              <th class="p-3.5">ALASAN / CATATAN</th>
              <th class="p-3.5 text-right">POIN</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-mono">
            <tr v-if="loading" class="text-center text-gray-500">
              <td colspan="6" class="p-8">Memuat riwayat transaksi buku besar...</td>
            </tr>
            <tr v-else-if="transactions.length === 0" class="text-center text-gray-500">
              <td colspan="6" class="p-8">Belum ada transaksi poin yang tercatat.</td>
            </tr>
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-white/[0.02] transition">
              <td class="p-3.5 text-gray-400">
                {{ formatDateTime(tx.createdAt) }}
              </td>
              <td class="p-3.5 font-sans font-bold text-white">
                {{ tx.participantName }}
                <span class="text-gray-500 font-mono text-[11px] block">@{{ tx.participantUsername }}</span>
              </td>
              <td class="p-3.5 text-blue-400 font-sans">
                {{ tx.teamName || '-' }}
              </td>
              <td class="p-3.5">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': tx.sourceType === 'GAME',
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20': tx.sourceType === 'BONUS',
                    'bg-purple-500/10 text-purple-400 border border-purple-500/20': tx.sourceType === 'CORRECTION',
                  }"
                >
                  {{ tx.sourceType }}
                </span>
              </td>
              <td class="p-3.5 font-sans text-gray-300 max-w-xs truncate">
                {{ tx.reason || '-' }}
              </td>
              <td class="p-3.5 text-right font-bold text-sm" :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount }} pts
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Correction Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-md bg-[#0F172A] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-base font-black text-white flex items-center gap-2">
            <span class="text-amber-400">⚖️</span> Form Koreksi Skor Admin
          </h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-gray-400">
          Koreksi skor akan ditambahkan sebagai transaksi <code>CORRECTION</code> ke buku besar tanpa mengubah catatan historis sebelumnya.
        </p>

        <div class="space-y-3 font-sans text-xs">
          <div>
            <label class="block text-gray-400 mb-1">ID Peserta Target:</label>
            <input
              v-model="correctionForm.participantId"
              placeholder="UUID Peserta"
              class="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-gray-400 mb-1">ID Tim:</label>
            <input
              v-model="correctionForm.teamId"
              placeholder="UUID Tim"
              class="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-gray-400 mb-1">Jumlah Poin Penyesuaian (+ atau -):</label>
            <input
              type="number"
              v-model.number="correctionForm.amount"
              placeholder="Contoh: 50 atau -20"
              class="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-gray-400 mb-1">Alasan Koreksi (Wajib):</label>
            <textarea
              v-model="correctionForm.reason"
              rows="3"
              placeholder="Jelaskan alasan penyesuaian skor..."
              class="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="isModalOpen = false"
            class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition"
          >
            Batal
          </button>
          <button
            @click="submitCorrection"
            :disabled="submitting || !correctionForm.participantId || !correctionForm.reason"
            class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-black transition disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : 'Simpan Koreksi Skor' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, RotateCw, CheckCircle2, X } from 'lucide-vue-next'

const transactions = ref([])
const loading = ref(false)
const submitting = ref(false)
const isModalOpen = ref(false)
const meta = ref({ page: 1, pageSize: 50, total: 0 })
const filters = ref({ sourceType: '' })

const correctionForm = ref({
  participantId: '',
  teamId: '',
  amount: 0,
  reason: '',
})

const correctionCount = computed(() => {
  return transactions.value.filter((t) => t.sourceType === 'CORRECTION').length
})

const fetchTransactions = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('genius_admin_token')
    let url = `/api/scores/transactions?page=1&pageSize=50`
    if (filters.value.sourceType) {
      url += `&sourceType=${encodeURIComponent(filters.value.sourceType)}`
    }
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const json = await res.json()
    if (json.success && json.data) {
      transactions.value = json.data
      meta.value = json.meta
    }
  } catch (err) {
    console.error('Failed to fetch transactions:', err)
  } finally {
    loading.value = false
  }
}

const openCorrectionModal = () => {
  correctionForm.value = {
    participantId: '',
    teamId: '',
    amount: 0,
    reason: '',
  }
  isModalOpen.value = true
}

const submitCorrection = async () => {
  submitting.value = true
  try {
    const token = localStorage.getItem('genius_admin_token')
    const res = await fetch('/api/scores/correction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(correctionForm.value),
    })
    const json = await res.json()
    if (!json.success) {
      alert(json.error?.message || 'Gagal menyimpan koreksi')
      return
    }
    alert('Koreksi skor berhasil disimpan ke buku besar!')
    isModalOpen.value = false
    await fetchTransactions()
  } catch (err) {
    alert('Terjadi kesalahan: ' + err.message)
  } finally {
    submitting.value = false
  }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchTransactions()
})
</script>
