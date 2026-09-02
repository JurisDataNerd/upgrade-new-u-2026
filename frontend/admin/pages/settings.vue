<template>
  <div class="p-4 md:p-6 space-y-6 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="loadAllData"
        :disabled="loading"
        title="Refresh Status"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Pusat komando darurat, kontrol tahapan stage, siaran pengumuman realtime, dan diagnostik server kampus.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-red-500/50 bg-red-950/60 px-2 py-0.5 text-[9px] font-pixel text-red-300 flex items-center gap-1">
          <ShieldAlert class="h-3 w-3 text-red-400" />
          MISSION CONTROL
        </span>
      </div>
    </div>

    <!-- 1. EMERGENCY PLAYBOOK / LOCKDOWN PANEL -->
    <div class="pixel-card p-5 border-2 border-red-800 bg-[#201010] space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-red-900/60 pb-3">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 shrink-0 flex items-center justify-center rounded border-2 border-red-600 bg-red-950 text-red-400">
            <AlertTriangle class="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 class="font-pixel text-xs sm:text-sm text-red-400 font-bold tracking-wider">
              EMERGENCY FREEZE / LOCKDOWN PROTOCOL
            </h2>
            <p class="font-mono text-[11px] text-red-200/70">
              Jeda serentak seluruh game session di 9 lantai kampus saat terjadi force majeure atau insiden teknis.
            </p>
          </div>
        </div>

        <button
          @click="triggerEmergencyFreeze"
          :disabled="freezing"
          class="pixel-btn h-9 px-4 text-xs font-mono font-bold bg-red-600 text-white border-red-400 flex items-center gap-2 hover:bg-red-700 shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95"
        >
          <OctagonAlert class="h-4 w-4" />
          <span>{{ freezing ? 'MEMBEKUKAN SESI...' : 'TRIGGER EMERGENCY FREEZE' }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div class="border border-red-900/60 bg-[#160b0b] p-3 rounded space-y-1">
          <span class="text-[10px] text-red-400 font-bold uppercase">1. Auto-Pause Matches</span>
          <p class="text-[11px] text-muted-foreground">Semua timer sesi game peserta dihentikan seketika.</p>
        </div>
        <div class="border border-red-900/60 bg-[#160b0b] p-3 rounded space-y-1">
          <span class="text-[10px] text-red-400 font-bold uppercase">2. Broadcast Lockdown</span>
          <p class="text-[11px] text-muted-foreground">Layar peserta menampilkan banner darurat game master.</p>
        </div>
        <div class="border border-red-900/60 bg-[#160b0b] p-3 rounded space-y-1">
          <span class="text-[10px] text-red-400 font-bold uppercase">3. Safe State Recovery</span>
          <p class="text-[11px] text-muted-foreground">Skor tidak hilang dan dapat dilanjutkan setelah aman.</p>
        </div>
      </div>
    </div>

    <!-- 2. GLOBAL REALTIME BROADCAST & STAGES GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Global Broadcast Announcement (6 cols) -->
      <div class="lg:col-span-6 pixel-card p-5 space-y-4">
        <div class="border-b border-[#4a3624] pb-2 flex items-center justify-between">
          <h2 class="font-pixel text-xs text-[#f59e0b] flex items-center gap-2">
            <Radio class="h-4 w-4 text-emerald-400" />
            SIARAN PENGUMUMAN REALTIME
          </h2>
          <span class="text-[9px] font-mono text-emerald-400 border border-emerald-500/40 bg-emerald-950/40 px-1.5 py-0.2">
            WEBSOCKET LIVE
          </span>
        </div>

        <form @submit.prevent="sendGlobalBroadcast" class="space-y-3 font-mono text-xs">
          <div class="space-y-1">
            <label class="text-muted-foreground">Judul Pengumuman *</label>
            <input
              v-model="broadcastForm.title"
              required
              placeholder="Contoh: PENGUMUMAN STAGE 2 DIBUKA"
              class="w-full h-8 px-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div class="space-y-1">
            <label class="text-muted-foreground">Tingkat Urgensi / Tipe</label>
            <select
              v-model="broadcastForm.severity"
              class="w-full h-8 px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="INFO">Informasi Umum (Info)</option>
              <option value="WARNING">Peringatan Waktu / Stage (Warning)</option>
              <option value="CRITICAL">Instruksi Kritis / Darurat (Critical)</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-muted-foreground">Pesan Siaran ke Seluruh Peserta *</label>
            <textarea
              v-model="broadcastForm.message"
              required
              rows="3"
              placeholder="Ketikkan pesan yang akan langsung muncul di smartphone peserta & buddy..."
              class="w-full p-2.5 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <button
            type="submit"
            :disabled="broadcasting || !broadcastForm.message.trim()"
            class="pixel-btn w-full h-9 bg-[#059669] text-white border-[#34d399] font-mono font-bold flex items-center justify-center gap-2 hover:bg-[#047857] disabled:opacity-50"
          >
            <Send :class="['h-4 w-4', broadcasting && 'animate-spin']" />
            <span>{{ broadcasting ? 'MENGIRIMKAN SIARAN...' : 'SIARKAN PENGUMUMAN SEKARANG' }}</span>
          </button>
        </form>
      </div>

      <!-- Stage Progression Controller (6 cols) -->
      <div class="lg:col-span-6 pixel-card p-5 space-y-4">
        <div class="border-b border-[#4a3624] pb-2 flex items-center justify-between">
          <h2 class="font-pixel text-xs text-[#f59e0b] flex items-center gap-2">
            <Layers class="h-4 w-4 text-cyan-400" />
            KONTROL TAHAPAN STAGE
          </h2>
          <span class="text-[9px] font-mono text-cyan-300">
            3 Hari Orientasi
          </span>
        </div>

        <div class="space-y-3 font-mono text-xs">
          <div
            v-for="stage in stagesList"
            :key="stage.id"
            class="border border-[#4a3624] bg-[#16110d] p-3 space-y-2 flex items-center justify-between"
          >
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-pixel text-xs text-[#f59e0b]">Stage {{ stage.order || 1 }}</span>
                <span
                  :class="[
                    'text-[8px] font-pixel px-1.5 py-0.2 border',
                    stage.status === 'ACTIVE' ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' :
                    stage.status === 'COMPLETED' ? 'border-purple-500 bg-purple-950/60 text-purple-300' :
                    'border-muted bg-muted/20 text-muted-foreground'
                  ]"
                >
                  {{ stage.status || 'LOCKED' }}
                </span>
              </div>
              <p class="font-bold text-foreground text-xs">{{ stage.name }}</p>
              <p class="text-[10px] text-muted-foreground">{{ stage.description || 'Tahapan Quest' }}</p>
            </div>

            <!-- Stage Control Buttons -->
            <div class="flex items-center gap-1.5">
              <button
                v-if="stage.status !== 'ACTIVE'"
                @click="updateStageStatus(stage.id, 'ACTIVE')"
                class="pixel-btn h-7 px-2.5 bg-[#059669] text-white border-[#34d399] font-bold text-[10px]"
              >
                Aktifkan
              </button>
              <button
                v-if="stage.status === 'ACTIVE'"
                @click="updateStageStatus(stage.id, 'COMPLETED')"
                class="pixel-btn h-7 px-2.5 bg-[#8b5cf6] text-white border-[#a78bfa] font-bold text-[10px]"
              >
                Selesaikan
              </button>
              <button
                v-if="stage.status !== 'LOCKED'"
                @click="updateStageStatus(stage.id, 'LOCKED')"
                class="pixel-btn h-7 px-2 bg-[#271d15] text-muted-foreground border-[#523e2b] text-[10px]"
              >
                Kunci
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. SERVER & DATABASE DIAGNOSTICS -->
    <div class="pixel-card p-5 space-y-4 font-mono text-xs">
      <div class="border-b border-[#4a3624] pb-2 flex items-center justify-between">
        <h2 class="font-pixel text-xs text-[#f59e0b] flex items-center gap-2">
          <Server class="h-4 w-4 text-indigo-400" />
          DIAGNOSTIK INFRASTRUKTUR KAMPUS
        </h2>
        <span class="text-[10px] text-muted-foreground">LAN Offline Server</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="border border-[#4a3624] bg-[#16110d] p-3 rounded space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[11px]">Backend API (Bun + Elysia):</span>
            <span class="text-emerald-400 font-bold flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground">Port 3000 · Reverse Proxy Nginx</p>
        </div>

        <div class="border border-[#4a3624] bg-[#16110d] p-3 rounded space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[11px]">Database (PostgreSQL 16):</span>
            <span class="text-emerald-400 font-bold flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-emerald-400" />
              CONNECTED
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground">Drizzle ORM · Schema Valid</p>
        </div>

        <div class="border border-[#4a3624] bg-[#16110d] p-3 rounded space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[11px]">WebSocket Engine:</span>
            <span class="text-emerald-400 font-bold flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-emerald-400" />
              SYNCED
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground">Native Bun WS / Realtime PubSub</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  ShieldAlert,
  AlertTriangle,
  OctagonAlert,
  Radio,
  Send,
  Layers,
  Server,
  RotateCw,
} from "lucide-vue-next";
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const freezing = ref(false);
const broadcasting = ref(false);

const stagesList = ref<any[]>([]);

const broadcastForm = ref({
  title: "PENGUMUMAN GAME MASTER",
  message: "",
  severity: "INFO",
});

onMounted(async () => {
  await loadAllData();
});

async function loadAllData() {
  loading.value = true;
  try {
    const res = await api.get("/stages");
    if (res?.success && Array.isArray(res.data)) {
      stagesList.value = res.data;
    }
  } catch (err) {
    console.error("Failed to load stages:", err);
  } finally {
    loading.value = false;
  }
}

async function triggerEmergencyFreeze() {
  const confirmMsg = prompt('Ketik "FREEZE" untuk mengonfirmasi pembekuan darurat seluruh sesi event:');
  if (confirmMsg !== "FREEZE") return;

  freezing.value = true;
  try {
    const res = await api.post("/monitoring/emergency-freeze");
    if (res?.success) {
      alert(res.message || "Protokol darurat berhasil diaktifkan!");
    }
  } catch (err: any) {
    alert("Gagal memicu emergency freeze: " + err.message);
  } finally {
    freezing.value = false;
  }
}

import { useToast } from "@/composables/useToast";

const toast = useToast();

async function sendGlobalBroadcast() {
  if (!broadcastForm.value.message.trim()) return;
  broadcasting.value = true;
  try {
    const res = await api.post("/monitoring/broadcast", {
      title: broadcastForm.value.title,
      message: broadcastForm.value.message,
      severity: broadcastForm.value.severity,
    });
    if (res?.success) {
      toast.broadcast(
        broadcastForm.value.title || "SIARAN PUSAT GAME MASTER",
        broadcastForm.value.message
      );
      toast.success("Siaran Terkirim", "Pengumuman berhasil disiarkan ke seluruh perangkat peserta!");
      broadcastForm.value.message = "";
    }
  } catch (err: any) {
    toast.error("Gagal Mengirim Siaran", err.message || "Terjadi kesalahan");
  } finally {
    broadcasting.value = false;
  }
}

async function updateStageStatus(stageId: string, status: string) {
  try {
    const res = await api.put(`/stages/${stageId}`, { status });
    if (res?.success) {
      await loadAllData();
    }
  } catch (err: any) {
    alert("Gagal mengubah status stage: " + err.message);
  }
}
</script>
