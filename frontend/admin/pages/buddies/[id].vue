<template>
  <div class="p-4 md:p-6 space-y-4 font-mono text-gray-200 select-none pb-12 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <NuxtLink
        to="/buddies"
        class="pixel-btn h-8 px-3 bg-[#1c1611] border border-[#523e2b] text-[#f59e0b] hover:bg-[#2e2116] hover:border-[#f59e0b] text-xs font-pixel flex items-center gap-1.5 transition-all shadow-sm"
        title="Kembali ke Direktori Buddy"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">KEMBALI</span>
      </NuxtLink>

      <button
        @click="openAssignTeamModal"
        class="pixel-btn h-8 px-3 bg-[#0284c7]/20 border border-[#38bdf8] text-[#38bdf8] hover:bg-[#0284c7]/40 text-xs font-pixel flex items-center gap-1.5 transition-all"
        title="Plotting ke Tim"
      >
        <Shield class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">{{ buddy?.teamId ? 'GANTI TIM' : 'PLOTTING TIM' }}</span>
      </button>

      <button
        @click="openAwardTitleModal"
        class="pixel-btn h-8 px-3 bg-[#ca8a04]/20 border border-[#f59e0b] text-[#facc15] hover:bg-[#ca8a04]/40 text-xs font-pixel flex items-center gap-1.5 transition-all"
        title="Sematkan Gelar"
      >
        <Award class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">SEMATKAN GELAR</span>
      </button>

      <button
        @click="fetchBuddyDetail"
        :disabled="loading"
        class="pixel-btn h-8 w-8 bg-[#1c1611] border border-[#523e2b] text-gray-300 hover:text-white hover:border-gray-500 text-xs flex items-center justify-center transition-all"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Top Breadcrumb & Navigation Bar -->
    <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono border-b border-[#4a3624]/60 pb-2">
      <NuxtLink to="/buddies" class="text-gray-400 hover:text-[#f59e0b]">DIREKTORI BUDDY</NuxtLink>
      <span>/</span>
      <span class="text-[#f59e0b] font-bold uppercase truncate max-w-[200px] sm:max-w-md">
        {{ buddy?.fullName || buddy?.username || 'DETAIL BUDDY' }}
      </span>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="loading && !buddy" class="py-24 flex flex-col items-center justify-center space-y-4">
      <RotateCw class="h-10 w-10 text-[#f59e0b] animate-spin" />
      <div class="font-pixel text-sm text-[#f59e0b] tracking-wider animate-pulse">
        MENGHUBUNGKAN KE MAINFRAME BUDDY GAME MASTER...
      </div>
    </div>

    <!-- 404 / Error State -->
    <div v-else-if="!buddy" class="py-16 text-center space-y-3 bg-[#141822]/60 border border-red-500/30 rounded-lg p-6">
      <AlertTriangle class="h-12 w-12 text-red-400 mx-auto" />
      <h2 class="font-pixel text-base text-red-400">DATA BUDDY TIDAK DITEMUKAN</h2>
      <p class="text-xs text-gray-400">ID Buddy tidak valid atau telah dihapus.</p>
      <NuxtLink
        to="/buddies"
        class="inline-flex h-8 px-4 items-center gap-2 rounded bg-[#f59e0b] text-black font-pixel text-xs font-bold"
      >
        KEMBALI KE DAFTAR BUDDY
      </NuxtLink>
    </div>

    <!-- MAIN TACTICAL BUDDY DASHBOARD CONTENT -->
    <div v-else class="space-y-4">

      <!-- TOP COMMAND HUD CARD -->
      <div class="relative overflow-hidden rounded-xl border-2 border-[#523e2b] bg-gradient-to-r from-[#141824] via-[#0e111a] to-[#1e1710] p-4 sm:p-5 shadow-2xl">
        <!-- Ambient HUD Glow -->
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#ca8a04]/15 blur-3xl pointer-events-none" />
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#0284c7]/15 blur-3xl pointer-events-none" />

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <!-- Buddy Identity Left Section -->
          <div class="flex items-start sm:items-center gap-3.5">
            <!-- Commander Avatar & Crown Emblem -->
            <div class="relative group shrink-0">
              <div class="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-2 border-[#f59e0b] overflow-hidden bg-[#1e1712] shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center">
                <img
                  :src="buddyAvatarUrl"
                  :alt="buddy.fullName || 'Buddy'"
                  class="h-full w-full object-cover"
                  style="image-rendering: pixelated;"
                />
              </div>
              <div class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#facc15] border-2 border-black flex items-center justify-center shadow-md" title="Commander Buddy">
                <Crown class="h-3 w-3 text-black" />
              </div>
            </div>

            <!-- Identity Info -->
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-pixel text-gray-400 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded border border-[#2b251d]">
                  @{{ buddy.username }}
                </span>
                <span :class="[
                  'px-2 py-0.5 text-[10px] rounded font-pixel font-bold border flex items-center gap-1',
                  buddy.buddyRole === 'PRIMARY'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : buddy.buddyRole === 'ASSISTANT'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                ]">
                  <Crown class="h-3 w-3" />
                  <span>{{ buddy.buddyRole === 'PRIMARY' ? 'KAPTEN UTAMA (PRIMARY)' : buddy.buddyRole === 'ASSISTANT' ? 'CO-BUDDY (ASSISTANT)' : 'CADANGAN (FREE AGENT)' }}</span>
                </span>
                <span class="px-2 py-0.5 bg-[#ca8a04]/20 text-[#facc15] border border-[#ca8a04]/50 text-[10px] rounded font-pixel font-bold">
                  {{ evolutionInfo.badge }}
                </span>
                <span :class="[
                  'px-2 py-0.5 text-[10px] rounded font-bold border',
                  buddy.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    : 'bg-red-500/15 text-red-400 border-red-500/40'
                ]">
                  {{ buddy.status === 'ACTIVE' ? 'STATUS: AKTIF' : 'STATUS: NONAKTIF' }}
                </span>
              </div>

              <h1 class="text-lg sm:text-2xl font-bold text-white tracking-wide uppercase font-pixel flex flex-wrap items-center gap-2.5">
                <span>{{ buddy.fullName }}</span>
                <span class="text-xs sm:text-sm text-[#facc15] font-normal tracking-normal">
                  [{{ activeTitle }}]
                </span>
              </h1>

              <!-- Team Membership Tag -->
              <div class="flex items-center gap-2 text-xs text-gray-300 pt-0.5">
                <span class="text-gray-400">Tim Binaan:</span>
                <NuxtLink
                  v-if="buddy.teamId"
                  :to="'/teams/' + buddy.teamId"
                  class="inline-flex items-center gap-1.5 font-bold text-[#38bdf8] bg-[#0c1e2e] px-2.5 py-0.5 rounded border border-[#0284c7]/50 hover:bg-[#0c2a40] transition-colors"
                >
                  <Shield class="h-3 w-3" />
                  <span>{{ buddy.teamName }} ({{ buddy.teamCode }})</span>
                  <span class="text-[9px] text-[#facc15]">↗ Inspect Squad</span>
                </NuxtLink>
                <span v-else class="text-amber-500/80 italic text-[11px]">
                  [Belum Ditugaskan / Buddy Cadangan]
                </span>
              </div>
            </div>
          </div>

          <!-- Bonus Budget Tracker & Stats Right Section -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-4 bg-black/50 p-3 rounded-lg border border-[#2b251d]">
            <div class="text-center px-2 sm:px-3 border-r border-[#2b251d]">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">BONUS BUDGET STAGE</div>
              <div class="text-base sm:text-xl font-bold text-[#facc15] font-pixel flex items-center justify-center gap-1">
                <span>{{ Number(buddy.bonusSpent || 0) }} / 100</span>
                <span class="text-xs text-gray-400">PTS</span>
              </div>
              <div class="w-24 h-1.5 bg-[#1a1f2c] rounded-full overflow-hidden mt-1 mx-auto">
                <div
                  class="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full"
                  :style="{ width: `${Math.min(100, (Number(buddy.bonusSpent || 0) / 100) * 100)}%` }"
                />
              </div>
            </div>

            <div class="text-center px-2 sm:px-3 border-r border-[#2b251d]">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">KELAS RPG</div>
              <div class="text-xs sm:text-sm font-bold text-[#38bdf8] font-pixel truncate max-w-[130px]">
                {{ characterClassData.name }}
              </div>
              <div class="text-[9px] text-gray-400">{{ characterClassData.role }}</div>
            </div>

            <div class="text-center px-2 sm:px-3">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">BONUS DIBERIKAN</div>
              <div class="text-base sm:text-xl font-bold text-emerald-400 font-pixel">
                {{ (buddy.bonusAwardsGiven || []).length }}x
              </div>
              <div class="text-[9px] text-emerald-300">Transaksi Aktif</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-COLUMN TACTICAL COMMANDER HERO CANVAS -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- LEFT COLUMN: COMMANDER LOADOUT & TITLES (3 Cols) -->
        <div class="lg:col-span-3 space-y-3 flex flex-col justify-between bg-[#0e1117] border border-[#232936] p-3.5 rounded-xl shadow-lg">
          <div class="space-y-3">
            <div>
              <h3 class="font-pixel text-xs font-bold text-[#f59e0b] tracking-wider flex items-center gap-1.5">
                <Crown class="h-3.5 w-3.5" />
                <span>COMMANDER LOADOUT</span>
              </h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Perlengkapan taktis komandan & Game Master.</p>
            </div>

            <!-- Customization Categories Tab -->
            <div class="grid grid-cols-3 gap-1 bg-black/60 p-1 border border-[#2b251d] rounded-lg text-[9px] font-pixel">
              <button
                v-for="cat in ['LEADERSHIP', 'PERKS', 'INSIGNIA']"
                :key="cat"
                @click="activeCategory = cat.toLowerCase()"
                :class="[
                  'py-1 text-center rounded transition-all',
                  activeCategory === cat.toLowerCase()
                    ? 'bg-[#f59e0b] text-black font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                ]"
              >
                {{ cat }}
              </button>
            </div>

            <!-- Gear Slot Matrix Grid -->
            <div class="grid grid-cols-3 gap-1.5 pt-1">
              <div
                v-for="(slot, i) in currentCommanderSlots"
                :key="i"
                @click="selectedSlotIndex = i"
                :class="[
                  'relative aspect-square flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer select-none',
                  selectedSlotIndex === i
                    ? 'bg-[#ca8a04]/20 border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.4)] text-white'
                    : 'bg-[#151922] border-[#2c3240] hover:border-gray-400 text-gray-300'
                ]"
              >
                <span class="text-xl">{{ slot.icon }}</span>
                <span class="text-[8px] font-bold text-center truncate w-full uppercase mt-1">{{ slot.label }}</span>
                <div v-if="selectedSlotIndex === i" class="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              </div>
            </div>

            <!-- Slot Inspector Box -->
            <div class="p-3 bg-black/60 border border-[#2b251d] rounded-lg space-y-1 text-xs">
              <div class="flex items-center justify-between text-[10px] text-gray-400 font-pixel">
                <span>SLOT: {{ currentCommanderSlots[selectedSlotIndex]?.label }}</span>
                <span class="text-amber-400 font-bold">GAME MASTER</span>
              </div>
              <div class="font-bold text-amber-300 font-pixel text-xs">
                {{ currentCommanderSlots[selectedSlotIndex]?.item }}
              </div>
              <p class="text-[10px] text-gray-400 leading-relaxed">
                {{ currentCommanderSlots[selectedSlotIndex]?.desc }}
              </p>
            </div>
          </div>

          <!-- Unlocked Titles List -->
          <div class="space-y-2 pt-3 border-t border-[#232936]">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-pixel text-gray-400 uppercase tracking-wider">
                GELAR TERBUKA ({{ (buddy.unlockedTitles || []).length }})
              </span>
              <button
                @click="openAwardTitleModal"
                class="text-[9px] text-[#f59e0b] hover:underline font-bold"
              >
                + Tambah
              </button>
            </div>

            <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
              <button
                v-for="title in (buddy.unlockedTitles || ['Pilar Regu Sejati'])"
                :key="title"
                @click="setActiveTitle(title)"
                :class="[
                  'px-2 py-1 rounded text-[10px] font-mono border transition-all text-left truncate max-w-full',
                  activeTitle === title
                    ? 'bg-[#ca8a04]/25 border-[#f59e0b] text-[#facc15] font-bold shadow-sm'
                    : 'bg-[#151922] border-[#2c3240] text-gray-400 hover:text-gray-200 hover:border-gray-500'
                ]"
              >
                {{ activeTitle === title ? '★' : '☆' }} {{ title }}
              </button>
            </div>
          </div>
        </div>

        <!-- CENTER COLUMN: HOLOGRAPHIC COMMANDER STAGE (6 Cols) -->
        <div class="lg:col-span-6 relative flex flex-col items-center justify-between rounded-xl bg-gradient-to-b from-[#161a26] via-[#0b0e14] to-[#040608] border border-[#232936] p-4 sm:p-6 overflow-hidden min-h-[460px] shadow-xl">
          <!-- Ambient Glow -->
          <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full blur-3xl opacity-25 pointer-events-none bg-[#f59e0b]" />

          <!-- Stage Info Header -->
          <div class="w-full flex items-center justify-between z-10">
            <div class="flex items-center gap-2">
              <Crown class="h-5 w-5 text-amber-400" />
              <div>
                <span class="text-[9px] font-pixel text-[#facc15] uppercase tracking-widest block">
                  COMMANDER EVOLUTION · TIER {{ buddy.characterTier || 2 }}
                </span>
                <span class="font-pixel text-sm font-bold text-white tracking-wider">
                  {{ buddy.fullName }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 bg-black/60 border border-[#2b251d] px-2.5 py-1 rounded-full text-xs font-pixel text-[#facc15]">
              <Sparkles class="h-3 w-3 text-amber-400" />
              <span>LEADERSHIP BOOST {{ evolutionInfo.statMultiplier }}x</span>
            </div>
          </div>

          <!-- DYNAMIC BUDDY COMMANDER FIGURE (OFFICIAL UNU PIXEL CHARACTER) -->
          <div class="relative my-4 flex items-center justify-center z-10 select-none min-h-[260px]">
            <!-- Glowing Orbit Rings -->
            <div class="absolute h-60 w-60 rounded-full border border-dashed border-[#ca8a04] opacity-40 animate-[spin_20s_linear_infinite]" />
            <div class="absolute h-48 w-48 rounded-full border border-[#f59e0b] opacity-30 animate-[spin_12s_linear_infinite_reverse]" />

            <!-- Commander Character Sprite -->
            <div class="relative flex flex-col items-center group transition-transform hover:scale-105 duration-300">
              <img
                :src="buddySpriteUrl"
                :alt="buddy.fullName || 'Karakter Buddy'"
                class="h-60 w-auto object-contain drop-shadow-[0_0_24px_rgba(245,158,11,0.5)]"
                style="image-rendering: pixelated;"
              />
            </div>

            <!-- Pedestal Ring Base -->
            <div class="absolute -bottom-4 w-48 h-7 rounded-[100%] bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent border-t border-[#facc15] blur-[1px]" />
          </div>

          <!-- Bottom Operative Banner -->
          <div class="z-10 text-center space-y-1">
            <div class="inline-block px-3 py-1 bg-black/80 border border-[#2b251d] rounded text-[10px] font-pixel text-gray-300">
              ROLE: <span class="text-[#facc15] font-bold">GAME MASTER & SQUAD COMMANDER</span>
            </div>
            <p class="text-[10px] text-gray-400 italic max-w-sm">
              "Bertanggung jawab mendampingi navigasi 9 lantai, menjaga ketahanan mental tim, dan mengalokasikan bonus apresiasi."
            </p>
          </div>
        </div>

        <!-- RIGHT COLUMN: STATS RADAR & GAME MASTER METRICS (3 Cols) -->
        <div class="lg:col-span-3 space-y-3 flex flex-col justify-between bg-[#0e1117] border border-[#232936] p-3.5 rounded-xl shadow-lg">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-pixel text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                <Crosshair class="h-3.5 w-3.5 text-[#f59e0b]" />
                <span>LEADERSHIP RADAR</span>
              </h3>
              <span class="text-xs font-pixel text-[#facc15] font-bold">{{ commanderRating }} OVR</span>
            </div>

            <!-- Hexagon Radar Polygon -->
            <div class="relative aspect-square w-full max-w-[200px] mx-auto flex items-center justify-center p-2">
              <svg viewBox="0 0 200 200" class="w-full h-full">
                <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="#262c3a" stroke-width="1.5" />
                <polygon points="100,45 150,73 150,127 100,155 50,127 50,73" fill="none" stroke="#1d232e" stroke-width="1" />
                <polygon points="100,70 130,86 130,114 100,130 70,114 70,86" fill="none" stroke="#1d232e" stroke-width="1" />

                <line x1="100" y1="20" x2="100" y2="180" stroke="#1d232e" stroke-width="1" />
                <line x1="30" y1="60" x2="170" y2="140" stroke="#1d232e" stroke-width="1" />
                <line x1="30" y1="140" x2="170" y2="60" stroke="#1d232e" stroke-width="1" />

                <!-- Dynamic Commander Polygon -->
                <polygon
                  :points="commanderRadarPoints"
                  fill="#ca8a04"
                  fill-opacity="0.5"
                  stroke="#facc15"
                  stroke-width="2"
                  class="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500"
                />

                <text x="100" y="14" fill="#fbbf24" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">
                  AUT {{ commanderStats.aut }}
                </text>
                <text x="175" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="start">
                  TAC {{ commanderStats.tac }}
                </text>
                <text x="175" y="145" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="start">
                  SUP {{ commanderStats.sup }}
                </text>
                <text x="100" y="196" fill="#fbbf24" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">
                  DEF {{ commanderStats.def }}
                </text>
                <text x="25" y="145" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="end">
                  ACC {{ commanderStats.acc }}
                </text>
                <text x="25" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="end">
                  SYN {{ commanderStats.syn }}
                </text>
              </svg>
            </div>

            <!-- Commander Scepter Artifact Card -->
            <div class="bg-black/60 border border-[#2b251d] p-3 rounded-lg space-y-2">
              <div class="flex items-center justify-between text-[9px] font-pixel">
                <span class="text-gray-400">COMMANDER SCEPTER</span>
                <span class="text-amber-400 font-bold">GAME MASTER</span>
              </div>
              <div class="font-pixel text-xs text-white font-bold tracking-wide">
                TONGKAT KOMANDO ASWAJA GOLD
              </div>
              <div class="text-[9px] text-[#f59e0b] tracking-wider uppercase font-bold">
                REGAL SCEPTER // GENIUS 2026
              </div>

              <div class="space-y-1.5 pt-1 text-[10px]">
                <div>
                  <div class="flex justify-between text-gray-400 text-[9px]">
                    <span>AUTHORITY & MORALE BOOST</span>
                    <span class="text-white font-bold">95</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#1a1f2c] rounded-full overflow-hidden mt-0.5">
                    <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style="width: 95%" />
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-gray-400 text-[9px]">
                    <span>BONUS ALLOCATION EFFICIENCY</span>
                    <span class="text-white font-bold">90</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#1a1f2c] rounded-full overflow-hidden mt-0.5">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style="width: 90%" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tip -->
          <div class="p-2.5 bg-[#161a22] border border-[#2b251d] rounded-lg text-[10px] text-gray-400 leading-relaxed flex items-start gap-2">
            <span class="text-amber-400 text-xs mt-0.5">💡</span>
            <span>Buddy memimpin maksimal 1 tim dan mengalokasikan bonus poin stage sesuai dedikasi peserta.</span>
          </div>
        </div>
      </div>

      <!-- 2-COLUMN BOTTOM: ASSIGNED SQUAD MEMBERS & BONUS AWARDS AUDIT LOG -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- LEFT 6 COLS: ASSIGNED SQUAD MEMBERS TABLE -->
        <div class="lg:col-span-6 rounded-xl border border-[#2b251d] bg-[#0d0f14] p-4 space-y-3 shadow-xl">
          <div class="flex items-center justify-between border-b border-[#232936] pb-3">
            <div>
              <h3 class="font-pixel text-xs sm:text-sm font-bold text-[#38bdf8] tracking-wider flex items-center gap-2">
                <Users class="h-4 w-4" />
                <span>SQUAD TIM BINAAN ({{ filteredSquadMembers.length }} ANGGOTA)</span>
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ buddy.teamName ? `Personel tim ${buddy.teamName} (${buddy.teamCode})` : 'Buddy belum membina tim aktif.' }}
              </p>
            </div>

            <NuxtLink
              v-if="buddy.teamId"
              :to="'/teams/' + buddy.teamId"
              class="text-xs bg-[#0c1e2e] border border-[#0284c7]/50 text-[#38bdf8] px-3 py-1 rounded hover:bg-[#0c2a40] font-pixel flex items-center gap-1"
            >
              <span>SQUAD ↗</span>
            </NuxtLink>
          </div>

          <div v-if="filteredSquadMembers.length > 0" class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="border-b border-[#232936] bg-[#141822] text-[10px] font-pixel text-gray-400">
                  <th class="py-2.5 px-3">PETUALANG</th>
                  <th class="py-2.5 px-3">KELAS & TIER</th>
                  <th class="py-2.5 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1e2330]">
                <tr
                  v-for="m in filteredSquadMembers"
                  :key="m.id"
                  class="hover:bg-[#141824] transition-colors"
                >
                  <td class="py-2 px-3 whitespace-nowrap">
                    <div class="font-bold text-white flex items-center gap-1.5">
                      <span>{{ m.fullName }}</span>
                      <span v-if="m.role === 'BUDDY'" class="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/40">CO-BUDDY</span>
                    </div>
                    <div class="text-[10px] text-gray-400">@{{ m.username }}</div>
                  </td>
                  <td class="py-2 px-3 whitespace-nowrap">
                    <div class="text-[#facc15] font-pixel text-[10px]">{{ m.characterClass || 'CYBER_KNIGHT' }}</div>
                    <div class="text-[9px] text-gray-400">Tier {{ m.characterTier || 1 }}</div>
                  </td>
                  <td class="py-2 px-3 text-right whitespace-nowrap">
                    <NuxtLink
                      :to="m.role === 'BUDDY' ? ('/buddies/' + m.id) : ('/participants/' + m.id)"
                      class="h-6 px-2 border border-[#523e2b] bg-[#1a1714] text-[#38bdf8] hover:border-[#0284c7] inline-flex items-center gap-1 rounded text-[10px] font-pixel"
                    >
                      <Eye class="h-3 w-3" />
                      <span>PROFIL</span>
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="py-8 text-center text-xs text-gray-500 border border-dashed border-[#232936] rounded-lg">
            Belum ada anggota binaan.
          </div>
        </div>

        <!-- RIGHT 6 COLS: BONUS AWARDS AUDIT LOG TABLE -->
        <div class="lg:col-span-6 rounded-xl border border-[#2b251d] bg-[#0d0f14] p-4 space-y-3 shadow-xl">
          <div class="flex items-center justify-between border-b border-[#232936] pb-3">
            <div>
              <h3 class="font-pixel text-xs sm:text-sm font-bold text-[#f59e0b] tracking-wider flex items-center gap-2">
                <History class="h-4 w-4" />
                <span>HISTORI BONUS YANG DIBERIKAN</span>
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Audit alokasi poin bonus apresiasi yang diberikan Buddy ini.
              </p>
            </div>

            <span class="text-xs bg-[#1a1714] border border-[#523e2b] px-3 py-1 rounded text-gray-300">
              Total: <strong class="text-white">{{ (buddy.bonusAwardsGiven || []).length }}x</strong>
            </span>
          </div>

          <div v-if="(buddy.bonusAwardsGiven || []).length > 0" class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="border-b border-[#232936] bg-[#141822] text-[10px] font-pixel text-gray-400">
                  <th class="py-2 px-3">PENERIMA</th>
                  <th class="py-2 px-3">POIN</th>
                  <th class="py-2 px-3">ALASAN / CATATAN</th>
                  <th class="py-2 px-3 text-right">WAKTU</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1e2330]">
                <tr
                  v-for="bTx in buddy.bonusAwardsGiven"
                  :key="bTx.id"
                  class="hover:bg-[#141824] transition-colors"
                >
                  <td class="py-2 px-3 whitespace-nowrap">
                    <div class="font-bold text-white">{{ bTx.recipientName || 'Mahasiswa' }}</div>
                    <div class="text-[9px] text-gray-500">@{{ bTx.recipientUsername || '-' }}</div>
                  </td>
                  <td class="py-2 px-3 whitespace-nowrap font-pixel font-bold text-emerald-400">
                    +{{ bTx.amount }} PTS
                  </td>
                  <td class="py-2 px-3 text-gray-300 text-xs">
                    {{ bTx.reason || 'Bonus Apresiasi Buddy' }}
                  </td>
                  <td class="py-2 px-3 text-right text-gray-500 text-[10px] whitespace-nowrap">
                    {{ formatDateTime(bTx.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="py-8 text-center text-xs text-gray-500 border border-dashed border-[#232936] rounded-lg">
            Buddy ini belum pernah mengalokasikan bonus poin ke anggota.
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: PLOTTING BUDDY KE TIM -->
    <Dialog :open="showAssignModal" @update:open="showAssignModal = $event">
      <DialogContent class="sm:max-w-[450px] pixel-card border-2 border-[#0284c7] bg-[#10141d] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center gap-2">
            <Shield class="h-4 w-4" />
            <span>PENUGASAN TIM BUDDY</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-2 text-xs font-mono">
          <p class="text-muted-foreground text-[11px]">
            Tugaskan <strong>{{ buddy?.fullName }}</strong> ke tim binaan (1 Buddy = 1 Tim):
          </p>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Tim Binaan:</Label>
            <select
              v-model="assignForm.teamId"
              class="w-full h-8 px-2 bg-[#181f2c] border border-[#2c374d] text-foreground focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="">-- Lepaskan dari Tim (Jadikan Cadangan) --</option>
              <option v-for="t in teamsList" :key="t.id" :value="t.id">
                {{ t.name }} ({{ t.code }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Peran Buddy di Tim:</Label>
            <select
              v-model="assignForm.buddyRole"
              class="w-full h-8 px-2 bg-[#181f2c] border border-[#2c374d] text-foreground focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="PRIMARY">PRIMARY (Kapten Utama)</option>
              <option value="ASSISTANT">ASSISTANT (Co-Buddy)</option>
            </select>
          </div>
        </div>

        <DialogFooter class="flex justify-end gap-2 pt-2">
          <button
            class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
            @click="showAssignModal = false"
          >
            Batal
          </button>
          <button
            class="h-8 px-4 text-xs font-pixel font-bold bg-[#0284c7] text-white border border-[#38bdf8] hover:bg-[#0369a1]"
            @click="submitAssignTeam"
            :disabled="saving"
          >
            {{ saving ? 'MENYIMPAN...' : 'SIMPAN PENUGASAN' }}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- MODAL: SEMATKAN GELAR -->
    <Dialog :open="showAwardModal" @update:open="showAwardModal = $event">
      <DialogContent class="sm:max-w-[450px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Award class="h-4 w-4" />
            <span>SEMATKAN GELAR COMMANDER</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-2 text-xs font-mono">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Gelar dari Katalog:</Label>
            <select
              v-model="awardForm.title"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option v-for="t in TITLE_CATALOG" :key="t.title" :value="t.title">
                {{ t.title }} ({{ t.category }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Atau Gelar Kustom:</Label>
            <input
              v-model="awardForm.customTitle"
              placeholder="Contoh: Komandan Penjelajah Sembilan Lantai..."
              class="w-full h-8 px-2.5 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div class="space-y-1 pt-1">
            <Label class="text-xs font-semibold">Upgrade Tier Karakter:</Label>
            <select
              v-model.number="awardForm.upgradeTier"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option :value="undefined">Pertahankan Tier Saat Ini (Tier {{ buddy?.characterTier || 2 }})</option>
              <option :value="1">Tier 1: Novice</option>
              <option :value="2">Tier 2: Advanced / Ksatria</option>
              <option :value="3">Tier 3: Master / Archon</option>
            </select>
          </div>
        </div>

        <DialogFooter class="flex justify-end gap-2 pt-2">
          <button
            class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
            @click="showAwardModal = false"
          >
            Batal
          </button>
          <button
            class="h-8 px-4 text-xs font-pixel font-bold bg-[#ca8a04] text-[#16110d] border border-[#eab308] hover:bg-[#eab308]"
            @click="submitAwardTitle"
            :disabled="saving"
          >
            {{ saving ? 'MENYIMPAN...' : 'SEMATKAN GELAR' }}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  ArrowLeft,
  RotateCw,
  Crown,
  Shield,
  Users,
  Award,
  Crosshair,
  History,
  AlertTriangle,
  Eye,
  Sparkles,
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
import {
  RPG_CHARACTERS,
  TITLE_CATALOG,
  CharacterClass,
  CharacterTier,
  getEvolutionForClassAndTier,
} from "@genius/types";
import { mockDb } from "@/lib/mockDb";
import { OFFICIAL_BUDDIES } from "@/lib/officialBuddies";

const route = useRoute();
const api = useApi();

const buddyId = computed(() => String(route.params.id || ""));

const loading = ref(true);
const saving = ref(false);
const buddy = ref<any>(null);
const teamsList = ref<any[]>([]);

const buddySpriteUrl = computed(() => {
  const isFemale =
    buddy.value?.gender === "FEMALE" ||
    buddy.value?.username?.includes("rina") ||
    buddy.value?.username?.includes("putri") ||
    buddy.value?.fullName?.toLowerCase().includes("rina") ||
    buddy.value?.fullName?.toLowerCase().includes("putri") ||
    buddy.value?.fullName?.toLowerCase().includes("sari");
  return isFemale ? "/character-cewek.png" : "/character-cowok.png";
});

const buddyAvatarUrl = computed(() => {
  if (buddy.value?.avatarUrl) return buddy.value.avatarUrl;
  const isFemale =
    buddy.value?.gender === "FEMALE" ||
    buddy.value?.username?.includes("rina") ||
    buddy.value?.username?.includes("putri") ||
    buddy.value?.fullName?.toLowerCase().includes("rina") ||
    buddy.value?.fullName?.toLowerCase().includes("putri") ||
    buddy.value?.fullName?.toLowerCase().includes("sari");
  return isFemale ? "/character-cewek-avatar.png" : "/character-cowok-avatar.png";
});

const activeCategory = ref("leadership");
const selectedSlotIndex = ref(0);

const showAssignModal = ref(false);
const assignForm = ref({
  teamId: "",
  buddyRole: "PRIMARY",
});

const showAwardModal = ref(false);
const awardForm = ref({
  title: "Pilar Regu Sejati",
  customTitle: "",
  upgradeTier: undefined as number | undefined,
});

// Load Buddy Data
async function fetchBuddyDetail() {
  if (!buddyId.value) return;
  loading.value = true;
  try {
    const res: any = await api.get(`/api/users/${buddyId.value}`);
    const data = res?.data !== undefined ? res.data : res;
    if (data && (data.id || data.username)) {
      buddy.value = data;
      loading.value = false;
      return;
    }
  } catch (err: any) {
    console.warn("API buddy fetch failed, falling back to mockDb:", err?.message || err);
  }

  // Fallback to mockDb
  const mock = mockDb.getBuddies().find(
    (b) => b.id === buddyId.value || b.username === buddyId.value
  );
  if (mock) {
    buddy.value = mock;
  } else {
    const officialMatch = OFFICIAL_BUDDIES.find(
      (b) => b.id === buddyId.value || b.username === buddyId.value
    );
    if (officialMatch) {
      buddy.value = {
        id: officialMatch.id,
        username: officialMatch.username,
        fullName: officialMatch.fullName,
        email: officialMatch.email,
        role: "BUDDY",
        status: "ACTIVE",
        avatarUrl: officialMatch.avatarUrl,
        assignedTeamId: officialMatch.teamId,
        assignedTeamName: officialMatch.teamName,
        teamId: officialMatch.teamId,
        teamName: officialMatch.teamName,
        teamCode: officialMatch.teamCode,
        buddyRole: officialMatch.buddyRole,
        prodi: officialMatch.prodi,
        faculty: officialMatch.faculty,
        gender: officialMatch.gender,
        bonusSpent: 0,
        createdAt: officialMatch.createdAt,
      };
    } else {
      // Fallback to first buddy
      const fallbackBuddy = mockDb.getBuddies()[0];
      buddy.value = fallbackBuddy || null;
    }
  }
  loading.value = false;
}

// Load Teams List for assignment
async function fetchTeams() {
  try {
    const res: any = await api.get("/api/teams?pageSize=100");
    const data = res?.data !== undefined ? res.data : res;
    if (Array.isArray(data) && data.length > 0) {
      teamsList.value = data;
      return;
    }
  } catch (err) {
    console.warn("Teams fetch failed, falling back to mockDb:", err);
  }
  teamsList.value = mockDb.getTeams();
}

onMounted(async () => {
  await Promise.all([fetchBuddyDetail(), fetchTeams()]);
});

// Active Title
const activeTitle = computed(() => {
  return buddy.value?.characterTitle || "Pilar Regu Sejati";
});

// Filtered Squad Members (excluding self)
const filteredSquadMembers = computed(() => {
  if (!buddy.value?.assignedSquadMembers) return [];
  return buddy.value.assignedSquadMembers.filter((m: any) => m.id !== buddy.value?.id);
});

// Class Data from Catalog
const characterClassData = computed(() => {
  const cls = (buddy.value?.characterClass as CharacterClass) || CharacterClass.MECHA_PALADIN;
  return RPG_CHARACTERS[cls] || RPG_CHARACTERS[CharacterClass.MECHA_PALADIN];
});

// Tier Evolution Info
const evolutionInfo = computed(() => {
  const cls = (buddy.value?.characterClass as CharacterClass) || CharacterClass.MECHA_PALADIN;
  const tier = (buddy.value?.characterTier as CharacterTier) || CharacterTier.ADVANCED;
  return getEvolutionForClassAndTier(cls, tier);
});

// Commander Rating (OVR)
const commanderRating = computed(() => {
  return 88;
});

// Commander Hexagon Radar Stats
const commanderStats = computed(() => {
  return {
    aut: 94, // Authority / Morale
    tac: 88, // Tactics
    sup: 92, // Support
    def: 90, // Defense
    acc: 85, // Accuracy
    syn: 95, // Team Synergy
  };
});

// Dynamic SVG Polygon coordinates for Commander Radar
const commanderRadarPoints = computed(() => {
  const cx = 100;
  const cy = 100;
  const maxR = 75;

  const s = commanderStats.value;
  const rAut = (s.aut / 100) * maxR;
  const rTac = (s.tac / 100) * maxR;
  const rSup = (s.sup / 100) * maxR;
  const rDef = (s.def / 100) * maxR;
  const rAcc = (s.acc / 100) * maxR;
  const rSyn = (s.syn / 100) * maxR;

  const p1 = `${cx},${cy - rAut}`;
  const p2 = `${cx + rTac * 0.866},${cy - rTac * 0.5}`;
  const p3 = `${cx + rSup * 0.866},${cy + rSup * 0.5}`;
  const p4 = `${cx},${cy + rDef}`;
  const p5 = `${cx - rAcc * 0.866},${cy + rAcc * 0.5}`;
  const p6 = `${cx - rSyn * 0.866},${cy - rSyn * 0.5}`;

  return `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`;
});

// Commander Slots
const currentCommanderSlots = computed(() => {
  return [
    { label: "Scepter", icon: "👑", item: "Tongkat Komando Aswaja", desc: "Tongkat bermahkotakan permata emas untuk memimpin komando regu." },
    { label: "Armor", icon: "🦺", item: "Jubah Emas Game Master", desc: "Jubah kebesaran pendamping dengan perlindungan sensor tinggi." },
    { label: "Comms", icon: "🎧", item: "Quantum Ear-piece GM", desc: "Headset komunikasi langsung ke panitia pusat kendali lantai 9." },
  ];
});

// Format Date Time
function formatDateTime(val: any) {
  if (!val) return "-";
  return new Date(val).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Switch Active Title Directly
async function setActiveTitle(title: string) {
  if (!buddy.value) return;
  try {
    const res = await api.put(`/api/users/${buddy.value.id}`, {
      characterTitle: title,
    });
    if (res.data?.success) {
      buddy.value.characterTitle = title;
    }
  } catch (e: any) {
    console.error("Failed to update active title:", e);
  }
}

// Assign Team
function openAssignTeamModal() {
  assignForm.value.teamId = buddy.value?.teamId || "";
  assignForm.value.buddyRole = buddy.value?.buddyRole || "PRIMARY";
  showAssignModal.value = true;
}

async function submitAssignTeam() {
  if (!buddy.value) return;
  saving.value = true;
  try {
    const res: any = await api.post(`/api/users/${buddy.value.id}/assign-buddy`, {
      teamId: assignForm.value.teamId || null,
      buddyRole: assignForm.value.buddyRole,
    });
    if (res?.success || res?.data?.success || res?.id) {
      showAssignModal.value = false;
      await fetchBuddyDetail();
    }
  } catch (err: any) {
    alert("Gagal menugaskan tim: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

// Award Title
function openAwardTitleModal() {
  awardForm.value.title = "Pilar Regu Sejati";
  awardForm.value.customTitle = "";
  awardForm.value.upgradeTier = undefined;
  showAwardModal.value = true;
}

async function submitAwardTitle() {
  if (!buddy.value) return;
  const titleToAward = awardForm.value.customTitle.trim() || awardForm.value.title;
  if (!titleToAward) return;

  saving.value = true;
  try {
    const res: any = await api.post(`/api/users/${buddy.value.id}/award-title`, {
      title: titleToAward,
      upgradeTier: awardForm.value.upgradeTier,
    });
    if (res?.success || res?.data?.success || res?.id) {
      showAwardModal.value = false;
      await fetchBuddyDetail();
    }
  } catch (err: any) {
    alert("Gagal menyematkan gelar: " + (err.message || "Error server"));
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0f1218;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3b2c1e;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #ca8a04;
}
</style>
