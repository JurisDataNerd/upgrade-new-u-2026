<script setup lang="ts">
import AdminLayout from '../components/layout/AdminLayout.vue';
import {
  PhCheckCircle,
  PhPuzzlePiece,
  PhGear,
  PhLightning,
} from '@phosphor-icons/vue';

interface AdminFloorCard {
  floorNumber: number;
  name: string;
  theme: string;
  boothA: { name: string; type: string; status: 'active' | 'maintenance' };
  boothB: { name: string; type: string; status: 'active' | 'maintenance' };
}

const floors: AdminFloorCard[] = [
  {
    floorNumber: 1,
    name: 'Lantai 1 - Gedung Terpadu',
    theme: 'Pondasi Karakter, Aswaja & Visi Kampus',
    boothA: { name: 'Aswaja & Ke-NU-an', type: 'TTS (Crossword)', status: 'active' },
    boothB: { name: 'Sejarah & Visi UNU', type: 'Kuis Cepat', status: 'active' },
  },
  {
    floorNumber: 2,
    name: 'Lantai 2 - Zona Integritas',
    theme: 'Budaya Anti-Korupsi & Kampus Bersih Narkoba',
    boothA: { name: 'Integritas & Anti-Korupsi', type: 'Tebak Kata', status: 'active' },
    boothB: { name: 'Zona Bebas Narkoba', type: 'Benar / Salah', status: 'active' },
  },
  {
    floorNumber: 3,
    name: 'Lantai 3 - Literasi Masa Depan',
    theme: 'Etika Digital, AI Literacy & Anti-Kekerasan',
    boothA: { name: 'Etika Digital & Media', type: 'Kuis Pilihan Ganda', status: 'active' },
    boothB: { name: 'Anti-Kekerasan & Bullying', type: 'Memory Match', status: 'active' },
  },
  {
    floorNumber: 4,
    name: 'Lantai 4 - Science & Innovation Hub',
    theme: 'Riset, Laboratorium & Inovasi Teknologi',
    boothA: { name: 'Laboratorium Sains Terpadu', type: 'Tebak Posisi', status: 'active' },
    boothB: { name: 'Inovasi Riset Unggulan', type: 'Kuis Cepat', status: 'active' },
  },
  {
    floorNumber: 5,
    name: 'Lantai 5 - Entrepreneurship & Career',
    theme: 'Inkubasi Bisnis, Karir & Masa Depan',
    boothA: { name: 'Klinik Karir & Magang', type: 'Memory Match', status: 'active' },
    boothB: { name: 'Inkubator Bisnis Santripreneur', type: 'Tebak Kata', status: 'active' },
  },
  {
    floorNumber: 6,
    name: 'Lantai 6 - Leadership & Hall',
    theme: 'Kepemimpinan Mahasiswa & Organisasi',
    boothA: { name: 'BEM & Ormawa Center', type: 'Kuis Pilihan Ganda', status: 'active' },
    boothB: { name: 'Public Speaking & Leadership', type: 'Benar / Salah', status: 'active' },
  },
  {
    floorNumber: 7,
    name: 'Lantai 7 - Global Citizenship',
    theme: 'Wawasan Internasional & Penguasaan Bahasa',
    boothA: { name: 'International Affairs (KUI)', type: 'Tebak Kata', status: 'active' },
    boothB: { name: 'Language & Culture Center', type: 'TTS (Crossword)', status: 'active' },
  },
  {
    floorNumber: 8,
    name: 'Lantai 8 - Moderasi & Harmoni',
    theme: 'Moderasi Beragama & Toleransi Global',
    boothA: { name: 'Pusat Moderasi Beragama', type: 'Benar / Salah', status: 'active' },
    boothB: { name: 'Dialog Lintas Budaya', type: 'Memory Match', status: 'active' },
  },
  {
    floorNumber: 9,
    name: 'Lantai 9 - Upgraded You Final Stage',
    theme: 'Deklarasi Kelulusan & Pengukuhan Karakter',
    boothA: { name: 'Master Grand Challenge', type: 'Kuis Komprehensif', status: 'active' },
    boothB: { name: 'Ikrar Mahasiswa UNU 2026', type: 'Stamp Declaration', status: 'active' },
  },
];
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Manajemen 9 Lantai & 18 Booth</h1>
          <p class="text-sm text-slate-500 mt-1">Status booth mini-game, konfigurasi kuis, dan pengawasan lantai PKKMB.</p>
        </div>
      </div>

      <!-- Floors Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="fl in floors"
          :key="fl.floorNumber"
          class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-bold font-mono text-sm flex items-center justify-center border border-teal-200/60">
                L{{ fl.floorNumber }}
              </span>
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <PhCheckCircle :size="14" weight="fill" />
                Siap
              </span>
            </div>

            <h2 class="mt-3 font-bold text-slate-900 text-base">{{ fl.name }}</h2>
            <p class="text-xs text-slate-500 mt-0.5">{{ fl.theme }}</p>

            <!-- Booths in floor -->
            <div class="mt-4 space-y-2.5">
              <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <PhPuzzlePiece :size="16" class="text-teal-600" />
                  <div>
                    <div class="font-semibold text-slate-800">{{ fl.boothA.name }}</div>
                    <div class="text-[10px] text-slate-400">{{ fl.boothA.type }}</div>
                  </div>
                </div>
                <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200/60 text-slate-600 rounded">A</span>
              </div>

              <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <PhPuzzlePiece :size="16" class="text-indigo-600" />
                  <div>
                    <div class="font-semibold text-slate-800">{{ fl.boothB.name }}</div>
                    <div class="text-[10px] text-slate-400">{{ fl.boothB.type }}</div>
                  </div>
                </div>
                <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200/60 text-slate-600 rounded">B</span>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>2 Booth Aktif</span>
            <button class="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
              <PhGear :size="14" />
              Kelola Soal
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
