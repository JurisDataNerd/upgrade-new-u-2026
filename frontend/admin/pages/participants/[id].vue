<template>
  <div class="p-4 md:p-6 space-y-4 font-mono text-gray-200 select-none pb-12 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <NuxtLink
        to="/participants"
        class="pixel-btn h-8 px-3 bg-[#1c1611] border border-[#523e2b] text-[#f59e0b] hover:bg-[#2e2116] hover:border-[#f59e0b] text-xs font-pixel flex items-center gap-1.5 transition-all shadow-sm"
        title="Kembali ke Direktori"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">KEMBALI</span>
      </NuxtLink>

      <button
        @click="openAwardTitleModal"
        class="pixel-btn h-8 px-3 bg-[#ca8a04]/20 border border-[#f59e0b] text-[#facc15] hover:bg-[#ca8a04]/40 text-xs font-pixel flex items-center gap-1.5 transition-all"
        title="Sematkan Gelar"
      >
        <Award class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">SEMATKAN GELAR</span>
      </button>

      <button
        @click="fetchParticipantDetail"
        :disabled="loading"
        class="pixel-btn h-8 w-8 bg-[#1c1611] border border-[#523e2b] text-gray-300 hover:text-white hover:border-gray-500 text-xs flex items-center justify-center transition-all"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Top Breadcrumb & Navigation Bar -->
    <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono border-b border-[#4a3624]/60 pb-2">
      <NuxtLink to="/participants" class="text-gray-400 hover:text-[#f59e0b]">DIREKTORI PESERTA</NuxtLink>
      <span>/</span>
      <span class="text-[#f59e0b] font-bold uppercase truncate max-w-[200px] sm:max-w-md">
        {{ participant?.fullName || participant?.username || 'DETAIL PETUALANG' }}
      </span>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="loading && !participant" class="py-24 flex flex-col items-center justify-center space-y-4">
      <RotateCw class="h-10 w-10 text-[#f59e0b] animate-spin" />
      <div class="font-pixel text-sm text-[#f59e0b] tracking-wider animate-pulse">
        MENGHUBUNGKAN KE MAINFRAME PETUALANG...
      </div>
    </div>

    <!-- 404 / Error State -->
    <div v-else-if="!participant" class="py-16 text-center space-y-3 bg-[#141822]/60 border border-red-500/30 rounded-lg p-6">
      <AlertTriangle class="h-12 w-12 text-red-400 mx-auto" />
      <h2 class="font-pixel text-base text-red-400">DATA PETUALANG TIDAK DITEMUKAN</h2>
      <p class="text-xs text-gray-400">ID peserta tidak valid atau telah dihapus dari database.</p>
      <NuxtLink
        to="/participants"
        class="inline-flex h-8 px-4 items-center gap-2 rounded bg-[#f59e0b] text-black font-pixel text-xs font-bold"
      >
        KEMBALI KE DAFTAR PESERTA
      </NuxtLink>
    </div>

    <!-- MAIN TACTICAL RPG DASHBOARD CONTENT -->
    <div v-else class="space-y-4">
      
      <!-- TOP COMMAND HUD CARD -->
      <div class="relative overflow-hidden rounded-xl border-2 border-[#523e2b] bg-gradient-to-r from-[#121620] via-[#0e1118] to-[#18130e] p-4 sm:p-5 shadow-2xl">
        <!-- Ambient HUD Glow -->
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f59e0b]/10 blur-3xl pointer-events-none" />
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <!-- User Identity Left Section -->
          <div class="flex items-start sm:items-center gap-3.5">
            <!-- Overall Rating Circle -->
            <div class="relative group">
              <div class="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-[#ca8a04]/30 to-[#1e1712] border-2 border-[#f59e0b] flex flex-col items-center justify-center font-pixel shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
                <span class="text-base sm:text-xl font-bold text-[#facc15] leading-none">{{ overallRating }}</span>
                <span class="text-[8px] text-amber-300/80 font-bold uppercase mt-0.5 tracking-wider">OVR</span>
              </div>
              <div class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center" title="Status: Aktif">
                <div class="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              </div>
            </div>

            <!-- Identity Text Info -->
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-pixel text-gray-400 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-[#2b251d]">
                  NIM: {{ participant.username }}
                </span>
                <span class="px-2 py-0.5 bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40 text-[10px] rounded font-pixel font-bold">
                  OPERATOR LV. {{ operatorLevel }}
                </span>
                <span class="px-2 py-0.5 bg-[#ca8a04]/20 text-[#facc15] border border-[#ca8a04]/50 text-[10px] rounded font-pixel font-bold">
                  {{ evolutionInfo.badge }}
                </span>
                <span :class="[
                  'px-2 py-0.5 text-[10px] rounded font-bold border',
                  participant.gender === 'FEMALE'
                    ? 'bg-pink-500/15 text-pink-400 border-pink-500/40'
                    : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40'
                ]">
                  {{ participant.gender === 'FEMALE' ? '♀ FEMALE' : '♂ MALE' }}
                </span>
              </div>

              <h1 class="text-lg sm:text-2xl font-bold text-white tracking-wide uppercase font-pixel flex flex-wrap items-center gap-2.5">
                <span>{{ participant.fullName }}</span>
                <span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-normal tracking-normal px-2 py-0.5 rounded border" :style="{
                  borderColor: activeTitleRarityDetails.borderColor,
                  backgroundColor: activeTitleRarityDetails.bgTint,
                  color: activeTitleRarityDetails.textColor,
                }">
                  <span class="text-[9px] font-black px-1.5 py-0.2 rounded text-white" :style="{ background: activeTitleRarityDetails.badgeColor }">
                    {{ activeTitleRarityDetails.shortLabel }}
                  </span>
                  <span>[{{ activeTitle }}]</span>
                </span>
              </h1>

              <!-- Team Membership Tag -->
              <div class="flex items-center gap-2 text-xs text-gray-300 pt-0.5">
                <span class="text-gray-400">Tim:</span>
                <span v-if="participant.teamName" class="inline-flex items-center gap-1.5 font-bold text-[#38bdf8] bg-[#0c1e2e] px-2 py-0.5 rounded border border-[#0284c7]/40">
                  <Shield class="h-3 w-3" />
                  <span>{{ participant.teamName }} ({{ participant.teamCode }})</span>
                </span>
                <span v-else class="text-amber-500/80 italic text-[11px]">
                  [Belum Masuk Tim / Free Agent]
                </span>
              </div>
            </div>
          </div>

          <!-- Total Score & Stat Highlights Right Section -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-4 bg-black/50 p-3 rounded-lg border border-[#2b251d]">
            <div class="text-center px-2 sm:px-3 border-r border-[#2b251d]">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">TOTAL POIN</div>
              <div class="text-base sm:text-xl font-bold text-amber-400 font-pixel flex items-center justify-center gap-1">
                <span>⭐</span>
                <span>{{ (participant.totalScore || 0).toLocaleString() }}</span>
              </div>
              <div class="text-[8px] text-emerald-400 font-bold">TERKOREKSI LIVE</div>
            </div>

            <div class="text-center px-2 sm:px-3 border-r border-[#2b251d]">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">KELAS RPG</div>
              <div class="text-xs sm:text-sm font-bold text-[#38bdf8] font-pixel truncate max-w-[130px]">
                {{ characterClassData.name }}
              </div>
              <div class="text-[9px] text-gray-400">{{ characterClassData.role }}</div>
            </div>

            <div class="text-center px-2 sm:px-3">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">TIER EVOLUSI</div>
              <div class="text-xs sm:text-sm font-bold text-[#a855f7] font-pixel">
                {{ evolutionInfo.tierName }}
              </div>
              <div class="text-[9px] text-purple-300">BOOST {{ evolutionInfo.statMultiplier }}x</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-COLUMN TACTICAL MAIN DISPLAY -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- LEFT COLUMN: LOADOUT & CUSTOMIZATION (3 Cols) -->
        <div class="lg:col-span-3 space-y-3 flex flex-col justify-between bg-[#0e1117] border border-[#232936] p-3.5 rounded-xl shadow-lg">
          <div class="space-y-3">
            <div>
              <h3 class="font-pixel text-xs font-bold text-[#f59e0b] tracking-wider flex items-center gap-1.5">
                <Layers class="h-3.5 w-3.5" />
                <span>TACTICAL LOADOUT</span>
              </h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Kustomisasi perlengkapan hero petualang.</p>
            </div>

            <!-- Customization Categories Tab -->
            <div class="grid grid-cols-3 gap-1 bg-black/60 p-1 border border-[#2b251d] rounded-lg text-[9px] font-pixel">
              <button
                v-for="cat in ['APPEARANCE', 'MARKINGS', 'OUTFITS']"
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
                v-for="(slot, i) in currentSlots"
                :key="i"
                @click="selectedSlotIndex = i"
                :class="[
                  'relative aspect-square flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer select-none',
                  selectedSlotIndex === i
                    ? 'bg-[#f59e0b]/20 border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.4)] text-white'
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
                <span>SLOT: {{ currentSlots[selectedSlotIndex]?.label }}</span>
                <span class="text-emerald-400 font-bold">TERPASANG</span>
              </div>
              <div class="font-bold text-amber-300 font-pixel text-xs">
                {{ currentSlots[selectedSlotIndex]?.item }}
              </div>
              <p class="text-[10px] text-gray-400 leading-relaxed">
                {{ currentSlots[selectedSlotIndex]?.desc }}
              </p>
            </div>
          </div>

          <!-- Unlocked Title Badges -->
          <div class="space-y-2 pt-3 border-t border-[#232936]">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-pixel text-gray-400 uppercase tracking-wider">
                GELAR TERBUKA ({{ (participant.unlockedTitles || []).length }})
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
                v-for="title in (participant.unlockedTitles || ['Novice Adventurer'])"
                :key="title"
                @click="setActiveTitle(title)"
                :class="[
                  'px-2 py-1 rounded text-[10px] font-mono border transition-all text-left truncate max-w-full',
                  activeTitle === title
                    ? 'bg-[#ca8a04]/25 border-[#f59e0b] text-[#facc15] font-bold shadow-sm'
                    : 'bg-[#151922] border-[#2c3240] text-gray-400 hover:text-gray-200 hover:border-gray-500'
                ]"
                :title="'Klik untuk memasang gelar: ' + title"
              >
                {{ activeTitle === title ? '★' : '☆' }} {{ title }}
              </button>
            </div>
          </div>
        </div>

        <!-- CENTER COLUMN: HOLOGRAPHIC HERO STAGE (6 Cols) -->
        <div class="lg:col-span-6 relative flex flex-col items-center justify-between rounded-xl bg-gradient-to-b from-[#131722] via-[#0a0c10] to-[#050608] border border-[#232936] p-4 sm:p-6 overflow-hidden min-h-[460px] shadow-xl">
          <!-- Background Grid & Glow Auras -->
          <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
            :style="{ backgroundColor: characterClassData.color || '#38bdf8' }"
          />

          <!-- Top Stage Info Header -->
          <div class="w-full flex items-center justify-between z-10">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ characterClassData.icon }}</span>
              <div>
                <span class="text-[9px] font-pixel text-gray-400 uppercase tracking-widest block">
                  {{ evolutionInfo.badge }}
                </span>
                <span class="font-pixel text-sm font-bold text-white tracking-wider">
                  {{ characterClassData.id }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 bg-black/60 border border-[#2b251d] px-2.5 py-1 rounded-full text-xs font-pixel text-[#facc15]">
              <Sparkles class="h-3 w-3 text-amber-400" />
              <span>BOOST {{ evolutionInfo.statMultiplier }}x</span>
            </div>
          </div>

          <!-- DYNAMIC RPG HERO FIGURE (SVG VECTOR AVATAR) -->
          <div class="relative my-4 flex items-center justify-center z-10 select-none">
            <!-- Glowing Aura Rings Behind Character -->
            <div
              class="absolute h-56 w-56 rounded-full border border-dashed opacity-40 animate-[spin_20s_linear_infinite]"
              :style="{ borderColor: characterClassData.color }"
            />
            <div
              class="absolute h-44 w-44 rounded-full border opacity-30 animate-[spin_12s_linear_infinite_reverse]"
              :style="{ borderColor: characterClassData.color }"
            />

            <!-- Hero Vector Graphics -->
            <div class="relative flex flex-col items-center group transition-transform hover:scale-105 duration-300">
              <svg width="180" height="240" viewBox="0 0 180 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_0_16px_rgba(245,158,11,0.3)]">
                <!-- Outer Cyber Glow -->
                <circle cx="90" cy="120" r="70" :fill="characterClassData.color" fill-opacity="0.08" />

                <!-- Head / Helmet -->
                <path d="M70 45 C70 25, 110 25, 110 45 L110 65 C110 75, 70 75, 70 65 Z" fill="#1e2433" :stroke="characterClassData.color" stroke-width="2.5" />
                
                <!-- Glowing Visor -->
                <rect x="74" y="42" width="32" height="10" rx="3" fill="#38bdf8" class="animate-pulse" />

                <!-- Torso / Tactical Rig -->
                <path d="M62 70 L118 70 L112 135 L68 135 Z" fill="#181d28" :stroke="characterClassData.color" stroke-width="2.5" />
                <!-- Armor Plates -->
                <line x1="72" y1="85" x2="108" y2="85" stroke="#f59e0b" stroke-width="2" />
                <line x1="75" y1="100" x2="105" y2="100" stroke="#f59e0b" stroke-width="2" />
                <line x1="78" y1="115" x2="102" y2="115" stroke="#f59e0b" stroke-width="2" />

                <!-- Left Arm & Weapon Attachment -->
                <path d="M62 72 L45 110 L52 114 L68 80 Z" fill="#1e2433" :stroke="characterClassData.color" stroke-width="2" />
                <!-- Right Arm Holding Class Artifact -->
                <path d="M118 72 L135 110 L128 114 L112 80 Z" fill="#1e2433" :stroke="characterClassData.color" stroke-width="2" />

                <!-- Class Weapon Graphic (Diagonal Tactical Blade / Core) -->
                <line x1="40" y1="130" x2="140" y2="90" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" class="drop-shadow-[0_0_8px_#f59e0b]" />
                <line x1="42" y1="129" x2="138" y2="91" stroke="#fff" stroke-width="2" stroke-linecap="round" />

                <!-- Left Leg -->
                <path d="M72 135 L68 205 L82 205 L84 135 Z" fill="#151922" :stroke="characterClassData.color" stroke-width="2" />
                <!-- Right Leg -->
                <path d="M96 135 L98 205 L112 205 L108 135 Z" fill="#151922" :stroke="characterClassData.color" stroke-width="2" />

                <!-- Boots -->
                <rect x="64" y="200" width="20" height="10" rx="2" fill="#1e2433" stroke="#f59e0b" stroke-width="1.5" />
                <rect x="96" y="200" width="20" height="10" rx="2" fill="#1e2433" stroke="#f59e0b" stroke-width="1.5" />
              </svg>
            </div>

            <!-- Pedestal Ring Base -->
            <div class="absolute -bottom-4 w-44 h-7 rounded-[100%] bg-gradient-to-r from-transparent via-[#f59e0b]/40 to-transparent border-t border-[#f59e0b] blur-[1px]" />
          </div>

          <!-- Bottom Operative Model Banner -->
          <div class="z-10 text-center space-y-1">
            <div class="inline-block px-3 py-1 bg-black/80 border border-[#2b251d] rounded text-[10px] font-pixel text-gray-300">
              OPERATIVE MODEL: <span class="text-[#f59e0b] font-bold">{{ characterClassData.nameId }}</span>
            </div>
            <p class="text-[10px] text-gray-400 italic max-w-sm">
              "{{ characterClassData.description }}"
            </p>
          </div>
        </div>

        <!-- RIGHT COLUMN: STATS RADAR & WEAPON ARTIFACT (3 Cols) -->
        <div class="lg:col-span-3 space-y-3 flex flex-col justify-between bg-[#0e1117] border border-[#232936] p-3.5 rounded-xl shadow-lg">
          <div class="space-y-3">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <h3 class="font-pixel text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                <Crosshair class="h-3.5 w-3.5 text-[#f59e0b]" />
                <span>STATS OVERVIEW</span>
              </h3>
              <span class="text-xs font-pixel text-[#facc15] font-bold">{{ overallRating }} OVR</span>
            </div>

            <!-- HEXAGON STATS RADAR VISUALIZATION -->
            <div class="relative aspect-square w-full max-w-[200px] mx-auto flex items-center justify-center p-2">
              <svg viewBox="0 0 200 200" class="w-full h-full">
                <!-- Background Radar Web Rings -->
                <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="#262c3a" stroke-width="1.5" />
                <polygon points="100,45 150,73 150,127 100,155 50,127 50,73" fill="none" stroke="#1d232e" stroke-width="1" />
                <polygon points="100,70 130,86 130,114 100,130 70,114 70,86" fill="none" stroke="#1d232e" stroke-width="1" />

                <!-- Axes -->
                <line x1="100" y1="20" x2="100" y2="180" stroke="#1d232e" stroke-width="1" />
                <line x1="30" y1="60" x2="170" y2="140" stroke="#1d232e" stroke-width="1" />
                <line x1="30" y1="140" x2="170" y2="60" stroke="#1d232e" stroke-width="1" />

                <!-- Dynamic Data Polygon -->
                <polygon
                  :points="radarPolygonPoints"
                  fill="#f59e0b"
                  fill-opacity="0.5"
                  stroke="#fbbf24"
                  stroke-width="2"
                  class="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500"
                />

                <!-- Stat Labels -->
                <text x="100" y="14" fill="#fbbf24" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">
                  DMG {{ calculatedStats.dmg }}
                </text>
                <text x="175" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="start">
                  TAC {{ calculatedStats.tac }}
                </text>
                <text x="175" y="145" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="start">
                  MOB {{ calculatedStats.mob }}
                </text>
                <text x="100" y="196" fill="#fbbf24" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">
                  PHY {{ calculatedStats.phy }}
                </text>
                <text x="25" y="145" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="end">
                  ACC {{ calculatedStats.acc }}
                </text>
                <text x="25" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="end">
                  SYN {{ calculatedStats.syn }}
                </text>
              </svg>
            </div>

            <!-- EQUIPPED WEAPON ARTIFACT CARD -->
            <div class="bg-black/60 border border-[#2b251d] p-3 rounded-lg space-y-2">
              <div class="flex items-center justify-between text-[9px] font-pixel">
                <span class="text-gray-400">EQUIPPED ARTIFACT</span>
                <span class="text-amber-400 font-bold">PRIMARY</span>
              </div>
              <div class="font-pixel text-xs text-white font-bold tracking-wide">
                {{ equippedWeapon.name }}
              </div>
              <div class="text-[9px] text-[#f59e0b] tracking-wider uppercase font-bold">
                {{ equippedWeapon.tag }}
              </div>

              <!-- Weapon Stat Progress Bars -->
              <div class="space-y-1.5 pt-1 text-[10px]">
                <div>
                  <div class="flex justify-between text-gray-400 text-[9px]">
                    <span>DAMAGE OUTPUT</span>
                    <span class="text-white font-bold">{{ equippedWeapon.damage }}</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#1a1f2c] rounded-full overflow-hidden mt-0.5">
                    <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" :style="{ width: `${equippedWeapon.damage}%` }" />
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-gray-400 text-[9px]">
                    <span>ACCURACY & CRIT</span>
                    <span class="text-white font-bold">{{ equippedWeapon.accuracy }}</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#1a1f2c] rounded-full overflow-hidden mt-0.5">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" :style="{ width: `${equippedWeapon.accuracy}%` }" />
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-gray-400 text-[9px]">
                    <span>CAST / FIRING SPEED</span>
                    <span class="text-white font-bold">{{ equippedWeapon.speed }}</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#1a1f2c] rounded-full overflow-hidden mt-0.5">
                    <div class="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full" :style="{ width: `${equippedWeapon.speed}%` }" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Notice Tip -->
          <div class="p-2.5 bg-[#161a22] border border-[#2b251d] rounded-lg text-[10px] text-gray-400 leading-relaxed flex items-start gap-2">
            <span class="text-amber-400 text-xs mt-0.5">💡</span>
            <span>Gelar dan statistik petualang tersinkronisasi otomatis dengan Point Ledger & penugasan stage.</span>
          </div>
        </div>
      </div>

      <!-- BOTTOM SECTION: LIVE POINT LEDGER TRANSACTIONS -->
      <div class="rounded-xl border border-[#2b251d] bg-[#0d0f14] p-4 sm:p-5 space-y-3 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#232936] pb-3">
          <div>
            <h3 class="font-pixel text-xs sm:text-sm font-bold text-[#f59e0b] tracking-wider flex items-center gap-2">
              <History class="h-4 w-4" />
              <span>POINT LEDGER & RIWAYAT SKOR PETUALANG</span>
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Seluruh jejak transaksi poin game session, buddy bonus, dan koreksi admin.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs bg-[#1a1714] border border-[#523e2b] px-3 py-1 rounded text-gray-300">
              Total Transaksi: <strong class="text-white">{{ (participant.scoreHistory || []).length }}</strong>
            </span>
          </div>
        </div>

        <!-- Ledger Table -->
        <div v-if="(participant.scoreHistory || []).length > 0" class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-[#232936] bg-[#141822] text-[10px] font-pixel text-gray-400">
                <th class="py-2.5 px-3">WAKTU</th>
                <th class="py-2.5 px-3">TIPE</th>
                <th class="py-2.5 px-3">PERUBAHAN POIN</th>
                <th class="py-2.5 px-3">KETERANGAN / ALASAN</th>
                <th class="py-2.5 px-3 text-right">STAGE ID</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1e2330]">
              <tr
                v-for="tx in participant.scoreHistory"
                :key="tx.id"
                class="hover:bg-[#141824] transition-colors"
              >
                <td class="py-2.5 px-3 text-gray-400 whitespace-nowrap text-[11px]">
                  {{ formatDateTime(tx.createdAt) }}
                </td>
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[9px] font-pixel font-bold border',
                    tx.sourceType === 'GAME_SESSION' || tx.type === 'GAME'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : tx.sourceType === 'BONUS'
                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      : tx.sourceType === 'CORRECTION'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                  ]">
                    {{ tx.sourceType || tx.type || 'SESSION' }}
                  </span>
                </td>
                <td class="py-2.5 px-3 whitespace-nowrap font-pixel font-bold">
                  <span :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'">
                    {{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount }} PTS
                  </span>
                </td>
                <td class="py-2.5 px-3 text-gray-300 text-xs">
                  {{ tx.reason || tx.description || 'Poin Game Session' }}
                </td>
                <td class="py-2.5 px-3 text-right text-gray-400 text-[11px] font-mono">
                  {{ tx.stageId ? tx.stageId.slice(0, 8) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="py-8 text-center text-xs text-gray-500 border border-dashed border-[#232936] rounded-lg">
          Belum ada transaksi poin yang tercatat untuk petualang ini.
        </div>
      </div>
    </div>

    <!-- MODAL: SEMATKAN GELAR (AWARD TITLE) -->
    <Dialog :open="showAwardModal" @update:open="showAwardModal = $event">
      <DialogContent class="sm:max-w-[450px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Award class="h-4 w-4" />
            <span>SEMATKAN GELAR RPG</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-2 text-xs font-mono">
          <p class="text-muted-foreground text-[11px]">
            Pilih gelar kehormatan petualang untuk disematkan kepada <strong>{{ participant?.fullName }}</strong>:
          </p>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Gelar dari Katalog (99 Gelar):</Label>
            <select
              v-model="awardForm.title"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b] text-xs"
            >
              <option v-for="t in TITLE_CATALOG" :key="t.id" :value="t.title">
                [{{ t.rarity }}] {{ t.id }} · {{ t.title }} ({{ t.category }}) — Min. {{ t.requiredPoints }} Pts
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Atau Tulis Gelar Kustom:</Label>
            <input
              v-model="awardForm.customTitle"
              placeholder="Contoh: Sang Penakluk Lantai 9..."
              class="w-full h-8 px-2.5 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div class="space-y-1 pt-1">
            <Label class="text-xs font-semibold">Upgrade Tier Karakter (Opsional):</Label>
            <select
              v-model.number="awardForm.upgradeTier"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option :value="undefined">Pertahankan Tier Saat Ini (Tier {{ participant?.characterTier || 1 }})</option>
              <option :value="1">Tier 1: Novice / Inisiat</option>
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
  Award,
  Shield,
  Layers,
  Sparkles,
  Crosshair,
  History,
  AlertTriangle,
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
  TitleRarity,
  getTitleRarityDetails,
  findTitleDefinition,
} from "@genius/types";

const route = useRoute();
const api = useApi();

const participantId = computed(() => String(route.params.id || ""));

const loading = ref(true);
const saving = ref(false);
const participant = ref<any>(null);

const activeCategory = ref("appearance");
const selectedSlotIndex = ref(3); // default to Legs / Weapon

const showAwardModal = ref(false);
const awardForm = ref({
  title: TITLE_CATALOG[0]?.title || "Novice Adventurer",
  customTitle: "",
  upgradeTier: undefined as number | undefined,
});

// Load Participant Data from Backend API
async function fetchParticipantDetail() {
  if (!participantId.value) return;
  loading.value = true;
  try {
    const res: any = await api.get(`/api/users/${participantId.value}`);
    const data = res?.data !== undefined ? res.data : res;
    if (data && (data.id || data.username)) {
      participant.value = data;
    } else {
      participant.value = null;
    }
  } catch (err: any) {
    console.error("Failed to fetch participant detail:", err);
    participant.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchParticipantDetail();
});

// Active Title
const activeTitle = computed(() => {
  return participant.value?.characterTitle || "Novice Adventurer";
});

// Active Title Rarity Details
const activeTitleRarityDetails = computed(() => {
  const matched = findTitleDefinition(activeTitle.value);
  const rarity = matched ? matched.rarity : TitleRarity.RARE;
  return getTitleRarityDetails(rarity);
});

// Class Data from Catalog
const characterClassData = computed(() => {
  const cls = (participant.value?.characterClass as CharacterClass) || CharacterClass.CYBER_KNIGHT;
  return RPG_CHARACTERS[cls] || RPG_CHARACTERS[CharacterClass.CYBER_KNIGHT];
});

// Tier Evolution Info
const evolutionInfo = computed(() => {
  const cls = (participant.value?.characterClass as CharacterClass) || CharacterClass.CYBER_KNIGHT;
  const tier = (participant.value?.characterTier as CharacterTier) || CharacterTier.BASIC;
  return getEvolutionForClassAndTier(cls, tier);
});

// Operator Level
const operatorLevel = computed(() => {
  const pts = participant.value?.totalScore || 0;
  return Math.max(1, Math.floor(pts / 25) + 1);
});

// Overall Rating (OVR)
const overallRating = computed(() => {
  const pts = participant.value?.totalScore || 0;
  const tierMult = evolutionInfo.value.statMultiplier || 1.0;
  const base = 75;
  const bonus = Math.min(24, Math.floor(pts / 15));
  return Math.min(99, Math.round((base + bonus) * (tierMult >= 1.4 ? 1.05 : 1.0)));
});

// Calculated Hexagon Radar Stats
const calculatedStats = computed(() => {
  const baseStats = characterClassData.value.stats || { str: 75, int: 75, agi: 70, vit: 80, wis: 70 };
  const mult = evolutionInfo.value.statMultiplier || 1.0;
  const scoreBonus = Math.min(10, Math.floor((participant.value?.totalScore || 0) / 40));

  return {
    dmg: Math.min(99, Math.round(baseStats.str * mult * 0.9 + scoreBonus)),
    tac: Math.min(99, Math.round(baseStats.int * mult * 0.9 + scoreBonus)),
    mob: Math.min(99, Math.round(baseStats.agi * mult * 0.9 + scoreBonus)),
    phy: Math.min(99, Math.round(baseStats.vit * mult * 0.9 + scoreBonus)),
    acc: Math.min(99, Math.round(baseStats.wis * mult * 0.9 + scoreBonus)),
    syn: Math.min(99, Math.round((baseStats.int + baseStats.str) / 2 * mult * 0.9 + scoreBonus)),
  };
});

// Dynamic SVG Polygon coordinates for Hexagon Radar (Center: 100, 100, Max Radius: 75)
const radarPolygonPoints = computed(() => {
  const cx = 100;
  const cy = 100;
  const maxR = 75;

  const s = calculatedStats.value;
  const rDmg = (s.dmg / 100) * maxR;
  const rTac = (s.tac / 100) * maxR;
  const rMob = (s.mob / 100) * maxR;
  const rPhy = (s.phy / 100) * maxR;
  const rAcc = (s.acc / 100) * maxR;
  const rSyn = (s.syn / 100) * maxR;

  // Angles: 0 (top = -90 deg), 60 deg, 120 deg, 180 deg, 240 deg, 300 deg
  const p1 = `${cx},${cy - rDmg}`; // Top (DMG)
  const p2 = `${cx + rTac * 0.866},${cy - rTac * 0.5}`; // Top Right (TAC)
  const p3 = `${cx + rMob * 0.866},${cy + rMob * 0.5}`; // Bottom Right (MOB)
  const p4 = `${cx},${cy + rPhy}`; // Bottom (PHY)
  const p5 = `${cx - rAcc * 0.866},${cy + rAcc * 0.5}`; // Bottom Left (ACC)
  const p6 = `${cx - rSyn * 0.866},${cy - rSyn * 0.5}`; // Top Left (SYN)

  return `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`;
});

// Class-Specific Weapon / Artifact Arsenal
const equippedWeapon = computed(() => {
  const cls = (participant.value?.characterClass as CharacterClass) || CharacterClass.CYBER_KNIGHT;
  switch (cls) {
    case CharacterClass.TECH_MAGE:
      return {
        name: "AETHER-9 / QUANTUM RESONATOR",
        tag: "ENERGY CATALYST // UNU LAB AI",
        damage: 88,
        accuracy: 92,
        speed: 78,
      };
    case CharacterClass.CODE_ARCHER:
      return {
        name: "VALKYRIE-X / PHOTON COMPOUND BOW",
        tag: "PRECISION LASER // 9TH FLOOR",
        damage: 84,
        accuracy: 96,
        speed: 90,
      };
    case CharacterClass.DATA_ALCHEMIST:
      return {
        name: "NANOTECH FLASK CATALYST 4.0",
        tag: "MOLECULAR SYNTHESIS // HALAL LAB",
        damage: 76,
        accuracy: 88,
        speed: 85,
      };
    case CharacterClass.SHADOW_ASSASSIN:
      return {
        name: "SHADOW-FANG / DUAL PHASE DAGGERS",
        tag: "COVERT INFILTRATION GEAR",
        damage: 94,
        accuracy: 82,
        speed: 98,
      };
    case CharacterClass.QUANTUM_SCHOLAR:
      return {
        name: "CHRONO-CODEX // AN-NAHDLIYAH",
        tag: "ANCIENT WISDOM & LORE DISK",
        damage: 80,
        accuracy: 94,
        speed: 82,
      };
    case CharacterClass.MECHA_PALADIN:
      return {
        name: "AEGIS TITANIC DEFENDER SHIELD",
        tag: "HEAVY EXO-ARMOR SUITE",
        damage: 86,
        accuracy: 74,
        speed: 65,
      };
    case CharacterClass.RUNIC_ENGINEER:
      return {
        name: "ARC-FUSION RUNIC WRENCH MK-II",
        tag: "CIRCUIT OVERCLOCK TOOL",
        damage: 82,
        accuracy: 86,
        speed: 88,
      };
    case CharacterClass.CYBER_KNIGHT:
    default:
      return {
        name: "XR-2 / GOLD CAMOUFLAGE PLASMA BLADE",
        tag: "SPECIAL ISSUE // UNU YOGYAKARTA",
        damage: 88,
        accuracy: 78,
        speed: 72,
      };
  }
});

// Dynamic Loadout Slots per Category
const currentSlots = computed(() => {
  if (activeCategory.value === "markings") {
    return [
      { label: "Visage", icon: "✨", item: "Nano Tattoo Line", desc: "Sirkuit nano bercahaya biru di pelipis kanan petualang." },
      { label: "Chest Sigil", icon: "🛡️", item: "Logo Bintang Sembilan", desc: "Lambang kehormatan Nahdliyin yang memancarkan aura emas." },
      { label: "Aura", icon: "🌟", item: evolutionInfo.value.auraName || "Neon Shield", desc: "Pancaran energi resonansi tier evolusi petualang." },
    ];
  } else if (activeCategory.value === "outfits") {
    return [
      { label: "Torso Suit", icon: "🦺", item: "Tactical Kevlar UNU", desc: "Rompi taktis tahan cuaca dengan serat kevlar grade militer." },
      { label: "Cloak", icon: "🧣", item: "Digital Camo Poncho", desc: "Mantel pelindung debu dan kamuflase sensor termal." },
      { label: "Exosuit", icon: "🦾", item: "Ksatria Core Gen-2", desc: "Rangka exoskeleton penguat daya jelajah 9 lantai kampus." },
    ];
  } else {
    return [
      { label: "Headwear", icon: "🪖", item: "Cyber Visor Tactical", desc: "Helm dengan HUD pintar untuk analisis navigasi kampus." },
      { label: "Tactical Rig", icon: "🦺", item: "Vanguard Battle Vest", desc: "Pelindung dada dengan slot penyimpanan modul data." },
      { label: "Gauntlets", icon: "🧤", item: "Pulse Shock Gauntlets", desc: "Sarung tangan dengan motor elektrik penambah kecepatan." },
      { label: "Legs", icon: "👖", item: "Ripstop Cargo Camo", desc: "Celana kargo taktis tahan air dengan serat komposit ringan." },
      { label: "Boots", icon: "🥾", item: "Magnetic Combat Boots", desc: "Sepatu sol magnetik untuk stabilitas pijakan di berbagai lantai." },
      { label: "Sidearm", icon: "🔫", item: equippedWeapon.value.name, desc: equippedWeapon.value.tag },
    ];
  }
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
  if (!participant.value) return;
  try {
    const res = await api.put(`/api/users/${participant.value.id}`, {
      characterTitle: title,
    });
    if (res.data?.success) {
      participant.value.characterTitle = title;
    }
  } catch (e: any) {
    console.error("Failed to update active title:", e);
  }
}

// Open Award Title Modal
function openAwardTitleModal() {
  awardForm.value.title = TITLE_CATALOG[0]?.title || "Novice Adventurer";
  awardForm.value.customTitle = "";
  awardForm.value.upgradeTier = undefined;
  showAwardModal.value = true;
}

// Submit Award Title
async function submitAwardTitle() {
  if (!participant.value) return;
  const titleToAward = awardForm.value.customTitle.trim() || awardForm.value.title;
  if (!titleToAward) return;

  saving.value = true;
  try {
    const res: any = await api.post(`/api/users/${participant.value.id}/award-title`, {
      title: titleToAward,
      upgradeTier: awardForm.value.upgradeTier,
    });
    if (res?.success || res?.data?.success || res?.id) {
      showAwardModal.value = false;
      await fetchParticipantDetail();
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
