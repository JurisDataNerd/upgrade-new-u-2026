<script setup lang="ts">
import { ref } from 'vue';
import AdminLayout from '../components/layout/AdminLayout.vue';
import {
  PhTrophy,
  PhCrown,
  PhMedal,
  PhUsersThree,
  PhUser,
  PhExport,
} from '@phosphor-icons/vue';

const activeTab = ref<'individual' | 'group'>('individual');

const individualRanks = [
  { rank: 1, name: 'Dewi Ayu Larasati', nim: '260100104', prodi: 'Teknik Elektro', xp: 1950, stamps: 6 },
  { rank: 2, name: 'Ahmad Fauzi Ridwan', nim: '260100101', prodi: 'Informatika', xp: 1850, stamps: 5 },
  { rank: 3, name: 'Siti Nur Azizah', nim: '260100102', prodi: 'Bioteknologi', xp: 1600, stamps: 4 },
  { rank: 4, name: 'M. Rizqi Pratama', nim: '260100103', prodi: 'Manajemen', xp: 1450, stamps: 3 },
];

const groupRanks = [
  { rank: 1, name: 'Kelompok 01 - KH. Hasyim Asyari', cluster: 'Cluster Sains & Humaniora', avgXp: 1725, membersCount: 15 },
  { rank: 2, name: 'Kelompok 03 - KH. Bisri Syansuri', cluster: 'Cluster Teknologi Digital', avgXp: 1640, membersCount: 14 },
  { rank: 3, name: 'Kelompok 02 - KH. Wahab Chasbullah', cluster: 'Cluster Bisnis & Manajemen', avgXp: 1450, membersCount: 15 },
];
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Leaderboard & Peringkat Orientasi</h1>
          <p class="text-sm text-slate-500 mt-1">Pantau perolehan XP tertinggi mahasiswa baru dan kelompok secara real-time.</p>
        </div>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          <PhExport :size="18" />
          <span>Export Peringkat</span>
        </button>
      </div>

      <!-- Tab Buttons -->
      <div class="flex items-center gap-2 border-b border-slate-200">
        <button
          @click="activeTab = 'individual'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all',
            activeTab === 'individual'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          ]"
        >
          <PhUser :size="18" />
          <span>Peringkat Individu (MABA)</span>
        </button>

        <button
          @click="activeTab = 'group'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all',
            activeTab === 'group'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          ]"
        >
          <PhUsersThree :size="18" />
          <span>Peringkat Kelompok</span>
        </button>
      </div>

      <!-- Individual Leaderboard Table -->
      <div v-if="activeTab === 'individual'" class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
            <tr>
              <th class="px-6 py-3.5 w-16 text-center">Rank</th>
              <th class="px-6 py-3.5">Mahasiswa</th>
              <th class="px-6 py-3.5">NIM & Prodi</th>
              <th class="px-6 py-3.5 text-center">Stempel</th>
              <th class="px-6 py-3.5 text-right">Total XP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="user in individualRanks"
              :key="user.nim"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="px-6 py-4 text-center font-mono font-bold">
                <span
                  v-if="user.rank === 1"
                  class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700"
                >
                  <PhCrown :size="16" weight="fill" />
                </span>
                <span
                  v-else-if="user.rank === 2"
                  class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700"
                >
                  2
                </span>
                <span
                  v-else-if="user.rank === 3"
                  class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/10 text-amber-800"
                >
                  3
                </span>
                <span v-else class="text-slate-400">{{ user.rank }}</span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ user.name }}</td>
              <td class="px-6 py-4">
                <div class="font-mono text-xs text-slate-700">{{ user.nim }}</div>
                <div class="text-xs text-slate-400">{{ user.prodi }}</div>
              </td>
              <td class="px-6 py-4 text-center font-mono text-xs font-semibold text-teal-700">
                {{ user.stamps }} Stempel
              </td>
              <td class="px-6 py-4 text-right font-mono font-bold text-amber-600">
                {{ user.xp }} XP
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Group Leaderboard Table -->
      <div v-else class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
            <tr>
              <th class="px-6 py-3.5 w-16 text-center">Rank</th>
              <th class="px-6 py-3.5">Nama Kelompok</th>
              <th class="px-6 py-3.5">Cluster</th>
              <th class="px-6 py-3.5 text-center">Anggota</th>
              <th class="px-6 py-3.5 text-right">Rata-Rata XP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="group in groupRanks"
              :key="group.name"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="px-6 py-4 text-center font-mono font-bold">
                <span
                  v-if="group.rank === 1"
                  class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700"
                >
                  <PhTrophy :size="16" weight="fill" />
                </span>
                <span v-else class="text-slate-400">{{ group.rank }}</span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ group.name }}</td>
              <td class="px-6 py-4 text-xs text-slate-500">{{ group.cluster }}</td>
              <td class="px-6 py-4 text-center font-mono text-xs text-slate-600">{{ group.membersCount }} orang</td>
              <td class="px-6 py-4 text-right font-mono font-bold text-teal-600">
                {{ group.avgXp }} XP
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>
