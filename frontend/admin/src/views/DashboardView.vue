<script setup lang="ts">
import AdminLayout from '../components/layout/AdminLayout.vue';
import { useAdminStore } from '../store/adminStore';
import {
  PhUsersThree,
  PhStamp,
  PhBuildings,
  PhChartLineUp,
  PhCheckCircle,
  PhFire,
} from '@phosphor-icons/vue';

const store = useAdminStore();
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Dashboard Orientasi PKKMB 2026</h1>
          <p class="text-sm text-slate-500 mt-1">Monitoring progres orientasi, partisipasi mahasiswa baru & status 9 lantai.</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <span class="w-2 h-2 rounded-full bg-teal-500"></span>
          Data terintegrasi real-time
        </div>
      </div>

      <!-- Stat Cards Bento Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase">Mahasiswa Terdaftar</span>
            <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <PhUsersThree :size="20" weight="bold" />
            </div>
          </div>
          <div class="mt-3 text-2xl font-bold text-slate-900 font-mono">{{ store.stats.totalParticipants }}</div>
          <div class="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <PhFire :size="14" />
            <span>{{ store.stats.activeToday }} aktif hari ini</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase">Stempel Diterbitkan</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PhStamp :size="20" weight="bold" />
            </div>
          </div>
          <div class="mt-3 text-2xl font-bold text-slate-900 font-mono">{{ store.stats.totalStampsIssued }}</div>
          <div class="mt-1 text-xs text-slate-500">Total dari 18 booth eksplorasi</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase">Rata-rata Lantai Selesai</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PhBuildings :size="20" weight="bold" />
            </div>
          </div>
          <div class="mt-3 text-2xl font-bold text-slate-900 font-mono">{{ store.stats.averageFloorsCompleted }} / 9</div>
          <div class="mt-1 text-xs text-amber-600 font-medium">68.8% progres keseluruhan</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase">Tingkat Kelulusan</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PhChartLineUp :size="20" weight="bold" />
            </div>
          </div>
          <div class="mt-3 text-2xl font-bold text-slate-900 font-mono">92.4%</div>
          <div class="mt-1 text-xs text-emerald-600 font-medium">Memenuhi syarat Upgraded You</div>
        </div>
      </div>

      <!-- Floor Completion Progression & Top Booths -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Floor Progression (2 Cols) -->
        <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-base font-bold text-slate-900">Progres Penyelesaian per Lantai (9 Lantai)</h2>
            <span class="text-xs text-slate-400 font-mono">Target: 1,450 MABA</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="floor in store.stats.floorCompletions"
              :key="floor.floorNumber"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-slate-700">{{ floor.floorName }}</span>
                <span class="font-mono font-semibold text-slate-900">{{ floor.count }} mhs ({{ Math.round((floor.count / 1450) * 100) }}%)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-teal-500 h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${(floor.count / 1450) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Booths (1 Col) -->
        <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-base font-bold text-slate-900">Booth Paling Populer</h2>
            <span class="text-xs text-slate-400">Penyelesaian</span>
          </div>

          <div class="divide-y divide-slate-100">
            <div
              v-for="(booth, idx) in store.stats.topBooths"
              :key="booth.boothId"
              class="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span class="w-6 text-xs font-mono font-bold text-slate-400">#{{ idx + 1 }}</span>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ booth.boothName }}</div>
                  <div class="text-xs text-slate-400 font-mono">{{ booth.completionsCount }} mahasiswa</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-mono font-bold text-teal-600">{{ booth.avgScore }} avg</div>
                <div class="text-[10px] text-slate-400">skor kuis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
