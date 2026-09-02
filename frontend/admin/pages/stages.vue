<template>
  <div class="p-4 md:p-6 space-y-6 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308] shadow-md transition-transform active:scale-95"
        @click="syncOfficialRoadmap"
        :disabled="syncing"
        title="Sinkronkan struktur resmi 3-Day Roadmap GENIUS 2026"
      >
        <Sparkles :class="['h-3.5 w-3.5', syncing && 'animate-spin']" />
        <span class="hidden sm:inline">{{ syncing ? 'MENYINKRONKAN...' : 'SINKRONKAN ROADMAP' }}</span>
      </button>

      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center gap-1.5 hover:bg-[#3d2d1e] transition-colors"
        @click="openCreateModal"
        title="Tambah Stage"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">TAMBAH STAGE</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchStages"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Active Stage Hero Banner (Gold Glowing Cyber Card) -->
    <div class="pixel-card p-5 border-2 border-[#ca8a04] bg-[#1a130c] rounded-xl shadow-lg relative overflow-hidden space-y-4">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#3d2d1e] pb-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5">
            <span class="font-mono text-xs font-bold uppercase tracking-wider text-[#f59e0b] flex items-center gap-1.5">
              <Clock class="h-3.5 w-3.5 text-amber-400" />
              <span>STATUS TAHAPAN AKTIF SAAT INI</span>
            </span>
            <span class="border border-emerald-500/60 bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 rounded-full">
              <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE RUNNING</span>
            </span>
          </div>

          <h2 class="font-sans text-base sm:text-lg font-bold text-white tracking-wide">
            {{ activeStage?.name || 'DAY 1: THE INCUBATION — Fondasi Karakter & Visi 4 Tahun' }}
          </h2>

          <p class="text-xs font-mono text-gray-300 max-w-3xl leading-relaxed">
            {{ activeStage?.description || 'Mahasiswa baru fokus pada modul Day 1 Incubation, 16 skenario profil karakter, ulasan AI mentor, dan persiapan regu.' }}
          </p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            class="pixel-btn h-9 px-4 text-xs font-mono font-bold bg-[#162518] text-[#4ade80] border-[#16a34a] flex items-center gap-2 hover:bg-[#1f3722] transition-colors shadow-md"
            @click="openTransitionModal"
          >
            <Play class="h-4 w-4 text-emerald-400" />
            <span>TRANSISI TAHAPAN HARI</span>
          </button>
        </div>
      </div>

      <!-- Feature Badges on Active Stage -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div class="border border-[#3d2d1e] bg-[#0f0c09] p-3 rounded-lg space-y-1">
          <div class="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5">
            <Brain class="h-3.5 w-3.5" />
            <span>Fitur Game Utama:</span>
          </div>
          <div class="text-white font-bold text-[11px]">
            {{ getActiveStageFeatures(activeStage?.order || 1).primaryGame }}
          </div>
        </div>

        <div class="border border-[#3d2d1e] bg-[#0f0c09] p-3 rounded-lg space-y-1">
          <div class="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
            <Target class="h-3.5 w-3.5" />
            <span>Aktivitas Mahasiswa:</span>
          </div>
          <div class="text-white font-bold text-[11px]">
            {{ getActiveStageFeatures(activeStage?.order || 1).activity }}
          </div>
        </div>

        <div class="border border-[#3d2d1e] bg-[#0f0c09] p-3 rounded-lg space-y-1">
          <div class="text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1.5">
            <Award class="h-3.5 w-3.5" />
            <span>Target Output:</span>
          </div>
          <div class="text-white font-bold text-[11px]">
            {{ getActiveStageFeatures(activeStage?.order || 1).targetOutput }}
          </div>
        </div>
      </div>
    </div>

    <!-- 3-Day Journey Roadmap Visual Cards -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-mono text-xs sm:text-sm font-bold text-[#f59e0b] uppercase flex items-center gap-2">
          <Layers class="h-4 w-4 text-amber-400" />
          <span>TIMELINE 3 HARI RESMI GENIUS 2026</span>
        </h3>
        <span class="text-xs font-mono text-gray-400">Total: {{ stages.length }} Tahapan Terjadwal</span>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <!-- ==================== DAY 1 CARD ==================== -->
        <div
          class="pixel-card p-4 sm:p-5 border-2 transition-all bg-[#15110d] rounded-xl relative space-y-4"
          :class="isStageActive(1) ? 'border-[#ca8a04] bg-[#1e150d] shadow-lg' : 'border-[#3d2d1e]'"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2014] pb-3.5">
            <div class="flex items-start sm:items-center gap-3">
              <!-- Day Pill Badge -->
              <div
                class="px-2.5 py-1 border-2 font-mono font-bold text-xs rounded-md shrink-0 flex items-center gap-1.5"
                :class="isStageActive(1) ? 'border-amber-400 bg-amber-950/60 text-amber-300' : 'border-[#523e2b] bg-[#1a140f] text-gray-400'"
              >
                <span class="h-2 w-2 rounded-full" :class="isStageActive(1) ? 'bg-amber-400 animate-ping' : 'bg-gray-500'"></span>
                <span>DAY 01</span>
              </div>

              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h4 class="font-sans text-sm sm:text-base font-bold text-white tracking-wide">
                    Day 1: The Incubation (Fondasi Karakter & Visi 4 Tahun)
                  </h4>
                  <span
                    class="px-2 py-0.5 text-[10px] font-mono font-bold border rounded-full"
                    :class="getStageStatusClass(getStageByOrder(1)?.status)"
                  >
                    {{ getStageStatusLabel(getStageByOrder(1)?.status) }}
                  </span>
                </div>
                <p class="text-xs font-mono text-gray-300 mt-1 leading-relaxed">
                  Orientasi mahasiswa baru, aktivasi profil RPG, dan pengerjaan modul Day 1 Incubation (16 skenario karakter).
                </p>
              </div>
            </div>

            <!-- Stage 1 Actions -->
            <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                v-if="!isStageActive(1)"
                class="pixel-btn h-8 px-3.5 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] hover:bg-[#eab308] transition-colors"
                @click="activateStageByOrder(1)"
              >
                AKTIFKAN DAY 1
              </button>
              <button
                class="h-8 w-8 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] rounded flex items-center justify-center text-xs transition-colors"
                title="Edit Stage"
                @click="openEditModal(getStageByOrder(1))"
              >
                <Edit class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <!-- Day 1 Schedule Rundown Matrix (Clean 4-column balanced grid) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-amber-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-amber-400 font-bold">07.30 - 08.30</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-amber-950/60 text-amber-300 border border-amber-500/40 rounded">INTRON</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Registrasi peserta, pembagian ID regu, dan scan QR onboarding.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-blue-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-blue-400 font-bold">08.30 - 10.00</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-blue-950/60 text-blue-300 border border-blue-500/40 rounded">PLENARY</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Pembukaan akbar & pengenalan visi Aswaja An-Nahdliyah UNU.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-emerald-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-emerald-400 font-bold">10.00 - 15.00</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded">MAIN EVENT</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Pengerjaan 16 Skenario Incubation & evaluasi AI Senior Mentor.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-purple-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-purple-400 font-bold">15.00 - 16.30</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-purple-950/60 text-purple-300 border border-purple-500/40 rounded">PROFILING</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Review radar 5 Traits, pemilihan Kelas RPG, & Gelar inisiat.</p>
            </div>
          </div>
        </div>

        <!-- ==================== DAY 2 CARD ==================== -->
        <div
          class="pixel-card p-4 sm:p-5 border-2 transition-all bg-[#15110d] rounded-xl relative space-y-4"
          :class="isStageActive(2) ? 'border-[#ca8a04] bg-[#1e150d] shadow-lg' : 'border-[#3d2d1e]'"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2014] pb-3.5">
            <div class="flex items-start sm:items-center gap-3">
              <!-- Day Pill Badge -->
              <div
                class="px-2.5 py-1 border-2 font-mono font-bold text-xs rounded-md shrink-0 flex items-center gap-1.5"
                :class="isStageActive(2) ? 'border-amber-400 bg-amber-950/60 text-amber-300' : 'border-[#523e2b] bg-[#1a140f] text-gray-400'"
              >
                <span class="h-2 w-2 rounded-full" :class="isStageActive(2) ? 'bg-amber-400 animate-ping' : 'bg-gray-500'"></span>
                <span>DAY 02</span>
              </div>

              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h4 class="font-sans text-sm sm:text-base font-bold text-white tracking-wide">
                    Day 2: 9-Floor Campus Exploration & Multi-Game Arena
                  </h4>
                  <span
                    class="px-2 py-0.5 text-[10px] font-mono font-bold border rounded-full"
                    :class="getStageStatusClass(getStageByOrder(2)?.status)"
                  >
                    {{ getStageStatusLabel(getStageByOrder(2)?.status) }}
                  </span>
                </div>
                <p class="text-xs font-mono text-gray-300 mt-1 leading-relaxed">
                  Regu menjelajahi 9 lantai kampus UNU, scan QR pos waypoint, dan berlaga di 6 mini game interaktif.
                </p>
              </div>
            </div>

            <!-- Stage 2 Actions -->
            <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                v-if="!isStageActive(2)"
                class="pixel-btn h-8 px-3.5 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] hover:bg-[#eab308] transition-colors"
                @click="activateStageByOrder(2)"
              >
                AKTIFKAN DAY 2
              </button>
              <button
                class="h-8 w-8 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] rounded flex items-center justify-center text-xs transition-colors"
                title="Edit Stage"
                @click="openEditModal(getStageByOrder(2))"
              >
                <Edit class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <!-- Day 2 Schedule Rundown Matrix (Clean 4-column balanced grid) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-amber-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-amber-400 font-bold">08.00 - 08.30</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-amber-950/60 text-amber-300 border border-amber-500/40 rounded">BRIEFING</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Briefing rute penjelajahan regu & aktivasi radar pos lantai.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-cyan-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-cyan-400 font-bold">08.30 - 12.00</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 rounded">SESI 1: LT 1-4</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Eksplorasi Lt.1-4: Team Quiz Hub, Speed Reaction, Memory Match.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-pink-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-pink-400 font-bold">13.00 - 15.30</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-pink-950/60 text-pink-300 border border-pink-500/40 rounded">SESI 2: LT 5-8</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Eksplorasi Lt.5-8: Cyber Decoder, AI Canvas Drawing, Quiz Sains.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-red-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-red-400 font-bold">15.30 - 16.30</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-red-950/60 text-red-300 border border-red-500/40 rounded">GRAND RAID</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Lantai 9 Sky Garden: Boss Showdown Raid Guardian AI bersama tim.</p>
            </div>
          </div>
        </div>

        <!-- ==================== DAY 3 CARD ==================== -->
        <div
          class="pixel-card p-4 sm:p-5 border-2 transition-all bg-[#15110d] rounded-xl relative space-y-4"
          :class="isStageActive(3) ? 'border-[#ca8a04] bg-[#1e150d] shadow-lg' : 'border-[#3d2d1e]'"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2014] pb-3.5">
            <div class="flex items-start sm:items-center gap-3">
              <!-- Day Pill Badge -->
              <div
                class="px-2.5 py-1 border-2 font-mono font-bold text-xs rounded-md shrink-0 flex items-center gap-1.5"
                :class="isStageActive(3) ? 'border-amber-400 bg-amber-950/60 text-amber-300' : 'border-[#523e2b] bg-[#1a140f] text-gray-400'"
              >
                <span class="h-2 w-2 rounded-full" :class="isStageActive(3) ? 'bg-amber-400 animate-ping' : 'bg-gray-500'"></span>
                <span>DAY 03</span>
              </div>

              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h4 class="font-sans text-sm sm:text-base font-bold text-white tracking-wide">
                    Day 3: Grand Finale & Coronation (Coming Soon ⏳)
                  </h4>
                  <span
                    class="px-2 py-0.5 text-[10px] font-mono font-bold border rounded-full"
                    :class="getStageStatusClass(getStageByOrder(3)?.status)"
                  >
                    {{ getStageStatusLabel(getStageByOrder(3)?.status) }}
                  </span>
                </div>
                <p class="text-xs font-mono text-gray-300 mt-1 leading-relaxed">
                  Rekapitulasi total poin, penobatan Juara Umum angkatan, pembagian 99 Gelar Codex, dan inisiasi resmi.
                </p>
              </div>
            </div>

            <!-- Stage 3 Actions -->
            <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                v-if="!isStageActive(3)"
                class="pixel-btn h-8 px-3.5 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] hover:bg-[#eab308] transition-colors"
                @click="activateStageByOrder(3)"
              >
                AKTIFKAN DAY 3
              </button>
              <button
                class="h-8 w-8 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] rounded flex items-center justify-center text-xs transition-colors"
                title="Edit Stage"
                @click="openEditModal(getStageByOrder(3))"
              >
                <Edit class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <!-- Day 3 Schedule Rundown Matrix (Clean 4-column balanced grid) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-amber-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-amber-400 font-bold">09.00 - 10.30</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-amber-950/60 text-amber-300 border border-amber-500/40 rounded">AUDIT</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Freeze & audit leaderboard akhir (Poin Tim + Individu + Buddy).</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-yellow-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-yellow-400 font-bold">10.30 - 12.00</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-yellow-950/60 text-yellow-300 border border-yellow-500/40 rounded">AWARDING</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Penobatan Juara Umum GENIUS 2026 & penyerahan Gelar SSR/SR/Epic.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-emerald-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-emerald-400 font-bold">13.00 - 14.30</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded">INISIASI</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Upacara inisiasi resmi mahasiswa baru menjadi bagian sivitas akademika.</p>
            </div>

            <div class="bg-[#0e0c0a] p-3 rounded-lg border-l-2 border-l-indigo-500 border border-[#2e2318] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-indigo-400 font-bold">14.30 - 16.00</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 rounded">CLOSING</span>
              </div>
              <p class="text-[11px] text-gray-300 leading-snug">Selebrasi penutupan akbar, pengumuman tim terfavorit, & sesi foto.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Buat / Edit Stage -->
    <Dialog :open="showStageModal" @update:open="showStageModal = $event">
      <DialogContent class="sm:max-w-[480px] pixel-card border-2 border-[#f59e0b] bg-[#140f0c] text-foreground p-5">
        <DialogHeader>
          <DialogTitle class="font-mono text-sm font-bold text-[#f59e0b] flex items-center gap-2">
            <Layers class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT DATA TAHAPAN STAGE' : 'TAMBAH TAHAPAN BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitStageForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Urutan Hari (Order):</Label>
            <input
              type="number"
              v-model.number="form.order"
              class="w-full h-8 px-2.5 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Nama Stage / Babak Acara:</Label>
            <input
              v-model="form.name"
              placeholder="Contoh: Day 1: The Incubation"
              class="w-full h-8 px-2.5 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Deskripsi & Instruksi Babak:</Label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Penjelasan aktivitas mahasiswa pada hari ini..."
              class="w-full bg-[#0e0c0a] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-[#f59e0b]"
            ></textarea>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Status Stage:</Label>
            <select
              v-model="form.status"
              class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="ACTIVE">ACTIVE (Sedang Berjalan)</option>
              <option value="UPCOMING">UPCOMING (Mendatang)</option>
              <option value="COMPLETED">COMPLETED (Selesai)</option>
            </select>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2 border-t border-[#3d2d1e]">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground rounded"
              @click="showStageModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308]"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>{{ isEditing ? 'SIMPAN PERUBAHAN' : 'BUAT STAGE' }}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal: Transisi Tahapan Acara (Stage Transition) -->
    <Dialog :open="showTransitionModal" @update:open="showTransitionModal = $event">
      <DialogContent class="sm:max-w-[460px] pixel-card border-2 border-[#16a34a] bg-[#140f0c] text-foreground p-5">
        <DialogHeader>
          <DialogTitle class="font-mono text-sm font-bold text-[#4ade80] flex items-center gap-2">
            <Play class="h-4 w-4 text-emerald-400" />
            <span>TRANSISI TAHAPAN HARI (EVENT TRANSITION)</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-1 font-mono text-xs">
          <p class="text-gray-300 leading-relaxed">
            Pilih hari baru untuk diaktifkan serentak. Tahapan sebelumnya akan otomatis ditandai <strong class="text-gray-400">COMPLETED</strong> dan seluruh sistem player akan diarahkan ke hari yang dipilih:
          </p>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Tahapan Aktif Baru:</Label>
            <select
              v-model="targetTransitionStageId"
              class="w-full h-9 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#4ade80]"
            >
              <option v-for="s in stages" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.status }})
              </option>
            </select>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2 border-t border-[#3d2d1e]">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground rounded"
              @click="showTransitionModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="pixel-btn h-8 px-4 text-xs font-mono font-bold bg-[#16a34a] text-white border-[#4ade80] shadow-md"
              @click="confirmStageTransition"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>AKTIFKAN TAHAPAN BARU</span>
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
  Calendar,
  Layers,
  Plus,
  RotateCw,
  Sparkles,
  Play,
  Edit,
  Clock,
  Brain,
  Target,
  Award,
} from "lucide-vue-next";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const saving = ref(false);
const syncing = ref(false);
const stages = ref<any[]>([]);

const showStageModal = ref(false);
const isEditing = ref(false);
const showTransitionModal = ref(false);
const targetTransitionStageId = ref("");

const form = ref<any>({
  id: "",
  order: 1,
  name: "",
  description: "",
  status: "ACTIVE",
});

const activeStage = computed(() => {
  return stages.value.find((s) => s.status === "ACTIVE") || stages.value[0];
});

function getStageByOrder(order: number) {
  return stages.value.find((s) => s.order === order);
}

function isStageActive(order: number) {
  const st = getStageByOrder(order);
  return st?.status === "ACTIVE";
}

function getStageStatusLabel(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "SEDANG BERJALAN (LIVE)";
    case "COMPLETED":
      return "SELESAI (COMPLETED)";
    case "UPCOMING":
    default:
      return "MENDATANG / STANDBY";
  }
}

function getStageStatusClass(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-500/60 bg-emerald-950/60 text-emerald-400 font-bold";
    case "COMPLETED":
      return "border-blue-500/60 bg-blue-950/60 text-blue-400";
    case "UPCOMING":
    default:
      return "border-gray-600/60 bg-gray-950/60 text-gray-400";
  }
}

function getActiveStageFeatures(order: number) {
  if (order === 1) {
    return {
      primaryGame: "Day 1 Incubation & Profiling",
      activity: "Pengerjaan 16 Skenario Karakter & Evaluasi AI",
      targetOutput: "Radar 5 Traits & Penetapan Gelar Inisiat",
    };
  } else if (order === 2) {
    return {
      primaryGame: "6 Mini-Game Arena (Quiz, Reflex, Memory, Cipher, AI Canvas, Boss)",
      activity: "Eksplorasi 9 Lantai Kampus & Scan QR Pos Waypoint",
      targetOutput: "Akumulasi Poin Regu & Perebutan Peringkat Leaderboard",
    };
  } else {
    return {
      primaryGame: "Grand Finale & Coronation Ceremony",
      activity: "Audit Poin Akhir, Penobatan Juara, & Penyerahan Gelar 99 Codex",
      targetOutput: "Penetapan Juara Angkatan GENIUS 2026",
    };
  }
}

async function fetchStages() {
  loading.value = true;
  try {
    const res: any = await api.get("/api/stages");
    if (res.success && res.data) {
      stages.value = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch stages:", err);
  } finally {
    loading.value = false;
  }
}

async function syncOfficialRoadmap() {
  syncing.value = true;
  try {
    const res: any = await api.post("/api/stages/sync-roadmap", {});
    if (res.success) {
      await fetchStages();
      alert(res.message || "Berhasil menyinkronkan 3-Day Event Roadmap!");
    }
  } catch (err: any) {
    alert("Gagal sinkronisasi roadmap: " + (err.message || "Error"));
  } finally {
    syncing.value = false;
  }
}

async function activateStageByOrder(order: number) {
  const target = getStageByOrder(order);
  if (!target) {
    // Sync first if not exist
    await syncOfficialRoadmap();
    return;
  }

  if (confirm(`Aktifkan '${target.name}' sebagai babak aktif saat ini?`)) {
    try {
      const res: any = await api.put(`/api/stages/${target.id}/activate`, {});
      if (res.success) {
        await fetchStages();
      }
    } catch (err: any) {
      alert("Gagal mengaktifkan stage: " + (err.message || "Error"));
    }
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    order: stages.value.length + 1,
    name: "",
    description: "",
    status: "UPCOMING",
  };
  showStageModal.value = true;
}

function openEditModal(stage: any) {
  if (!stage) return;
  isEditing.value = true;
  form.value = {
    id: stage.id,
    order: stage.order,
    name: stage.name,
    description: stage.description || "",
    status: stage.status || "UPCOMING",
  };
  showStageModal.value = true;
}

async function submitStageForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/stages/${form.value.id}`, {
        order: form.value.order,
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
      });
    } else {
      await api.post("/api/stages", {
        order: form.value.order,
        name: form.value.name,
        description: form.value.description,
      });
    }
    showStageModal.value = false;
    await fetchStages();
  } catch (err: any) {
    alert("Gagal menyimpan stage: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

function openTransitionModal() {
  if (stages.value.length > 0) {
    targetTransitionStageId.value = stages.value[0].id;
  }
  showTransitionModal.value = true;
}

async function confirmStageTransition() {
  if (!targetTransitionStageId.value) return;
  saving.value = true;
  try {
    const res: any = await api.put(`/api/stages/${targetTransitionStageId.value}/activate`, {});
    if (res.success) {
      showTransitionModal.value = false;
      await fetchStages();
    }
  } catch (err: any) {
    alert("Gagal transisi stage: " + (err.message || "Error"));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchStages();
});
</script>
