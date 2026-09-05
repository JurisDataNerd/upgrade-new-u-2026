<template>
  <div class="p-4 md:p-6 space-y-4 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <!-- Auto Refresh Selector -->
      <div class="flex items-center border border-[#4a3624] bg-[#1a140f] p-0.5 text-xs font-mono">
        <span class="px-2 font-bold text-muted-foreground text-[10px]">AUTO:</span>
        <button
          v-for="rate in [5, 10, 0]"
          :key="rate"
          @click="autoRefreshRate = rate"
          :class="[
            'px-2 py-0.5 text-[10px] font-pixel transition-colors',
            autoRefreshRate === rate
              ? 'bg-[#f59e0b] text-[#16110d] font-bold'
              : 'text-muted-foreground hover:text-foreground',
          ]"
        >
          {{ rate === 0 ? 'OFF' : `${rate}S` }}
        </button>
      </div>

      <!-- Manual Score Modal Trigger -->
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#271d15] text-[#facc15] border-[#ca8a04] flex items-center gap-1.5 hover:bg-[#3d2d1e]"
        @click="showScoreModal = true"
        title="Koreksi Skor"
      >
        <Award class="h-3.5 w-3.5 text-[#facc15]" />
        <span class="hidden sm:inline">KOREKSI SKOR</span>
      </button>

      <!-- Broadcast Modal Trigger -->
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#271d15] text-[#38bdf8] border-[#0284c7] flex items-center gap-1.5 hover:bg-[#3d2d1e]"
        @click="showBroadcastModal = true"
        title="Broadcast LAN"
      >
        <Megaphone class="h-3.5 w-3.5 text-[#38bdf8]" />
        <span class="hidden sm:inline">BROADCAST</span>
      </button>

      <!-- Manual Refresh Button -->
      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchStats"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Page Header Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Surveillance & pemantauan gamifikasi 9 lantai kampus UNU Yogyakarta secara realtime.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#16a34a]/60 bg-[#162518] px-2 py-0.5 text-[9px] font-pixel text-[#4ade80] flex items-center gap-1">
          <span class="pixel-pulse-dot"></span>
          TELEMETRY LIVE
        </span>
      </div>
    </div>

    <!-- Active Stage & Event Control Hero Banner (Pixel Card Gold) -->
    <div class="pixel-card-gold p-5 space-y-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Stage Information -->
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-pixel text-[10px] uppercase tracking-wider text-[#f59e0b]">
              TAHAPAN GAMIFIKASI AKTIF
            </span>
            <span class="border border-[#ca8a04]/60 bg-[#2b2014] px-1.5 py-0.5 text-[9px] font-pixel text-[#facc15]">
              STAGE 1 OF 3
            </span>
            <span class="border border-[#16a34a]/60 bg-[#162518] px-1.5 py-0.5 text-[9px] font-pixel text-[#4ade80] flex items-center gap-1">
              <span class="pixel-pulse-dot"></span>
              LIVE RUNNING
            </span>
          </div>

          <h2 class="font-pixel text-base sm:text-lg font-bold text-foreground">
            {{ stats?.activeStage?.name || 'Stage 1: The Induction — Eksplorasi 9 Lantai & Mini Games' }}
          </h2>

          <p class="max-w-3xl text-xs font-mono text-muted-foreground leading-relaxed">
            {{ stats?.activeStage?.description || 'Tim mengikuti rute, memindai QR lokasi, dan menyelesaikan tantangan bersama Buddy.' }}
          </p>
        </div>

        <!-- Stage Telemetry Clock & Quick Stage Controls -->
        <div class="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          <!-- Stage Elapsed Timer -->
          <div class="border-2 border-[#ca8a04] bg-[#15100c] p-3 text-left lg:text-right shadow-inner font-mono">
            <div class="text-[10px] text-muted-foreground uppercase font-semibold">Waktu Berjalan (Stage Elapsed):</div>
            <div class="font-arcade text-xl sm:text-2xl font-bold tracking-widest text-[#facc15] mt-1">
              01:42:18
            </div>
            <div class="text-[9px] text-muted-foreground mt-0.5">Batas Waktu: 03:00:00 (Sisa 01:17:42)</div>
          </div>

          <!-- Emergency & Transition Action Buttons -->
          <div class="flex items-center gap-2">
            <button
              class="pixel-btn h-7 px-2.5 text-[10px] font-pixel bg-[#2a1414] text-[#f87171] border-[#dc2626] flex items-center gap-1 hover:bg-[#3d1a1a]"
              @click="handleFreezeToggle"
            >
              <AlertTriangle class="h-3 w-3" />
              <span>{{ isFrozen ? 'RESUME EVENT' : 'EMERGENCY FREEZE' }}</span>
            </button>

            <button
              class="pixel-btn h-7 px-2.5 text-[10px] font-pixel bg-[#271d15] text-[#38bdf8] border-[#0284c7] flex items-center gap-1 hover:bg-[#3d2d1e]"
              @click="navigateTo('/stages')"
            >
              <FastForward class="h-3 w-3" />
              <span>KELOLA STAGE</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Core Event Metrics Grid (6 KPI Pixel Cards) -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <!-- 1. Active Teams -->
      <div class="pixel-card p-3.5 space-y-1.5 border-[#4a3624]">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-[10px] font-pixel text-[#f59e0b]">TIM BERGERAK</span>
          <Shield class="h-3.5 w-3.5 text-[#f59e0b]" />
        </div>
        <div>
          <div class="font-mono text-xl font-bold text-foreground">
            {{ stats?.counters?.activeTeams || 48 }}
            <span class="text-xs font-normal text-muted-foreground">/ {{ stats?.counters?.totalTeams || 50 }}</span>
          </div>
          <div class="text-[10px] text-[#4ade80] font-mono mt-0.5">
            96% Mobilized
          </div>
        </div>
      </div>

      <!-- 2. Active Participants -->
      <div class="pixel-card p-3.5 space-y-1.5 border-[#4a3624]">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-[10px] font-pixel text-[#4ade80]">PESERTA ONLINE</span>
          <Users class="h-3.5 w-3.5 text-[#4ade80]" />
        </div>
        <div>
          <div class="font-mono text-xl font-bold text-foreground">
            {{ stats?.counters?.totalParticipants || 520 }}
            <span class="text-xs font-normal text-muted-foreground">/ 600</span>
          </div>
          <div class="text-[10px] text-[#4ade80] font-mono mt-0.5">
            86.7% Terverifikasi
          </div>
        </div>
      </div>

      <!-- 3. Active Buddies -->
      <div class="pixel-card p-3.5 space-y-1.5 border-[#4a3624]">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-[10px] font-pixel text-[#38bdf8]">BUDDY (GM)</span>
          <UserCheck class="h-3.5 w-3.5 text-[#38bdf8]" />
        </div>
        <div>
          <div class="font-mono text-xl font-bold text-foreground">
            50
            <span class="text-xs font-normal text-muted-foreground">/ 50</span>
          </div>
          <div class="text-[10px] text-[#38bdf8] font-mono mt-0.5">
            100% Terhubung Tim
          </div>
        </div>
      </div>

      <!-- 4. Total Points Ledger -->
      <div class="pixel-card p-3.5 space-y-1.5 border-[#4a3624]">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-[10px] font-pixel text-[#facc15]">TOTAL POIN</span>
          <Coins class="h-3.5 w-3.5 text-[#facc15]" />
        </div>
        <div>
          <div class="font-mono text-xl font-bold text-[#facc15] truncate">
            {{ stats?.counters?.totalScoreDistributed ? Number(stats.counters.totalScoreDistributed).toLocaleString() : '42,850' }}
          </div>
          <div class="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
            Avg: 857 pts / tim
          </div>
        </div>
      </div>

      <!-- 5. Active Mini Game Sessions -->
      <div class="pixel-card p-3.5 space-y-1.5 border-[#4a3624]">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-[10px] font-pixel text-[#f87171]">MINI GAMES</span>
          <Gamepad2 class="h-3.5 w-3.5 text-[#f87171]" />
        </div>
        <div>
          <div class="font-mono text-xl font-bold text-foreground">
            {{ stats?.counters?.activeSessions || 14 }}
            <span class="text-xs font-normal text-muted-foreground">Live</span>
          </div>
          <div class="text-[10px] text-[#f87171] font-mono mt-0.5">
            Multiplayer Sync
          </div>
        </div>
      </div>

      <!-- 6. QR Checkpoint Scans -->
      <div class="pixel-card p-3.5 space-y-1.5 border-[#4a3624]">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-[10px] font-pixel text-[#f59e0b]">QR SCANS</span>
          <QrCode class="h-3.5 w-3.5 text-[#f59e0b]" />
        </div>
        <div>
          <div class="font-mono text-xl font-bold text-foreground">
            384
            <span class="text-xs font-normal text-muted-foreground">Scan</span>
          </div>
          <div class="text-[10px] text-[#f59e0b] font-mono mt-0.5">
            9 Lantai Aktif
          </div>
        </div>
      </div>
    </div>

    <!-- 9 Floors UNU Yogyakarta Heatmap & Congestion Matrix (Pixel Theme) -->
    <div class="pixel-card p-4 space-y-3">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#4a3624] pb-2.5">
        <div>
          <div class="font-pixel text-xs sm:text-sm font-bold text-[#f59e0b] flex items-center gap-2">
            <Building2 class="h-4 w-4" />
            <span>MATRIKS DISTRIBUSI & KEPADATAN 9 LANTAI KAMPUS UNU</span>
          </div>
          <p class="text-[11px] font-mono text-muted-foreground mt-0.5">
            Monitoring persebaran tim, kapasitas ruangan, dan deteksi potensi penumpukan (*bottleneck*) rute.
          </p>
        </div>

        <div class="flex items-center gap-1.5 font-mono text-[10px]">
          <span class="border border-[#16a34a]/60 bg-[#162518] px-1.5 py-0.5 text-[#4ade80]">Normal (&lt;8)</span>
          <span class="border border-[#ca8a04]/60 bg-[#2b2014] px-1.5 py-0.5 text-[#facc15]">Padat (8-10)</span>
          <span class="border border-[#dc2626]/60 bg-[#2a1414] px-1.5 py-0.5 text-[#f87171]">Bottleneck (&gt;10)</span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-9">
        <div
          v-for="floor in floorOccupancy"
          :key="floor.level"
          :class="[
            'border p-2.5 flex flex-col justify-between font-mono text-xs transition-all',
            floor.status === 'bottleneck'
              ? 'border-[#dc2626] bg-[#2a1414] shadow-[0_0_8px_rgba(220,38,38,0.3)]'
              : floor.status === 'dense'
              ? 'border-[#ca8a04] bg-[#2b2014]'
              : 'border-[#4a3624] bg-[#1a140f]',
          ]"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="font-pixel text-[10px] text-[#f59e0b]">L{{ floor.level }}</span>
              <span
                :class="[
                  'text-[8px] font-pixel px-1 py-0.2 border',
                  floor.status === 'bottleneck'
                    ? 'border-[#dc2626] text-[#f87171]'
                    : floor.status === 'dense'
                    ? 'border-[#ca8a04] text-[#facc15]'
                    : 'border-[#16a34a] text-[#4ade80]'
                ]"
              >
                {{ floor.status === 'bottleneck' ? 'WARN' : floor.status === 'dense' ? 'PADAT' : 'LANCAR' }}
              </span>
            </div>

            <div class="font-bold text-xs text-foreground mt-1 line-clamp-1">
              {{ floor.name }}
            </div>
            <div class="text-[10px] text-muted-foreground line-clamp-1">
              {{ floor.highlight }}
            </div>
          </div>

          <div class="mt-3 pt-2 border-t border-[#4a3624]">
            <div class="flex items-center justify-between text-[10px] mb-1">
              <span class="text-muted-foreground">Kepadatan:</span>
              <span class="font-bold text-foreground">{{ floor.teamsCount }} Tim</span>
            </div>

            <!-- Segmented Pixel Capacity Bar -->
            <div class="h-1.5 w-full bg-[#15100c] border border-[#4a3624] p-0.5">
              <div
                class="h-full transition-all"
                :style="{ width: `${Math.min((floor.teamsCount / 12) * 100, 100)}%` }"
                :class="[
                  floor.status === 'bottleneck'
                    ? 'bg-[#dc2626]'
                    : floor.status === 'dense'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#16a34a]',
                ]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dual Split: Live Activity Stream (60%) vs Leaderboard & System Health (40%) -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <!-- Left (7 Cols): Live Telemetry Stream -->
      <div class="lg:col-span-7 space-y-4">
        <div class="pixel-card p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-[#4a3624] pb-2.5">
            <div>
              <div class="font-pixel text-xs sm:text-sm font-bold text-[#f59e0b] flex items-center gap-2">
                <Activity class="h-4 w-4" />
                <span>LIVE EVENT ACTIVITY STREAM</span>
              </div>
              <p class="text-[10px] font-mono text-muted-foreground mt-0.5">
                Log transaksi skor, validasi QR waypoint, dan aktivitas Buddy secara realtime.
              </p>
            </div>

            <!-- Activity Filter Tabs -->
            <div class="flex items-center gap-1 border border-[#4a3624] bg-[#15100c] p-0.5 text-xs font-mono">
              <button
                v-for="filter in ['ALL', 'GAME', 'BONUS', 'QR']"
                :key="filter"
                @click="activeFilter = filter"
                :class="[
                  'px-2 py-0.5 text-[9px] font-pixel transition-colors',
                  activeFilter === filter
                    ? 'bg-[#f59e0b] text-[#16110d] font-bold'
                    : 'text-muted-foreground hover:text-foreground',
                ]"
              >
                {{ filter }}
              </button>
            </div>
          </div>

          <!-- Activity Items List -->
          <div class="space-y-2 max-h-[460px] overflow-y-auto pr-1 font-mono text-xs">
            <div
              v-for="item in filteredActivities"
              :key="item.id"
              class="flex items-start justify-between gap-3 border border-[#3d2d1e] bg-[#1a140f] p-2.5 hover:bg-[#271d15] transition-colors"
            >
              <div class="flex items-start gap-2.5">
                <!-- Source Icon Avatar -->
                <div
                  :class="[
                    'flex h-7 w-7 shrink-0 items-center justify-center border font-pixel text-xs',
                    item.sourceType === 'GAME'
                      ? 'bg-[#162518] text-[#4ade80] border-[#16a34a]'
                      : item.sourceType === 'BONUS'
                      ? 'bg-[#2b2014] text-[#facc15] border-[#ca8a04]'
                      : item.sourceType === 'QR'
                      ? 'bg-[#16222f] text-[#38bdf8] border-[#0284c7]'
                      : 'bg-[#271d15] text-[#f59e0b] border-[#523e2b]',
                  ]"
                >
                  <component :is="getActivityIcon(item.sourceType)" class="h-3.5 w-3.5" />
                </div>

                <div>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="font-bold text-foreground text-xs">{{ item.teamName }}</span>
                    <span class="text-[9px] font-pixel border border-[#523e2b] px-1 bg-[#271d15] text-muted-foreground">{{ item.participantName }}</span>
                    <span
                      :class="[
                        'text-[8px] font-pixel px-1 border',
                        item.sourceType === 'GAME'
                          ? 'border-[#16a34a] text-[#4ade80]'
                          : item.sourceType === 'BONUS'
                          ? 'border-[#ca8a04] text-[#facc15]'
                          : 'border-[#0284c7] text-[#38bdf8]'
                      ]"
                    >
                      {{ item.sourceType }}
                    </span>
                  </div>
                  <p class="text-[11px] text-muted-foreground mt-0.5">
                    {{ item.reason }}
                  </p>
                  <div class="flex items-center gap-2 text-[9px] text-muted-foreground mt-1">
                    <MapPin class="h-2.5 w-2.5 text-[#f59e0b]" />
                    <span>{{ item.location }}</span>
                    <span>•</span>
                    <Clock class="h-2.5 w-2.5" />
                    <span>{{ item.time }}</span>
                  </div>
                </div>
              </div>

              <!-- Point Delta -->
              <div class="text-right shrink-0">
                <div
                  class="font-pixel text-xs font-bold"
                  :class="item.amount >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'"
                >
                  {{ item.amount >= 0 ? `+${item.amount}` : item.amount }} PTS
                </div>
                <div class="text-[8px] text-muted-foreground mt-0.5">
                  VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right (5 Cols): Top 5 Leaderboard & LAN System Health -->
      <div class="lg:col-span-5 space-y-4">
        <!-- Top 5 Leaderboard Snapshot (Pixel Theme) -->
        <div class="pixel-card p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-[#4a3624] pb-2.5">
            <div>
              <div class="font-pixel text-xs sm:text-sm font-bold text-[#facc15] flex items-center gap-2">
                <Trophy class="h-4 w-4" />
                <span>TOP 5 TIM TERATAS</span>
              </div>
              <p class="text-[10px] font-mono text-muted-foreground mt-0.5">Peringkat perolehan skor sementara</p>
            </div>
            <button
              class="text-[10px] font-pixel text-[#f59e0b] hover:underline"
              @click="navigateTo('/leaderboard')"
            >
              SEMUA →
            </button>
          </div>

          <div class="space-y-1.5 font-mono text-xs">
            <div
              v-for="(team, index) in topTeams"
              :key="team.id"
              class="flex items-center justify-between border border-[#3d2d1e] bg-[#1a140f] p-2 hover:bg-[#271d15] transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <!-- Rank Badge -->
                <div
                  :class="[
                    'flex h-6 w-6 items-center justify-center font-pixel text-[9px] border',
                    index === 0
                      ? 'bg-[#2b2014] text-[#facc15] border-[#ca8a04]'
                      : index === 1
                      ? 'bg-[#222] text-[#e2e8f0] border-[#94a3b8]'
                      : index === 2
                      ? 'bg-[#2b1810] text-[#fb923c] border-[#c2410c]'
                      : 'bg-[#15100c] text-muted-foreground border-[#3d2d1e]',
                  ]"
                >
                  #{{ index + 1 }}
                </div>

                <div>
                  <div class="font-bold text-foreground text-xs">{{ team.name }}</div>
                  <div class="text-[9px] text-muted-foreground flex items-center gap-1.5">
                    <span>Buddy: {{ team.buddy }}</span>
                    <span>•</span>
                    <span class="text-[#38bdf8]">{{ team.currentFloor }}</span>
                  </div>
                </div>
              </div>

              <!-- Points -->
              <div class="text-right font-pixel text-xs font-bold text-[#4ade80]">
                {{ team.score.toLocaleString() }} PTS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Koreksi Skor Manual -->
    <Dialog :open="showScoreModal" @update:open="showScoreModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#ca8a04] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Award class="h-4 w-4" />
            <span>KOREKSI SKOR MANUAL</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitScoreCorrection" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Tim Sasaran:</Label>
            <select
              v-model="scoreForm.teamId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            >
              <option value="">-- Pilih Tim --</option>
              <option v-for="team in teamsList" :key="team.id" :value="team.id">
                {{ team.name }} ({{ team.code }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Nominal Poin (+ / -):</Label>
            <input
              type="number"
              v-model.number="scoreForm.amount"
              placeholder="Contoh: 50 atau -25"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Alasan Koreksi:</Label>
            <input
              v-model="scoreForm.reason"
              placeholder="Contoh: Bonus partisipasi khusus atau penalti pelanggaran"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showScoreModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="savingScore"
            >
              <RotateCw v-if="savingScore" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>KIRIM KOREKSI</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal: Broadcast LAN -->
    <Dialog :open="showBroadcastModal" @update:open="showBroadcastModal = $event">
      <DialogContent class="sm:max-w-[480px] pixel-card border-2 border-[#0284c7] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center gap-2">
            <Megaphone class="h-4 w-4" />
            <span>BROADCAST PENGUMUMAN LAN</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitBroadcast" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Sasaran Penerima:</Label>
            <select
              v-model="broadcastForm.target"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#0284c7]"
            >
              <option value="ALL">Semua Peserta & Buddy (Global LAN)</option>
              <option value="BUDDY">Khusus Buddy & Game Master</option>
              <option value="PARTICIPANT">Khusus Mahasiswa Peserta</option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Tipe Pengumuman:</Label>
            <select
              v-model="broadcastForm.type"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#0284c7]"
            >
              <option value="INFO">Informasi Biasa</option>
              <option value="URGENT">Pemberitahuan Mendesak / Alert</option>
              <option value="GAME_START">Sinyal Mulai Game Serempak</option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Isi Pesan Siaran:</Label>
            <textarea
              v-model="broadcastForm.message"
              rows="3"
              placeholder="Ketik pesan siaran yang akan muncul di layar peserta..."
              class="w-full bg-[#15100c] border border-[#523e2b] p-2 text-xs font-mono focus:outline-none focus:border-[#0284c7]"
              required
            ></textarea>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showBroadcastModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#0284c7] text-white border-[#38bdf8] font-bold"
              :disabled="broadcasting"
            >
              <RotateCw v-if="broadcasting" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>SIARKAN SEKARANG</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Shield,
  Users,
  UserCheck,
  Coins,
  Gamepad2,
  QrCode,
  Building2,
  Activity,
  Trophy,
  Award,
  Megaphone,
  RotateCw,
  AlertTriangle,
  FastForward,
  MapPin,
  Clock,
  Zap,
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
const isFrozen = ref(false);
const autoRefreshRate = ref(5);
let refreshTimer: any = null;

const stats = ref<any>(null);
const teamsList = ref<any[]>([]);

// Modals
const showScoreModal = ref(false);
const savingScore = ref(false);
const scoreForm = ref({
  teamId: "",
  amount: 50,
  reason: "",
});

const showBroadcastModal = ref(false);
const broadcasting = ref(false);
const broadcastForm = ref({
  target: "ALL",
  type: "INFO",
  message: "",
});

const activeFilter = ref("ALL");

const floorOccupancy = ref([
  { level: 9, name: "Rooftop Lounge", highlight: "Final Stage Arena", teamsCount: 4, status: "normal" },
  { level: 8, name: "Auditorium Utama", highlight: "Quiz Stage Arena", teamsCount: 6, status: "normal" },
  { level: 7, name: "Fakultas & Riset", highlight: "Waypoint C4", teamsCount: 5, status: "normal" },
  { level: 6, name: "Perpustakaan Digital", highlight: "Memory Match", teamsCount: 9, status: "dense" },
  { level: 5, name: "Smart Classroom", highlight: "Speed Reflex", teamsCount: 7, status: "normal" },
  { level: 4, name: "Creative Space", highlight: "Waypoint B2", teamsCount: 6, status: "normal" },
  { level: 3, name: "Inkubator Bisnis", highlight: "Waypoint A3", teamsCount: 5, status: "normal" },
  { level: 2, name: "Lab Komputer & AI", highlight: "Team Quiz Hub", teamsCount: 12, status: "bottleneck" },
  { level: 1, name: "Lobby & Atrium", highlight: "Induction Point", teamsCount: 7, status: "normal" },
]);

const activities = ref([
  {
    id: "act-1",
    teamName: "Genius 01",
    participantName: "Ahmad Dahlan",
    sourceType: "GAME",
    reason: "Menyelesaikan Speed Reflex (Score: 980)",
    location: "Lantai 5 - Smart Classroom",
    time: "Baru saja",
    amount: 150,
  },
  {
    id: "act-2",
    teamName: "Genius 03",
    participantName: "Budi Santoso",
    sourceType: "BONUS",
    reason: "Bonus kekompakan yel-yel tim",
    location: "Lantai 1 - Atrium",
    time: "1 menit lalu",
    amount: 25,
  },
  {
    id: "act-3",
    teamName: "Genius 05",
    participantName: "Siti Fatimah",
    sourceType: "QR",
    reason: "Verifikasi Checkpoint QR Lantai 3",
    location: "Lantai 3 - Inkubator",
    time: "2 menit lalu",
    amount: 50,
  },
  {
    id: "act-4",
    teamName: "Genius 08",
    participantName: "Bambang P",
    sourceType: "GAME",
    reason: "Menyelesaikan Memory Match",
    location: "Lantai 6 - Perpustakaan",
    time: "3 menit lalu",
    amount: 120,
  },
]);

const topTeams = ref([
  { id: "t1", name: "Genius 01", buddy: "Budi Santoso", currentFloor: "Lantai 5", score: 2450 },
  { id: "t2", name: "Genius 05", buddy: "Fatimah Z", currentFloor: "Lantai 3", score: 2320 },
  { id: "t3", name: "Genius 03", buddy: "Dewi Lestari", currentFloor: "Lantai 1", score: 2180 },
  { id: "t4", name: "Genius 08", buddy: "Farhan Hakim", currentFloor: "Lantai 6", score: 1950 },
  { id: "t5", name: "Genius 02", buddy: "Hasanudin", currentFloor: "Lantai 8", score: 1890 },
]);

const filteredActivities = computed(() => {
  if (activeFilter.value === "ALL") return activities.value;
  return activities.value.filter((a) => a.sourceType === activeFilter.value);
});

function getActivityIcon(type: string) {
  if (type === "GAME") return Gamepad2;
  if (type === "BONUS") return Award;
  if (type === "QR") return QrCode;
  return Activity;
}

async function fetchTeams() {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/teams?pageSize=100");
    if (res.success && res.data) teamsList.value = res.data;
  } catch (err) {
    console.error("Failed to load teams:", err);
  }
}

async function fetchStats() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any }>("/api/leaderboard");
    if (res.success && res.data) {
      stats.value = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  } finally {
    loading.value = false;
  }
}

function handleFreezeToggle() {
  isFrozen.value = !isFrozen.value;
  alert(isFrozen.value ? "PERINGATAN: Sesi gamifikasi di-freeze!" : "Sesi gamifikasi dilanjutkan!");
}

async function submitScoreCorrection() {
  if (!scoreForm.value.teamId) return;
  savingScore.value = true;
  try {
    await api.post("/api/leaderboard/adjust", {
      teamId: scoreForm.value.teamId,
      amount: scoreForm.value.amount,
      reason: scoreForm.value.reason,
    });
    alert("Koreksi skor berhasil dikirim!");
    showScoreModal.value = false;
    await fetchStats();
  } catch (err: any) {
    alert("Gagal koreksi skor: " + (err.data?.error?.message || err.message));
  } finally {
    savingScore.value = false;
  }
}

async function submitBroadcast() {
  broadcasting.value = true;
  try {
    await new Promise((r) => setTimeout(r, 600));
    alert(`Broadcast berhasil disiarkan ke ${broadcastForm.value.target}!`);
    showBroadcastModal.value = false;
    broadcastForm.value.message = "";
  } catch (err: any) {
    alert("Gagal broadcast: " + err.message);
  } finally {
    broadcasting.value = false;
  }
}

function setupAutoRefresh() {
  clearInterval(refreshTimer);
  if (autoRefreshRate.value > 0) {
    refreshTimer = setInterval(() => {
      fetchStats();
    }, autoRefreshRate.value * 1000);
  }
}

onMounted(() => {
  fetchStats();
  fetchTeams();
  setupAutoRefresh();
});

onUnmounted(() => {
  clearInterval(refreshTimer);
});
</script>
