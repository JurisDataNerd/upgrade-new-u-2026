<template>
  <div class="p-4 md:p-6 space-y-6 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308] shadow-md transition-transform active:scale-95"
        @click="syncDefaultGames"
        :disabled="syncing"
        title="Sinkronkan 7 template mini game resmi ke database"
      >
        <Sparkles :class="['h-3.5 w-3.5', syncing && 'animate-spin']" />
        <span class="hidden sm:inline">{{ syncing ? 'MENYINKRONKAN...' : 'SINKRONKAN 7 GAME' }}</span>
      </button>

      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center gap-1.5 hover:bg-[#3d2d1e] transition-colors"
        @click="openCreateModal"
        title="Buat Game Baru"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">BUAT GAME</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchGames"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Katalog mini games, live engine settings, parameter penskoran, dan kontrol realtime LAN kampus UNU Yogyakarta.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#ca8a04]/60 bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15] flex items-center gap-1">
          <Zap class="h-3 w-3 text-amber-400" />
          7 CORE ENGINES
        </span>
      </div>
    </div>

    <!-- Live Status Overview Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="pixel-card p-3.5 border-l-4 border-l-amber-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-gray-400 uppercase">TOTAL ENGINE GAME</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-[#facc15] mt-1">{{ games.length }}</div>
        <div class="text-[10px] font-mono text-emerald-400 mt-0.5">Semua Engine Siap Digunakan</div>
      </div>

      <div class="pixel-card p-3.5 border-l-4 border-l-emerald-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-gray-400 uppercase">ENGINE AKTIF (READY)</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
          {{ games.filter(g => g.status === 'ACTIVE').length }}
        </div>
        <div class="text-[10px] font-mono text-gray-400 mt-0.5">Dapat dimainkan di Pos Misi</div>
      </div>

      <div class="pixel-card p-3.5 border-l-4 border-l-cyan-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-gray-400 uppercase">TOTAL TERIKAT KE MISI</div>
        <div class="font-pixel text-xl sm:text-2xl font-bold text-cyan-400 mt-1">
          {{ games.reduce((acc, g) => acc + (g.missionUsageCount || 0), 0) }}
        </div>
        <div class="text-[10px] font-mono text-cyan-300 mt-0.5">Pos Misi Terintegrasi</div>
      </div>

      <div class="pixel-card p-3.5 border-l-4 border-l-purple-500 bg-[#120f0c]">
        <div class="font-pixel text-[10px] text-gray-400 uppercase">GAME 1 INCUBATION</div>
        <div class="flex items-center justify-between mt-1">
          <div :class="['font-pixel text-sm sm:text-base font-bold', incubationStatus === 'OPEN' ? 'text-emerald-400' : 'text-rose-400']">
            {{ incubationStatus === 'OPEN' ? '🟢 TERBUKA' : '🔒 TERKUNCI' }}
          </div>
          <button
            @click="toggleIncubationMaster"
            class="text-[9px] font-pixel px-2 py-1 bg-[#271d15] border border-[#523e2b] text-amber-300 hover:border-amber-400"
          >
            {{ incubationStatus === 'OPEN' ? 'KUNCI' : 'BUKA' }}
          </button>
        </div>
        <div class="text-[10px] font-mono text-purple-300 mt-0.5">Master Gate Hari 1</div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="pixel-toolbar-sticky p-3 space-y-3 bg-[#17120d] border border-[#3d2d1e] rounded-lg">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari nama game, tipe, atau aturan main..."
            class="w-full h-8 text-xs font-mono pl-9 pr-3 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- Status Filter -->
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-mono text-gray-400">Status:</span>
          <div class="flex gap-1">
            <button
              v-for="st in ['ALL', 'ACTIVE', 'INACTIVE']"
              :key="st"
              @click="statusFilter = st"
              :class="[
                'px-2.5 py-1 text-[10px] font-pixel border transition-colors',
                statusFilter === st
                  ? 'bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold'
                  : 'bg-[#271d15] text-gray-400 border-[#523e2b] hover:text-white'
              ]"
            >
              {{ st === 'ALL' ? 'SEMUA' : st }}
            </button>
          </div>
        </div>
      </div>

      <!-- Type Badges Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-mono">
        <button
          v-for="cat in CATEGORY_TABS"
          :key="cat.type"
          @click="selectedCategory = cat.type"
          :class="[
            'px-2.5 py-1 rounded border whitespace-nowrap flex items-center gap-1.5 transition-all',
            selectedCategory === cat.type
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
              : 'bg-[#0e0c0a] text-gray-400 border-[#3d2d1e] hover:border-gray-500'
          ]"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
          <span v-if="cat.type !== 'ALL'" class="px-1.5 py-0.2 rounded-full bg-black/50 text-[9px]">
            {{ games.filter(g => g.type === cat.type).length }}
          </span>
        </button>
      </div>
    </div>

    <!-- Game Engine Grid Cards -->
    <div class="space-y-4">
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="pixel-card p-5 animate-pulse h-64 bg-[#271d15] rounded-lg"></div>
      </div>

      <div v-else-if="filteredGames.length === 0" class="pixel-card p-12 text-center text-xs text-muted-foreground font-mono bg-[#140f0c]">
        <Gamepad2 class="h-10 w-10 text-gray-600 mx-auto mb-3" />
        <p class="text-sm font-bold text-gray-300">Tidak ada game yang cocok dengan pencarian.</p>
        <p class="text-[11px] text-gray-500 mt-1">Klik tombol "SINKRONKAN 7 GAME RESMI" untuk memuat template default.</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="g in filteredGames"
          :key="g.id"
          class="pixel-card p-4 space-y-3.5 flex flex-col justify-between border-2 transition-all hover:border-[#f59e0b] group bg-[#15110d] rounded-xl relative overflow-hidden"
          :style="{ borderColor: getGameThemeColor(g.type) + '44' }"
        >
          <!-- Top Glow Accent -->
          <div
            class="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
            :style="{ background: getGameThemeColor(g.type) }"
          ></div>

          <div class="space-y-3">
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex items-center gap-3">
                <div
                  class="h-11 w-11 border-2 flex items-center justify-center font-pixel text-lg shrink-0 rounded-lg shadow-md"
                  :style="{
                    borderColor: getGameThemeColor(g.type),
                    backgroundColor: getGameThemeColor(g.type) + '22',
                    color: getGameThemeColor(g.type)
                  }"
                >
                  <component :is="getGameIcon(g.type)" class="h-6 w-6" />
                </div>
                <div>
                  <h3 class="font-pixel text-xs sm:text-sm font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">
                    {{ g.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span
                      class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded"
                      :style="{
                        backgroundColor: getGameThemeColor(g.type) + '25',
                        color: getGameThemeColor(g.type)
                      }"
                    >
                      {{ getGameTypeLabel(g.type) }}
                    </span>
                    <span v-if="g.missionUsageCount > 0" class="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <Target class="h-3 w-3" />
                      <span>{{ g.missionUsageCount }} Pos</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quick Toggle Status Button -->
              <button
                @click="toggleGameStatus(g)"
                :class="[
                  'px-2 py-0.5 text-[9px] font-pixel border rounded cursor-pointer transition-transform active:scale-95',
                  g.status === 'ACTIVE'
                    ? 'border-emerald-500/60 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/60'
                    : 'border-rose-500/60 bg-rose-950/50 text-rose-400 hover:bg-rose-900/60'
                ]"
                title="Klik untuk mengubah status aktif/standby"
              >
                {{ g.status === 'ACTIVE' ? 'READY ✓' : 'STANDBY' }}
              </button>
            </div>

            <!-- Description -->
            <p class="text-[11px] font-mono text-gray-300 line-clamp-2 leading-relaxed">
              {{ g.description || 'Mini game interaktif dengan sistem evaluasi otomatis server-authoritative.' }}
            </p>

            <!-- Rules & Config Highlights Matrix -->
            <div class="border border-[#3d2d1e] bg-[#0c0a08] p-2.5 rounded-lg font-mono text-xs space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-gray-400 flex items-center gap-1.5">
                  <Clock class="h-3.5 w-3.5 text-amber-400" />
                  <span>Batas Waktu:</span>
                </span>
                <span class="text-white font-bold">{{ g.config?.timeLimitSeconds || g.config?.timeLimitPerQuestion || 60 }} Detik</span>
              </div>

              <div class="flex items-center justify-between text-[11px]">
                <span class="text-gray-400 flex items-center gap-1.5">
                  <Trophy class="h-3.5 w-3.5 text-yellow-400" />
                  <span>Max Reward:</span>
                </span>
                <span class="text-emerald-400 font-pixel text-xs">{{ g.config?.maxScore || g.config?.completionRewardPoints || 100 }} PTS</span>
              </div>

              <div class="flex items-center justify-between text-[11px]">
                <span class="text-gray-400 flex items-center gap-1.5">
                  <Users class="h-3.5 w-3.5 text-cyan-400" />
                  <span>Kapasitas Pemain:</span>
                </span>
                <span class="text-gray-300 font-bold">{{ g.minPlayers || 1 }} - {{ g.maxPlayers || 10 }} Pemain</span>
              </div>

              <!-- Special Mode Config Tags -->
              <div v-if="g.type === 'QUIZ'" class="text-[10px] text-amber-300/90 pt-1 border-t border-[#231b14] flex items-center justify-between">
                <span>Soal: {{ g.config?.questionsCount || 5 }} Butir ({{ g.questionBankCategory || 'Kampus UNU' }})</span>
                <span>Streak: {{ g.config?.streakMultiplier || 1.5 }}x</span>
              </div>

              <div v-else-if="g.type === 'IMAGE_GUESS'" class="text-[10px] text-pink-300/90 pt-1 border-t border-[#231b14] flex items-center justify-between">
                <span>Model AI: {{ g.config?.aiModel || 'gemini-2.0-flash' }}</span>
                <span>Kurator Seni Senior</span>
              </div>

              <div v-else-if="g.type === 'TEAM_CHALLENGE'" class="text-[10px] text-red-300/90 pt-1 border-t border-[#231b14] flex items-center justify-between">
                <span>Boss HP: {{ g.config?.bossMaxHp || 5000 }} HP</span>
                <span>QTE Interval: {{ g.config?.qteIntervalSeconds || 8 }}s</span>
              </div>

              <div v-else-if="g.type === 'EXPLORATION'" class="text-[10px] text-purple-300/90 pt-1 border-t border-[#231b14] flex items-center justify-between">
                <span>16 Skenario Psikologis</span>
                <span>Archetype Radar Traits</span>
              </div>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="border-t border-[#2b2014] pt-2.5 flex items-center justify-between">
            <span class="text-[10px] font-mono text-gray-500">LAN Synchronized</span>

            <div class="flex items-center gap-1.5">
              <!-- Settings Button -->
              <button
                class="px-2.5 py-1.5 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] hover:bg-[#3d2d1e] rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                title="Buka Pengaturan Lengkap Engine"
                @click="openEditModal(g)"
              >
                <Settings class="h-3.5 w-3.5" />
                <span>PENGATURAN</span>
              </button>

              <!-- Delete Button -->
              <button
                class="h-8 w-8 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] hover:bg-rose-950/40 rounded flex items-center justify-center text-xs transition-colors"
                title="Hapus Game"
                @click="confirmDelete(g)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: PENGATURAN & KONFIGURASI ENGINE GAME -->
    <Dialog :open="showGameModal" @update:open="showGameModal = $event">
      <DialogContent class="sm:max-w-[620px] max-h-[90vh] overflow-y-auto custom-scrollbar pixel-card border-2 border-[#f59e0b] bg-[#140f0c] text-foreground p-5">
        <DialogHeader>
          <DialogTitle class="font-pixel text-base text-[#f59e0b] flex items-center gap-2">
            <Settings class="h-5 w-5 text-amber-400" />
            <span>{{ isEditing ? 'PENGATURAN ENGINE GAME: ' + form.name : 'BUAT TEMPLATE ENGINE GAME BARU' }}</span>
          </DialogTitle>
          <p class="text-xs font-mono text-muted-foreground mt-0.5">
            Konfigurasi parameter aturan main, kalkulasi poin, batas waktu, dan interaksi multipemain.
          </p>
        </DialogHeader>

        <form @submit.prevent="submitGameForm" class="space-y-4 py-2 font-mono text-xs">
          <!-- 1. IDENTITAS DASAR -->
          <div class="space-y-3 bg-[#1d1611] p-3.5 rounded-lg border border-[#3d2d1e]">
            <div class="font-pixel text-[11px] text-amber-400 uppercase flex items-center gap-1.5">
              <Gamepad2 class="h-3.5 w-3.5" />
              <span>1. Identitas & Mekanisme Game</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs font-semibold">Nama Mini Game:</Label>
                <input
                  v-model="form.name"
                  placeholder="Contoh: Team Quiz Hub"
                  class="w-full h-8 px-2.5 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
                  required
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs font-semibold">Tipe Engine Mekanisme:</Label>
                <select
                  v-model="form.type"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
                >
                  <option value="QUIZ">🧠 QUIZ (Team Quiz / Trivia)</option>
                  <option value="REACTION">⚡ REACTION (Speed Reflex Tap)</option>
                  <option value="MEMORY">🃏 MEMORY (Matrix Card Recall)</option>
                  <option value="IMAGE_GUESS">🎨 IMAGE_GUESS (AI Canvas Drawing)</option>
                  <option value="PUZZLE">🔐 PUZZLE (Logic Cipher Keypad)</option>
                  <option value="EXPLORATION">🌱 EXPLORATION (Day 1 Incubation)</option>
                  <option value="TEAM_CHALLENGE">🐉 TEAM_CHALLENGE (Boss Raid Lantai 9)</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-semibold">Deskripsi Singkat:</Label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Deskripsi gameplay yang muncul pada kartu misi..."
                class="w-full bg-[#0e0c0a] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-[#f59e0b]"
              ></textarea>
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-semibold">Petunjuk & Aturan Bermain (Untuk Pemain):</Label>
              <textarea
                v-model="form.instructions"
                rows="2"
                placeholder="Instruksi langkah bermain yang dibaca mahasiswa..."
                class="w-full bg-[#0e0c0a] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-[#f59e0b]"
              ></textarea>
            </div>
          </div>

          <!-- 2. PARAMETER SPESIFIK ENGINE -->
          <div class="space-y-3 bg-[#1d1611] p-3.5 rounded-lg border border-[#3d2d1e]">
            <div class="font-pixel text-[11px] text-amber-400 uppercase flex items-center gap-1.5">
              <Sliders class="h-3.5 w-3.5" />
              <span>2. Parameter Spesifik Engine ({{ form.type }})</span>
            </div>

            <!-- Specific for QUIZ -->
            <div v-if="form.type === 'QUIZ'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">Jumlah Butir Soal per Sesi:</Label>
                <input
                  type="number"
                  v-model.number="form.config.questionsCount"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Batas Waktu per Soal (Detik):</Label>
                <input
                  type="number"
                  v-model.number="form.config.timeLimitPerQuestion"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Streak Multiplier Bonus:</Label>
                <input
                  type="number"
                  step="0.1"
                  v-model.number="form.config.streakMultiplier"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Kategori Bank Soal Utama:</Label>
                <input
                  type="text"
                  v-model="form.questionBankCategory"
                  placeholder="Kampus UNU"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>
            </div>

            <!-- Specific for REACTION -->
            <div v-else-if="form.type === 'REACTION'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">Jumlah Target Muncul:</Label>
                <input
                  type="number"
                  v-model.number="form.config.targetCount"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Interval Spawn Target (ms):</Label>
                <input
                  type="number"
                  v-model.number="form.config.spawnIntervalMs"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Penalti Poin Salah Klik:</Label>
                <input
                  type="number"
                  v-model.number="form.config.missPenaltyScore"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Total Waktu Arena (Detik):</Label>
                <input
                  type="number"
                  v-model.number="form.config.timeLimitSeconds"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>
            </div>

            <!-- Specific for MEMORY -->
            <div v-else-if="form.type === 'MEMORY'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">Ukuran Grid Kartu:</Label>
                <select
                  v-model="form.config.gridSize"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                >
                  <option value="3x4">3 x 4 (6 Pasang - Cepat)</option>
                  <option value="4x4">4 x 4 (8 Pasang - Standar)</option>
                  <option value="4x5">4 x 5 (10 Pasang - Menantang)</option>
                </select>
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Maksimal Batas Balik Kartu (Flips):</Label>
                <input
                  type="number"
                  v-model.number="form.config.maxFlipsAllowed"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1 sm:col-span-2">
                <Label class="text-xs">Total Waktu Mencocokkan (Detik):</Label>
                <input
                  type="number"
                  v-model.number="form.config.timeLimitSeconds"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>
            </div>

            <!-- Specific for AI_DRAWING / IMAGE_GUESS -->
            <div v-else-if="form.type === 'IMAGE_GUESS'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">Waktu Menggambar (Detik):</Label>
                <input
                  type="number"
                  v-model.number="form.config.drawingTimeSeconds"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Model AI Evaluator:</Label>
                <select
                  v-model="form.config.aiModel"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                </select>
              </div>

              <div class="space-y-1 sm:col-span-2">
                <Label class="text-xs">Persona AI Senior Curator:</Label>
                <select
                  v-model="form.config.persona"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                >
                  <option value="SARCASTIC_EDUCATIONAL">Kurator Senior Sarkastik, Cerdas, dan Mendidik</option>
                  <option value="ACADEMIC_FORMAL">Kurator Formal Akademis</option>
                  <option value="CASUAL_FRIENDLY">Kurator Ramah & Santai</option>
                </select>
              </div>
            </div>

            <!-- Specific for PUZZLE / LOGIC -->
            <div v-else-if="form.type === 'PUZZLE' || form.type === 'LOGIC'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">Tingkat Kesulitan Cipher:</Label>
                <select
                  v-model="form.config.cipherDifficulty"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                >
                  <option value="EASY">Mudah (3-4 Angka Deret)</option>
                  <option value="MEDIUM">Sedang (Sandi Biner & Modulo)</option>
                  <option value="HARD">Sulit (Kriptografi AI)</option>
                </select>
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Maksimal Percobaan Input (Tries):</Label>
                <input
                  type="number"
                  v-model.number="form.config.maxAttempts"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1 sm:col-span-2">
                <Label class="text-xs">Waktu Penyelesaian (Detik):</Label>
                <input
                  type="number"
                  v-model.number="form.config.timeLimitSeconds"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>
            </div>

            <!-- Specific for BOSS RAID / TEAM_CHALLENGE -->
            <div v-else-if="form.type === 'TEAM_CHALLENGE'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">Total Boss Max HP:</Label>
                <input
                  type="number"
                  v-model.number="form.config.bossMaxHp"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Interval QTE Challenge (Detik):</Label>
                <input
                  type="number"
                  v-model.number="form.config.qteIntervalSeconds"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1 sm:col-span-2">
                <Label class="text-xs">Total Batas Waktu Raid (Detik):</Label>
                <input
                  type="number"
                  v-model.number="form.config.timeLimitSeconds"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>
            </div>

            <!-- Specific for EXPLORATION / INCUBATION -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">Total Skenario Keputusan:</Label>
                <input
                  type="number"
                  v-model.number="form.config.totalScenarios"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>

              <div class="space-y-1">
                <Label class="text-xs">Poin Hadiah Kelulusan (PTS):</Label>
                <input
                  type="number"
                  v-model.number="form.config.completionRewardPoints"
                  class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
                />
              </div>
            </div>
          </div>

          <!-- 3. ATURAN SKOR & JUMLAH PEMAIN -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#1d1611] p-3.5 rounded-lg border border-[#3d2d1e]">
            <div class="space-y-1">
              <Label class="text-xs font-semibold">Min. Pemain:</Label>
              <input
                type="number"
                v-model.number="form.minPlayers"
                class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
              />
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-semibold">Max. Pemain:</Label>
              <input
                type="number"
                v-model.number="form.maxPlayers"
                class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
              />
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-semibold">Status Engine:</Label>
              <select
                v-model="form.status"
                class="w-full h-8 px-2 bg-[#0e0c0a] border border-[#523e2b] text-foreground"
              >
                <option value="ACTIVE">ACTIVE (Ready)</option>
                <option value="INACTIVE">INACTIVE (Standby)</option>
              </select>
            </div>
          </div>

          <DialogFooter class="pt-4 flex items-center justify-end gap-2 border-t border-[#3d2d1e]">
            <button
              type="button"
              class="h-9 px-4 text-xs font-mono border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground rounded"
              @click="showGameModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-9 px-5 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold shadow-md hover:bg-[#eab308]"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3.5 w-3.5 animate-spin mr-1.5 inline" />
              <span>{{ isEditing ? 'SIMPAN PENGATURAN' : 'BUAT ENGINE GAME' }}</span>
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
  Gamepad2,
  Plus,
  RotateCw,
  Search,
  Zap,
  Brain,
  HelpCircle,
  Puzzle,
  Settings,
  Trash2,
  Sparkles,
  Trophy,
  Clock,
  Users,
  Target,
  Image as ImageIcon,
  Flame,
  Compass,
  Sliders,
  X,
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
const games = ref<any[]>([]);
const searchQuery = ref("");
const statusFilter = ref("ALL");
const selectedCategory = ref("ALL");
const incubationStatus = ref<"OPEN" | "LOCKED">("OPEN");

const showGameModal = ref(false);
const isEditing = ref(false);

const CATEGORY_TABS = [
  { type: "ALL", label: "Semua Game", icon: "🎮" },
  { type: "QUIZ", label: "Kuis & Wawasan", icon: "🧠" },
  { type: "REACTION", label: "Speed Reflex", icon: "⚡" },
  { type: "MEMORY", label: "Memory Match", icon: "🃏" },
  { type: "IMAGE_GUESS", label: "AI Canvas Drawing", icon: "🎨" },
  { type: "PUZZLE", label: "Logic Cipher", icon: "🔐" },
  { type: "EXPLORATION", label: "Day 1 Incubation", icon: "🌱" },
  { type: "TEAM_CHALLENGE", label: "Boss Raid Lt.9", icon: "🐉" },
];

const form = ref<any>({
  id: "",
  name: "",
  type: "QUIZ",
  description: "",
  instructions: "",
  config: {},
  questionBankCategory: "",
  minPlayers: 1,
  maxPlayers: 10,
  status: "ACTIVE",
});

const filteredGames = computed(() => {
  return games.value.filter((g) => {
    const matchesSearch =
      !searchQuery.value.trim() ||
      g.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      g.type?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus =
      statusFilter.value === "ALL" || g.status === statusFilter.value;

    const matchesCategory =
      selectedCategory.value === "ALL" || g.type === selectedCategory.value;

    return matchesSearch && matchesStatus && matchesCategory;
  });
});

function getGameIcon(type: string) {
  switch (type) {
    case "QUIZ":
      return HelpCircle;
    case "REACTION":
      return Zap;
    case "MEMORY":
      return Brain;
    case "IMAGE_GUESS":
      return ImageIcon;
    case "PUZZLE":
    case "LOGIC":
      return Puzzle;
    case "TEAM_CHALLENGE":
      return Flame;
    case "EXPLORATION":
      return Compass;
    default:
      return Gamepad2;
  }
}

function getGameThemeColor(type: string) {
  switch (type) {
    case "QUIZ":
      return "#38bdf8"; // Cyan
    case "REACTION":
      return "#facc15"; // Yellow
    case "MEMORY":
      return "#a855f7"; // Purple
    case "IMAGE_GUESS":
      return "#ec4899"; // Pink
    case "PUZZLE":
    case "LOGIC":
      return "#34d399"; // Emerald
    case "TEAM_CHALLENGE":
      return "#f43f5e"; // Rose / Red
    case "EXPLORATION":
      return "#818cf8"; // Indigo
    default:
      return "#f59e0b";
  }
}

function getGameTypeLabel(type: string) {
  switch (type) {
    case "QUIZ":
      return "TEAM QUIZ HUB";
    case "REACTION":
      return "SPEED REACTION";
    case "MEMORY":
      return "MEMORY MATRIX";
    case "IMAGE_GUESS":
      return "AI CANVAS DRAWING";
    case "PUZZLE":
    case "LOGIC":
      return "LOGIC CIPHER";
    case "TEAM_CHALLENGE":
      return "BOSS RAID ARENA";
    case "EXPLORATION":
      return "DAY 1 INCUBATION";
    default:
      return type;
  }
}

async function fetchGames() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/games");
    if (res.success && res.data) {
      games.value = res.data;
    }
  } catch (err) {
    console.error("Failed to load games:", err);
  } finally {
    loading.value = false;
  }
}

async function fetchIncubationStatus() {
  try {
    const res: any = await api.get("/api/incubation/status");
    if (res?.success && res?.data?.status) {
      incubationStatus.value = res.data.status;
    }
  } catch (err) {
    console.warn("Failed to fetch incubation status:", err);
  }
}

async function toggleIncubationMaster() {
  const next = incubationStatus.value === "OPEN" ? "LOCKED" : "OPEN";
  try {
    const res: any = await api.post("/api/incubation/admin/toggle-status", { status: next });
    if (res?.success) {
      incubationStatus.value = next;
    }
  } catch (err: any) {
    alert("Gagal mengubah status Game 1 Incubation: " + (err.message || "Error"));
  }
}

async function syncDefaultGames() {
  syncing.value = true;
  try {
    const res: any = await api.post("/api/games/sync-defaults", {});
    if (res.success) {
      await fetchGames();
      alert(res.message || "Berhasil menyinkronkan 7 template mini game!");
    }
  } catch (err: any) {
    alert("Gagal sinkronisasi: " + (err.message || "Error"));
  } finally {
    syncing.value = false;
  }
}

async function toggleGameStatus(g: any) {
  try {
    const res: any = await api.put(`/api/games/${g.id}/toggle-status`, {});
    if (res.success) {
      g.status = res.data.status;
    }
  } catch (err: any) {
    alert("Gagal mengubah status game: " + (err.message || "Error"));
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    name: "",
    type: "QUIZ",
    description: "",
    instructions: "",
    config: {
      questionsCount: 5,
      timeLimitPerQuestion: 15,
      streakMultiplier: 1.5,
      maxScore: 100,
    },
    questionBankCategory: "Kampus UNU",
    minPlayers: 1,
    maxPlayers: 10,
    status: "ACTIVE",
  };
  showGameModal.value = true;
}

function openEditModal(g: any) {
  isEditing.value = true;
  form.value = {
    id: g.id,
    name: g.name,
    type: g.type || "QUIZ",
    description: g.description || "",
    instructions: g.instructions || "",
    config: { ...(g.config || {}) },
    questionBankCategory: g.questionBankCategory || "",
    minPlayers: g.minPlayers || 1,
    maxPlayers: g.maxPlayers || 10,
    status: g.status || "ACTIVE",
  };
  showGameModal.value = true;
}

async function submitGameForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/games/${form.value.id}`, {
        name: form.value.name,
        type: form.value.type,
        description: form.value.description,
        instructions: form.value.instructions,
        config: form.value.config,
        questionBankCategory: form.value.questionBankCategory,
        minPlayers: form.value.minPlayers,
        maxPlayers: form.value.maxPlayers,
        status: form.value.status,
      });
    } else {
      await api.post("/api/games", {
        name: form.value.name,
        type: form.value.type,
        description: form.value.description,
        instructions: form.value.instructions,
        config: form.value.config,
        questionBankCategory: form.value.questionBankCategory,
        minPlayers: form.value.minPlayers,
        maxPlayers: form.value.maxPlayers,
        status: form.value.status,
      });
    }
    showGameModal.value = false;
    await fetchGames();
  } catch (err: any) {
    alert("Gagal menyimpan game: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(g: any) {
  if (confirm(`Hapus template game '${g.name}'?`)) {
    try {
      await api.del(`/api/games/${g.id}`);
      await fetchGames();
    } catch (err: any) {
      alert("Gagal menghapus game: " + err.message);
    }
  }
}

onMounted(() => {
  fetchGames();
  fetchIncubationStatus();
});
</script>
