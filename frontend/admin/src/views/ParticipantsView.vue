<script setup lang="ts">
import AdminLayout from '../components/layout/AdminLayout.vue';
import { useAdminStore } from '../store/adminStore';
import {
  PhArrowCounterClockwise,
  PhDownloadSimple,
  PhMagnifyingGlass,
  PhMedal,
  PhStudent,
} from '@phosphor-icons/vue';

const store = useAdminStore();

const handleReset = (nim: string, name: string) => {
  if (confirm(`Apakah Anda yakin ingin me-reset seluruh progres mahasiswa ${name} (${nim})?`)) {
    store.resetParticipantProgress(nim);
  }
};
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Data Mahasiswa Baru</h1>
          <p class="text-sm text-slate-500 mt-1">Kelola progres eksplorasi, perolehan XP, dan stempel mahasiswa.</p>
        </div>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          <PhDownloadSimple :size="18" />
          <span>Export Rekap Nilai</span>
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="relative w-full sm:w-80">
          <PhMagnifyingGlass :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="store.searchQuery"
            type="text"
            placeholder="Cari NIM, nama, prodi..."
            class="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <div class="text-xs text-slate-500">
          Menampilkan <span class="font-bold text-slate-800 font-mono">{{ store.filteredParticipants.length }}</span> mahasiswa
        </div>
      </div>

      <!-- Participants Table -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50/80 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th class="px-6 py-3.5">Mahasiswa</th>
                <th class="px-6 py-3.5">NIM & Prodi</th>
                <th class="px-6 py-3.5">Kelompok</th>
                <th class="px-6 py-3.5 text-center">Booth Selesai</th>
                <th class="px-6 py-3.5 text-right">Total XP</th>
                <th class="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="student in store.filteredParticipants"
                :key="student.nim"
                class="hover:bg-slate-50/60 transition-colors"
              >
                <!-- Name & Avatar -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
                      {{ student.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900">{{ student.name }}</div>
                      <div class="text-xs text-slate-400">{{ student.faculty }}</div>
                    </div>
                  </div>
                </td>

                <!-- NIM & Prodi -->
                <td class="px-6 py-4">
                  <div class="font-mono text-xs font-semibold text-slate-800">{{ student.nim }}</div>
                  <div class="text-xs text-slate-500">{{ student.prodi }}</div>
                </td>

                <!-- Kelompok -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    <PhStudent :size="14" />
                    {{ student.groupName || '-' }}
                  </span>
                </td>

                <!-- Booth Selesai -->
                <td class="px-6 py-4 text-center">
                  <span class="font-mono font-bold text-xs text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-full">
                    {{ student.completedBooths.length }} / 18
                  </span>
                </td>

                <!-- Total XP -->
                <td class="px-6 py-4 text-right">
                  <div class="font-mono font-bold text-amber-600 flex items-center justify-end gap-1">
                    <PhMedal :size="16" weight="fill" />
                    {{ student.totalXp }} XP
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-center">
                  <button
                    @click="handleReset(student.nim, student.name)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Reset Progres Mahasiswa"
                  >
                    <PhArrowCounterClockwise :size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
