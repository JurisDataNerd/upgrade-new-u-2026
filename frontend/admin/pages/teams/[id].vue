<template>
  <div class="p-4 md:p-6 space-y-4 font-mono text-gray-200 select-none pb-12 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <NuxtLink
        to="/teams"
        class="pixel-btn h-8 px-3 bg-[#1c1611] border border-[#523e2b] text-[#f59e0b] hover:bg-[#2e2116] hover:border-[#f59e0b] text-xs font-pixel flex items-center gap-1.5 transition-all shadow-sm"
        title="Kembali ke Daftar Tim"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">KEMBALI</span>
      </NuxtLink>

      <button
        @click="openAssignMemberModal"
        class="pixel-btn h-8 px-3 bg-[#0284c7]/20 border border-[#38bdf8] text-[#38bdf8] hover:bg-[#0284c7]/40 text-xs font-pixel flex items-center gap-1.5 transition-all"
        title="Tambah Anggota"
      >
        <UserPlus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">+ ANGGOTA</span>
      </button>

      <button
        @click="openAssignBuddyModal"
        class="pixel-btn h-8 px-3 bg-[#ca8a04]/20 border border-[#f59e0b] text-[#facc15] hover:bg-[#ca8a04]/40 text-xs font-pixel flex items-center gap-1.5 transition-all"
        title="Tugaskan Buddy"
      >
        <Shield class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">BUDDY</span>
      </button>

      <button
        @click="openSubmitCaptainModal"
        class="pixel-btn h-8 px-3 bg-[#facc15]/20 border border-[#facc15] text-[#facc15] hover:bg-[#facc15]/40 text-xs font-pixel flex items-center gap-1.5 transition-all shadow-sm"
        title="Tetapkan Ketua Tim"
      >
        <Crown class="h-3.5 w-3.5 text-amber-400" />
        <span class="hidden sm:inline">KETUA TIM</span>
      </button>

      <button
        @click="fetchTeamDetail"
        :disabled="loading"
        class="pixel-btn h-8 w-8 bg-[#1c1611] border border-[#523e2b] text-gray-300 hover:text-white hover:border-gray-500 text-xs flex items-center justify-center transition-all"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Top Breadcrumb & Navigation Bar -->
    <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono border-b border-[#4a3624]/60 pb-2">
      <NuxtLink to="/teams" class="text-gray-400 hover:text-[#f59e0b]">TIM PETUALANG</NuxtLink>
      <span>/</span>
      <span class="text-[#f59e0b] font-bold uppercase truncate max-w-[200px] sm:max-w-md">
        {{ team?.name || 'DETAIL TIM' }} ({{ team?.code || '...' }})
      </span>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="loading && !team" class="py-24 flex flex-col items-center justify-center space-y-4">
      <RotateCw class="h-10 w-10 text-[#f59e0b] animate-spin" />
      <div class="font-pixel text-sm text-[#f59e0b] tracking-wider animate-pulse">
        MENGHUBUNGKAN KE MAINFRAME SQUAD TIM...
      </div>
    </div>

    <!-- 404 / Error State -->
    <div v-else-if="!team" class="py-16 text-center space-y-3 bg-[#141822]/60 border border-red-500/30 rounded-lg p-6">
      <AlertTriangle class="h-12 w-12 text-red-400 mx-auto" />
      <h2 class="font-pixel text-base text-red-400">DATA TIM TIDAK DITEMUKAN</h2>
      <p class="text-xs text-gray-400">ID tim tidak valid atau telah dihapus.</p>
      <NuxtLink
        to="/teams"
        class="inline-flex h-8 px-4 items-center gap-2 rounded bg-[#f59e0b] text-black font-pixel text-xs font-bold"
      >
        KEMBALI KE DAFTAR TIM
      </NuxtLink>
    </div>

    <!-- MAIN TACTICAL TEAM SQUAD DASHBOARD CONTENT -->
    <div v-else class="space-y-4">

      <!-- TOP COMMAND HUD CARD -->
      <div class="relative overflow-hidden rounded-xl border-2 border-[#523e2b] bg-gradient-to-r from-[#121620] via-[#0e1118] to-[#18130e] p-4 sm:p-5 shadow-2xl">
        <!-- Ambient HUD Glow -->
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f59e0b]/10 blur-3xl pointer-events-none" />
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <!-- Team Identity Left Section -->
          <div class="flex items-start sm:items-center gap-3.5">
            <!-- Team Emblem Box -->
            <div class="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-[#ca8a04]/30 to-[#1e1712] border-2 border-[#f59e0b] flex flex-col items-center justify-center font-pixel shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
              <Shield class="h-7 w-7 text-[#facc15]" />
              <span class="text-[8px] text-amber-300 font-bold uppercase mt-0.5 tracking-wider">{{ team.code }}</span>
            </div>

            <!-- Identity Info -->
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-pixel text-[#facc15] uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded border border-[#ca8a04]/50">
                  KODE: {{ team.code }}
                </span>
                <span class="px-2 py-0.5 bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40 text-[10px] rounded font-pixel font-bold">
                  {{ participantsList.length }} PETUALANG
                </span>
                <span :class="[
                  'px-2 py-0.5 text-[10px] rounded font-pixel font-bold border flex items-center gap-1',
                  buddiesList.length > 0
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                    : 'bg-red-500/15 text-red-400 border-red-500/40'
                ]">
                  <Shield class="h-3 w-3" />
                  <span>{{ buddiesList.length }} BUDDY PENDAMPING</span>
                </span>
                <span :class="[
                  'px-2 py-0.5 text-[10px] rounded font-bold border',
                  team.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    : 'bg-red-500/15 text-red-400 border-red-500/40'
                ]">
                  {{ team.status === 'ACTIVE' ? 'STATUS: AKTIF' : 'STATUS: NONAKTIF' }}
                </span>
              </div>

              <h1 class="text-lg sm:text-2xl font-bold text-white tracking-wide uppercase font-pixel flex items-center gap-2.5">
                <span>{{ team.name }}</span>
              </h1>

              <!-- Assigned Route Banner -->
              <div class="flex items-center gap-2 text-xs text-gray-300 pt-0.5">
                <span class="text-gray-400">Alokasi Rute:</span>
                <span v-if="team.routeName" class="inline-flex items-center gap-1.5 font-bold text-[#facc15] bg-[#2a1e14] px-2.5 py-0.5 rounded border border-[#ca8a04]/50">
                  <Route class="h-3 w-3 text-[#f59e0b]" />
                  <span>{{ team.routeName }}</span>
                </span>
                <span v-else class="text-amber-500/80 italic text-[11px]">
                  [Belum Ditugaskan Rute Pos 9 Lantai]
                </span>
              </div>
            </div>
          </div>

          <!-- Total Score & Squad Rating Right Section -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-4 bg-black/50 p-3 rounded-lg border border-[#2b251d]">
            <div class="text-center px-2 sm:px-3 border-r border-[#2b251d]">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">TOTAL POIN SQUAD</div>
              <div class="text-base sm:text-2xl font-bold text-amber-400 font-pixel flex items-center justify-center gap-1">
                <span>⭐</span>
                <span>{{ (team.totalScore || 0).toLocaleString() }}</span>
              </div>
              <div class="text-[8px] text-emerald-400 font-bold">AKUMULASI LIVE</div>
            </div>

            <div class="text-center px-2 sm:px-3 border-r border-[#2b251d]">
              <div class="text-[9px] text-gray-400 font-pixel uppercase">SINERGI SQUAD</div>
              <div class="text-base sm:text-xl font-bold text-[#38bdf8] font-pixel">
                {{ squadSynergyScore }} OVR
              </div>
              <div class="text-[9px] text-gray-400">{{ (allMembers.length || 0) }} Personel</div>
            </div>

            <div class="text-center px-2 sm:px-3">
              <div class="text-[9px] text-amber-400 font-pixel uppercase flex items-center justify-center gap-1">
                <Crown class="h-2.5 w-2.5 text-amber-400" />
                <span>KETUA TIM</span>
              </div>
              <div class="text-xs sm:text-sm font-bold text-white font-pixel truncate max-w-[130px]">
                {{ teamCaptain ? teamCaptain.fullName : 'Belum Ada' }}
              </div>
              <div class="text-[9px] text-gray-400">
                {{ teamCaptain ? '@' + teamCaptain.username : 'Perlu Ditetapkan' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SQUAD BATTLE FORMATION STAGE (HOLOGRAPHIC ARENA CANVAS) -->
      <div class="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#131722] via-[#090b10] to-[#040508] border-2 border-[#2c3345] p-4 sm:p-6 shadow-2xl">
        <!-- Ambient Grid & Stage Lights -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-[#f59e0b]/15 to-transparent blur-2xl pointer-events-none" />

        <!-- Stage Title Header -->
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#232936] pb-3">
          <div class="flex items-center gap-2.5">
            <Users class="h-4 w-4 text-[#f59e0b]" />
            <h2 class="font-pixel text-xs sm:text-sm font-bold text-white tracking-wider">
              SQUAD FORMATION & LINE-UP HERO TIM ({{ allMembers.length }} PERSONEL)
            </h2>
          </div>

          <div class="flex items-center gap-3 text-xs">
            <span class="flex items-center gap-1.5 text-amber-400 text-[10px] font-pixel font-bold">
              <Crown class="h-3 w-3" />
              <span>KETUA TIM (MAHASISWA)</span>
            </span>
            <span class="flex items-center gap-1.5 text-[#38bdf8] text-[10px] font-pixel font-bold">
              <Shield class="h-3 w-3" />
              <span>BUDDY (PENDAMPING)</span>
            </span>
          </div>
        </div>

        <!-- Squad Characters Showcase Container -->
        <div v-if="allMembers.length > 0" class="relative z-10 py-6">
          
          <!-- BUDDY COMPANION ROW (ACCOMPANYING GUIDE STATION) -->
          <div v-if="buddiesList.length > 0" class="mb-6 space-y-2">
            <div class="flex items-center justify-center gap-2">
              <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#0284c7]" />
              <span class="text-[10px] font-pixel text-[#38bdf8] tracking-widest uppercase flex items-center gap-1.5">
                <Shield class="h-3.5 w-3.5 text-cyan-400" />
                <span>PENDAMPING TIM (BUDDY GUIDE & MENTOR)</span>
              </span>
              <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#0284c7]" />
            </div>

            <!-- Buddy Heroes Lineup -->
            <div class="flex flex-wrap items-end justify-center gap-4 sm:gap-6 pt-2">
              <div
                v-for="(buddy, bIdx) in buddiesList"
                :key="buddy.userId"
                @click="selectedMember = buddy"
                :class="[
                  'relative flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer group select-none min-w-[150px] sm:min-w-[170px]',
                  selectedMember?.userId === buddy.userId
                    ? 'bg-[#0284c7]/20 border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.45)] scale-105'
                    : 'bg-[#151924]/80 border-[#0284c7]/40 hover:border-[#38bdf8] hover:bg-[#1a2030]'
                ]"
              >
                <!-- Companion Badge -->
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-pixel text-[9px] font-bold flex items-center gap-1 shadow-lg shrink-0 whitespace-nowrap">
                  <Shield class="h-2.5 w-2.5 fill-white" />
                  <span>{{ buddy.buddyRole === 'PRIMARY' ? 'BUDDY UTAMA' : 'CO-BUDDY' }}</span>
                </div>

                <!-- Buddy SVG Avatar Figure (Gold Highlighted) -->
                <div class="relative mt-2 mb-1">
                  <!-- Glowing Aura Ring -->
                  <div class="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-pulse" />
                  <svg width="90" height="115" viewBox="0 0 180 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                    <!-- Head / Visor -->
                    <path d="M70 45 C70 25, 110 25, 110 45 L110 65 C110 75, 70 75, 70 65 Z" fill="#201a14" stroke="#f59e0b" stroke-width="3" />
                    <!-- Crown atop head -->
                    <polygon points="75,30 83,18 90,26 97,18 105,30" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
                    <rect x="74" y="44" width="32" height="10" rx="3" fill="#facc15" class="animate-pulse" />

                    <!-- Torso with Gold Commander Plate -->
                    <path d="M62 70 L118 70 L112 135 L68 135 Z" fill="#2d2218" stroke="#f59e0b" stroke-width="3" />
                    <line x1="72" y1="85" x2="108" y2="85" stroke="#facc15" stroke-width="2.5" />
                    <line x1="75" y1="100" x2="105" y2="100" stroke="#facc15" stroke-width="2.5" />

                    <!-- Arms & Staff -->
                    <path d="M62 72 L45 110 L52 114 L68 80 Z" fill="#201a14" stroke="#f59e0b" stroke-width="2" />
                    <path d="M118 72 L135 110 L128 114 L112 80 Z" fill="#201a14" stroke="#f59e0b" stroke-width="2" />

                    <!-- Commander Scepter / Weapon -->
                    <line x1="130" y1="50" x2="130" y2="190" stroke="#facc15" stroke-width="4" stroke-linecap="round" />
                    <circle cx="130" cy="48" r="8" fill="#ca8a04" stroke="#facc15" stroke-width="2" />

                    <!-- Legs -->
                    <path d="M72 135 L68 205 L82 205 L84 135 Z" fill="#18130e" stroke="#f59e0b" stroke-width="2.5" />
                    <path d="M96 135 L98 205 L112 205 L108 135 Z" fill="#18130e" stroke="#f59e0b" stroke-width="2.5" />
                    <rect x="64" y="200" width="20" height="10" rx="2" fill="#201a14" stroke="#f59e0b" stroke-width="2" />
                    <rect x="96" y="200" width="20" height="10" rx="2" fill="#201a14" stroke="#f59e0b" stroke-width="2" />
                  </svg>

                  <!-- Gold Pedestal Base -->
                  <div class="w-24 h-4 rounded-[100%] bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent border-t border-[#facc15]" />
                </div>

                <!-- Info Banner -->
                <div class="text-center space-y-0.5 w-full mt-1">
                  <div class="font-pixel text-[11px] font-bold text-white group-hover:text-[#facc15] truncate w-full">
                    {{ buddy.fullName }}
                  </div>
                  <div class="text-[9px] text-[#facc15] font-mono">@{{ buddy.username }}</div>
                  <div class="text-[9px] text-amber-300/80 font-pixel">
                    [{{ buddy.characterTitle || 'Pilar Regu Sejati' }}]
                  </div>
                  <div class="pt-1 flex items-center justify-center gap-1.5">
                    <span class="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[8px] font-bold rounded border border-amber-500/40">
                      TIER {{ buddy.characterTier || 2 }}
                    </span>
                    <NuxtLink
                      :to="'/participants/' + buddy.userId"
                      class="text-[8px] text-[#38bdf8] hover:underline font-bold"
                      @click.stop
                    >
                      Profil ↗
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PARTICIPANTS MEMBERS SQUAD FORMATION -->
          <div class="space-y-2">
            <div class="flex items-center justify-center gap-2">
              <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#38bdf8]" />
              <span class="text-[10px] font-pixel text-[#38bdf8] tracking-widest uppercase flex items-center gap-1.5">
                <Shield class="h-3.5 w-3.5 text-cyan-400" />
                <span>BARISAN PETUALANG SQUAD (DIPIMPIN OLEH KETUA TIM)</span>
              </span>
              <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#38bdf8]" />
            </div>

            <div v-if="participantsList.length > 0" class="flex flex-wrap items-end justify-center gap-3 sm:gap-4 pt-2">
              <div
                v-for="(member, mIdx) in participantsList"
                :key="member.userId"
                @click="selectedMember = member"
                :class="[
                  'relative flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer group select-none min-w-[135px] sm:min-w-[155px]',
                  selectedMember?.userId === member.userId
                    ? 'bg-[#38bdf8]/15 border-[#38bdf8] shadow-[0_0_18px_rgba(56,189,248,0.4)] scale-105'
                    : (member.isCaptain || member.userId === team?.captainId)
                      ? 'bg-[#ca8a04]/15 border-[#f59e0b] shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                      : 'bg-[#0f131c]/90 border-[#242b3b] hover:border-gray-400 hover:bg-[#161c28]'
                ]"
              >
                <!-- Captain Golden Crown Badge -->
                <div
                  v-if="member.isCaptain || member.userId === team?.captainId"
                  class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-pixel text-[9px] font-extrabold flex items-center gap-1 shadow-lg shrink-0 whitespace-nowrap z-20"
                >
                  <Crown class="h-2.5 w-2.5 fill-black" />
                  <span>👑 KETUA TIM</span>
                </div>

                <!-- Member RPG Figure -->
                <div class="relative my-1">
                  <!-- Glow according to class color or gold if captain -->
                  <div
                    class="absolute inset-0 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity"
                    :style="{ backgroundColor: (member.isCaptain || member.userId === team?.captainId) ? '#f59e0b' : getMemberClassColor(member.characterClass) }"
                  />

                  <svg width="75" height="100" viewBox="0 0 180 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                    <!-- Head / Visor -->
                    <path
                      d="M70 45 C70 25, 110 25, 110 45 L110 65 C110 75, 70 75, 70 65 Z"
                      fill="#181d28"
                      :stroke="(member.isCaptain || member.userId === team?.captainId) ? '#f59e0b' : getMemberClassColor(member.characterClass)"
                      :stroke-width="(member.isCaptain || member.userId === team?.captainId) ? 3 : 2.5"
                    />
                    <!-- Crown atop head if Captain -->
                    <polygon
                      v-if="member.isCaptain || member.userId === team?.captainId"
                      points="75,30 83,18 90,26 97,18 105,30"
                      fill="#facc15"
                      stroke="#ca8a04"
                      stroke-width="1.5"
                    />
                    <rect x="74" y="42" width="32" height="10" rx="3" :fill="(member.isCaptain || member.userId === team?.captainId) ? '#facc15' : '#38bdf8'" />

                    <!-- Torso -->
                    <path
                      d="M62 70 L118 70 L112 135 L68 135 Z"
                      fill="#141822"
                      :stroke="(member.isCaptain || member.userId === team?.captainId) ? '#f59e0b' : getMemberClassColor(member.characterClass)"
                      :stroke-width="(member.isCaptain || member.userId === team?.captainId) ? 3 : 2.5"
                    />
                    <line x1="72" y1="85" x2="108" y2="85" :stroke="getMemberClassColor(member.characterClass)" stroke-width="2" />

                    <!-- Arms & Weapon -->
                    <path d="M62 72 L45 110 L52 114 L68 80 Z" fill="#181d28" :stroke="getMemberClassColor(member.characterClass)" stroke-width="2" />
                    <path d="M118 72 L135 110 L128 114 L112 80 Z" fill="#181d28" :stroke="getMemberClassColor(member.characterClass)" stroke-width="2" />
                    <line x1="40" y1="130" x2="140" y2="90" :stroke="getMemberClassColor(member.characterClass)" stroke-width="6" stroke-linecap="round" />

                    <!-- Legs -->
                    <path d="M72 135 L68 205 L82 205 L84 135 Z" fill="#11141c" :stroke="getMemberClassColor(member.characterClass)" stroke-width="2" />
                    <path d="M96 135 L98 205 L112 205 L108 135 Z" fill="#11141c" :stroke="getMemberClassColor(member.characterClass)" stroke-width="2" />
                    <rect x="64" y="200" width="20" height="10" rx="2" fill="#181d28" stroke="#38bdf8" stroke-width="1.5" />
                    <rect x="96" y="200" width="20" height="10" rx="2" fill="#181d28" stroke="#38bdf8" stroke-width="1.5" />
                  </svg>

                  <!-- Pedestal Base -->
                  <div
                    class="w-20 h-3.5 rounded-[100%] bg-gradient-to-r from-transparent to-transparent border-t opacity-70"
                    :style="{ borderTopColor: (member.isCaptain || member.userId === team?.captainId) ? '#f59e0b' : getMemberClassColor(member.characterClass), background: `radial-gradient(ellipse at center, ${getMemberClassColor(member.characterClass)}44 0%, transparent 70%)` }"
                  />
                </div>

                <!-- Member Info -->
                <div class="text-center space-y-0.5 w-full mt-1">
                  <div class="font-pixel text-[10px] font-bold text-white group-hover:text-[#38bdf8] truncate w-full flex items-center justify-center gap-1">
                    <Crown v-if="member.isCaptain || member.userId === team?.captainId" class="h-2.5 w-2.5 text-amber-400 shrink-0" />
                    <span>{{ member.fullName }}</span>
                  </div>
                  <div class="text-[9px] text-gray-400 font-mono">@{{ member.username }}</div>
                  <div class="text-[9px] text-[#facc15] font-pixel truncate w-full">
                    {{ member.characterClass || 'CYBER_KNIGHT' }}
                  </div>

                  <div class="pt-1 flex items-center justify-center gap-1.5 text-[8px]">
                    <span class="font-bold text-emerald-400">⭐ {{ (member.totalScore || 0) }} pts</span>
                    <NuxtLink
                      :to="'/participants/' + member.userId"
                      class="text-[#38bdf8] hover:underline font-bold"
                      @click.stop
                    >
                      Detail ↗
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="py-8 text-center text-xs text-gray-500 border border-dashed border-[#232936] rounded-lg">
              Belum ada anggota petualang yang di-plotting ke dalam tim ini.
            </div>
          </div>
        </div>

        <div v-else class="py-12 text-center text-xs text-gray-500 border border-dashed border-[#232936] rounded-lg">
          Squad tim ini belum memiliki anggota maupun buddy pendamping.
        </div>
      </div>

      <!-- 2-COLUMN BOTTOM DETAILS: ROSTER TABLE & TEAM RADAR -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- LEFT 7 COLS: FULL ROSTER MANAGEMENT TABLE -->
        <div class="lg:col-span-7 rounded-xl border border-[#2b251d] bg-[#0d0f14] p-4 space-y-3 shadow-xl">
          <div class="flex items-center justify-between border-b border-[#232936] pb-3">
            <div>
              <h3 class="font-pixel text-xs sm:text-sm font-bold text-[#f59e0b] tracking-wider flex items-center gap-2">
                <Users class="h-4 w-4" />
                <span>DAFTAR PERSONEL SQUAD LENGKAP</span>
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">Kelola keanggotaan dan submit peran Ketua Tim.</p>
            </div>

            <span class="text-xs bg-[#1a1714] border border-[#523e2b] px-3 py-1 rounded text-gray-300">
              Total: <strong class="text-white">{{ allMembers.length }}</strong>
            </span>
          </div>

          <div v-if="allMembers.length > 0" class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="border-b border-[#232936] bg-[#141822] text-[10px] font-pixel text-gray-400">
                  <th class="py-2.5 px-3">PERSONEL</th>
                  <th class="py-2.5 px-3">PERAN / STATUS</th>
                  <th class="py-2.5 px-3">KELAS & TIER</th>
                  <th class="py-2.5 px-3 text-center">SKOR</th>
                  <th class="py-2.5 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1e2330]">
                <tr
                  v-for="m in allMembers"
                  :key="m.userId"
                  :class="[
                    'hover:bg-[#141824] transition-colors',
                    (m.isCaptain || m.userId === team?.captainId) ? 'bg-[#ca8a04]/10' : m.role === 'BUDDY' ? 'bg-[#0284c7]/5' : ''
                  ]"
                >
                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div
                        class="h-7 w-7 rounded border flex items-center justify-center font-pixel text-[10px]"
                        :style="{
                          borderColor: (m.isCaptain || m.userId === team?.captainId) ? '#f59e0b' : m.role === 'BUDDY' ? '#38bdf8' : '#64748b',
                          color: (m.isCaptain || m.userId === team?.captainId) ? '#facc15' : m.role === 'BUDDY' ? '#38bdf8' : '#94a3b8',
                          background: '#151922'
                        }"
                      >
                        {{ (m.isCaptain || m.userId === team?.captainId) ? '👑' : m.role === 'BUDDY' ? '🛡️' : '⚔️' }}
                      </div>
                      <div>
                        <div class="font-bold text-white flex items-center gap-1.5">
                          <span>{{ m.fullName }}</span>
                          <span v-if="m.isCaptain || m.userId === team?.captainId" class="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-1.5 py-0.5 rounded font-pixel font-bold flex items-center gap-0.5">
                            <Crown class="h-2 w-2 fill-black" />
                            <span>KETUA</span>
                          </span>
                          <span v-else-if="m.role === 'BUDDY'" class="text-[8px] bg-[#0284c7] text-white px-1.5 py-0.5 rounded font-pixel font-bold">
                            {{ m.buddyRole || 'PENDAMPING' }}
                          </span>
                        </div>
                        <div class="text-[10px] text-gray-400">@{{ m.username }}</div>
                      </div>
                    </div>
                  </td>

                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-0.5 rounded text-[9px] font-pixel font-bold border flex items-center gap-1 w-fit',
                      m.role === 'BUDDY'
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40'
                        : (m.isCaptain || m.userId === team?.captainId)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                    ]">
                      <Crown v-if="m.isCaptain || m.userId === team?.captainId" class="h-2.5 w-2.5 text-amber-400" />
                      <Shield v-else-if="m.role === 'BUDDY'" class="h-2.5 w-2.5 text-cyan-400" />
                      <span>{{ m.role === 'BUDDY' ? 'BUDDY PENDAMPING' : (m.isCaptain || m.userId === team?.captainId ? '👑 KETUA TIM' : 'PETUALANG') }}</span>
                    </span>
                  </td>

                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <div class="space-y-0.5">
                      <div class="text-[#facc15] font-pixel text-[10px]">{{ m.characterClass || 'CYBER_KNIGHT' }}</div>
                      <div class="text-[9px] text-gray-400">Tier {{ m.characterTier || 1 }} · [{{ m.characterTitle || 'Novice' }}]</div>
                    </div>
                  </td>

                  <td class="py-2.5 px-3 text-center whitespace-nowrap font-pixel font-bold text-emerald-400">
                    {{ (m.totalScore || 0).toLocaleString() }} pts
                  </td>

                  <td class="py-2.5 px-3 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      <!-- Action to Submit/Promote to Team Captain (Participants only) -->
                      <button
                        v-if="m.role === 'PARTICIPANT'"
                        @click="setCaptain(m.isCaptain || m.userId === team?.captainId ? null : m.userId)"
                        :class="[
                          'h-7 px-2 border flex items-center gap-1 rounded text-[10px] font-pixel transition-all',
                          (m.isCaptain || m.userId === team?.captainId)
                            ? 'border-amber-500/60 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            : 'border-[#523e2b] bg-[#1a1714] text-gray-400 hover:text-amber-400 hover:border-amber-500/50'
                        ]"
                        :title="(m.isCaptain || m.userId === team?.captainId) ? 'Hapus status ketua tim' : 'Jadikan Ketua Tim'"
                      >
                        <Crown class="h-3 w-3 text-amber-400" />
                        <span>{{ (m.isCaptain || m.userId === team?.captainId) ? 'KETUA AKTIF' : 'JADIKAN KETUA' }}</span>
                      </button>

                      <NuxtLink
                        :to="'/participants/' + m.userId"
                        class="h-7 px-2 border border-[#523e2b] bg-[#1a1714] text-[#38bdf8] hover:border-[#0284c7] flex items-center gap-1 rounded text-[10px] font-pixel"
                        title="Lihat Dashboard RPG Petualang"
                      >
                        <Eye class="h-3 w-3" />
                        <span>DETAIL</span>
                      </NuxtLink>

                      <button
                        @click="removeMemberFromTeam(m)"
                        class="h-7 w-7 border border-[#523e2b] bg-[#1a1714] text-red-400 hover:border-red-500 flex items-center justify-center rounded text-[10px]"
                        title="Keluarkan dari Tim"
                      >
                        <Trash2 class="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="py-8 text-center text-xs text-gray-500 border border-dashed border-[#232936] rounded-lg">
            Belum ada anggota dalam tabel ini.
          </div>
        </div>

        <!-- RIGHT 5 COLS: TEAM SYNERGY RADAR & SCORE HISTORY -->
        <div class="lg:col-span-5 space-y-4">
          
          <!-- Squad Synergy Radar Card -->
          <div class="rounded-xl border border-[#2b251d] bg-[#0d0f14] p-4 space-y-3 shadow-xl">
            <div class="flex items-center justify-between border-b border-[#232936] pb-2">
              <h3 class="font-pixel text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                <Crosshair class="h-3.5 w-3.5 text-[#f59e0b]" />
                <span>KOMPOSISI & SINERGI TIM</span>
              </h3>
              <span class="text-xs font-pixel text-[#facc15] font-bold">{{ squadSynergyScore }} OVR</span>
            </div>

            <!-- Hexagon Radar for Combined Squad -->
            <div class="relative aspect-square w-full max-w-[190px] mx-auto flex items-center justify-center p-2">
              <svg viewBox="0 0 200 200" class="w-full h-full">
                <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="#262c3a" stroke-width="1.5" />
                <polygon points="100,45 150,73 150,127 100,155 50,127 50,73" fill="none" stroke="#1d232e" stroke-width="1" />
                <polygon points="100,70 130,86 130,114 100,130 70,114 70,86" fill="none" stroke="#1d232e" stroke-width="1" />

                <line x1="100" y1="20" x2="100" y2="180" stroke="#1d232e" stroke-width="1" />
                <line x1="30" y1="60" x2="170" y2="140" stroke="#1d232e" stroke-width="1" />
                <line x1="30" y1="140" x2="170" y2="60" stroke="#1d232e" stroke-width="1" />

                <!-- Dynamic Team Polygon -->
                <polygon
                  :points="teamRadarPoints"
                  fill="#0284c7"
                  fill-opacity="0.45"
                  stroke="#38bdf8"
                  stroke-width="2"
                  class="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all duration-500"
                />

                <text x="100" y="14" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">
                  ATK {{ teamStats.atk }}
                </text>
                <text x="175" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="start">
                  TAC {{ teamStats.tac }}
                </text>
                <text x="175" y="145" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="start">
                  SPD {{ teamStats.spd }}
                </text>
                <text x="100" y="196" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">
                  DEF {{ teamStats.def }}
                </text>
                <text x="25" y="145" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="end">
                  ACC {{ teamStats.acc }}
                </text>
                <text x="25" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="end">
                  SYN {{ teamStats.syn }}
                </text>
              </svg>
            </div>

            <!-- Class Distribution Breakdown -->
            <div class="space-y-1.5 pt-1 text-[10px]">
              <div class="text-gray-400 font-pixel text-[9px] uppercase">DISTRIBUSI KELAS SQUAD:</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(count, cls) in classDistribution"
                  :key="cls"
                  class="px-2 py-0.5 bg-[#151924] border border-[#2b3345] rounded text-gray-300 font-mono text-[9px] flex items-center gap-1"
                >
                  <span :style="{ color: getMemberClassColor(String(cls)) }">●</span>
                  <span>{{ cls }}: <strong>{{ count }}</strong></span>
                </span>
              </div>
            </div>
          </div>

          <!-- Team Score History Log Card -->
          <div class="rounded-xl border border-[#2b251d] bg-[#0d0f14] p-4 space-y-3 shadow-xl">
            <div class="flex items-center justify-between border-b border-[#232936] pb-2">
              <h3 class="font-pixel text-xs font-bold text-[#f59e0b] tracking-wider flex items-center gap-1.5">
                <History class="h-3.5 w-3.5" />
                <span>LOG TRANSAKSI SKOR TIM</span>
              </h3>
              <span class="text-[10px] text-gray-400 font-mono">{{ (team.scoreHistory || []).length }} Transaksi</span>
            </div>

            <div v-if="(team.scoreHistory || []).length > 0" class="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 text-xs">
              <div
                v-for="tx in team.scoreHistory"
                :key="tx.id"
                class="p-2 bg-[#141822] border border-[#232936] rounded flex items-center justify-between text-[11px]"
              >
                <div>
                  <div class="font-bold text-gray-200">{{ tx.reason || tx.description || 'Poin Sesi Game' }}</div>
                  <div class="text-[9px] text-gray-500">{{ formatDateTime(tx.createdAt) }}</div>
                </div>
                <div class="font-pixel font-bold text-right" :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'">
                  {{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount }} PTS
                </div>
              </div>
            </div>

            <div v-else class="py-6 text-center text-[10px] text-gray-500 italic">
              Belum ada riwayat transaksi poin tim.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: TAMBAH / PLOTTING ANGGOTA PETUALANG KE TIM -->
    <Dialog :open="showAddMemberModal" @update:open="showAddMemberModal = $event">
      <DialogContent class="sm:max-w-[450px] pixel-card border-2 border-[#38bdf8] bg-[#10141d] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center gap-2">
            <UserPlus class="h-4 w-4" />
            <span>TAMBAH PETUALANG KE SQUAD</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-2 text-xs font-mono">
          <p class="text-muted-foreground text-[11px]">
            Pilih petualang (Free Agent) untuk dimasukkan ke dalam tim <strong>{{ team?.name }}</strong>:
          </p>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Peserta:</Label>
            <select
              v-model="selectedUserToAssign"
              class="w-full h-8 px-2 bg-[#181f2c] border border-[#2c374d] text-foreground focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="">-- Pilih Peserta Free Agent --</option>
              <option
                v-for="u in availableParticipants"
                :key="u.id"
                :value="u.id"
              >
                {{ u.fullName }} (@{{ u.username }}) — {{ u.characterClass || 'CYBER_KNIGHT' }} (Tier {{ u.characterTier || 1 }})
              </option>
            </select>
          </div>
        </div>

        <DialogFooter class="flex justify-end gap-2 pt-2">
          <button
            class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
            @click="showAddMemberModal = false"
          >
            Batal
          </button>
          <button
            class="h-8 px-4 text-xs font-pixel font-bold bg-[#0284c7] text-white border border-[#38bdf8] hover:bg-[#0369a1]"
            @click="addMemberToTeam"
            :disabled="saving || !selectedUserToAssign"
          >
            {{ saving ? 'MENYIMPAN...' : 'MASUKKAN KE TIM' }}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- MODAL: TUGASKAN BUDDY KE TIM -->
    <Dialog :open="showAssignBuddyModal" @update:open="showAssignBuddyModal = $event">
      <DialogContent class="sm:max-w-[450px] pixel-card border-2 border-[#0284c7] bg-[#0c131d] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center gap-2">
            <Shield class="h-4 w-4" />
            <span>TUGASKAN BUDDY PENDAMPING TIM</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-2 text-xs font-mono">
          <p class="text-muted-foreground text-[11px]">
            Tugaskan Buddy sebagai pendamping/fasilitator navigasi untuk <strong>{{ team?.name }}</strong>:
          </p>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Buddy:</Label>
            <select
              v-model="selectedBuddyToAssign"
              class="w-full h-8 px-2 bg-[#16222f] border border-[#2c3d52] text-foreground focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="">-- Pilih Buddy --</option>
              <option
                v-for="b in availableBuddies"
                :key="b.id"
                :value="b.id"
              >
                {{ b.fullName }} (@{{ b.username }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Peran Pendamping:</Label>
            <select
              v-model="selectedBuddyRole"
              class="w-full h-8 px-2 bg-[#16222f] border border-[#2c3d52] text-foreground focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="PRIMARY">PRIMARY (Buddy Utama)</option>
              <option value="ASSISTANT">ASSISTANT (Co-Buddy)</option>
            </select>
          </div>
        </div>

        <DialogFooter class="flex justify-end gap-2 pt-2">
          <button
            class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
            @click="showAssignBuddyModal = false"
          >
            Batal
          </button>
          <button
            class="h-8 px-4 text-xs font-pixel font-bold bg-[#0284c7] text-white border border-[#38bdf8] hover:bg-[#0369a1]"
            @click="submitAssignBuddy"
            :disabled="saving || !selectedBuddyToAssign"
          >
            {{ saving ? 'MENYIMPAN...' : 'TUGASKAN BUDDY' }}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- MODAL: SUBMIT / TETAPKAN KETUA TIM (MAHASISWA) -->
    <Dialog :open="showSubmitCaptainModal" @update:open="showSubmitCaptainModal = $event">
      <DialogContent class="sm:max-w-[450px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Crown class="h-4 w-4 text-amber-400" />
            <span>SUBMIT / TETAPKAN KETUA TIM</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-2 text-xs font-mono">
          <p class="text-muted-foreground text-[11px]">
            Tunjuk salah satu mahasiswa/peserta di dalam squad <strong>{{ team?.name }}</strong> sebagai <strong>Ketua Tim (Team Captain)</strong>:
          </p>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Ketua Tim dari Mahasiswa:</Label>
            <select
              v-model="selectedCaptainId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="">-- Kosongkan / Tanpa Ketua --</option>
              <option
                v-for="p in participantsList"
                :key="p.userId"
                :value="p.userId"
              >
                {{ p.fullName }} (@{{ p.username }}) — {{ p.characterClass || 'CYBER_KNIGHT' }} (Tier {{ p.characterTier || 1 }})
              </option>
            </select>
          </div>

          <div v-if="teamCaptain" class="p-2 bg-[#2a1d13] border border-[#ca8a04]/40 rounded text-[11px] text-amber-300 flex items-center gap-2">
            <Crown class="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Ketua Tim saat ini: <strong>{{ teamCaptain.fullName }}</strong> (@{{ teamCaptain.username }})</span>
          </div>
        </div>

        <DialogFooter class="flex justify-end gap-2 pt-2">
          <button
            class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
            @click="showSubmitCaptainModal = false"
          >
            Batal
          </button>
          <button
            class="h-8 px-4 text-xs font-pixel font-bold bg-[#ca8a04] text-[#16110d] border border-[#eab308] hover:bg-[#eab308]"
            @click="submitCaptainAssignment"
            :disabled="saving"
          >
            {{ saving ? 'MENYIMPAN...' : 'SIMPAN KETUA TIM' }}
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
  Route,
  UserPlus,
  Crosshair,
  History,
  AlertTriangle,
  Eye,
  Trash2,
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
  CharacterClass,
} from "@genius/types";

const route = useRoute();
const api = useApi();

const teamId = computed(() => String(route.params.id || ""));

const loading = ref(true);
const saving = ref(false);
const team = ref<any>(null);

const allUsers = ref<any[]>([]);
const selectedMember = ref<any>(null);

const showAddMemberModal = ref(false);
const selectedUserToAssign = ref("");

const showAssignBuddyModal = ref(false);
const selectedBuddyToAssign = ref("");
const selectedBuddyRole = ref("PRIMARY");

const showSubmitCaptainModal = ref(false);
const selectedCaptainId = ref("");

// Load Team Data from Backend API
async function fetchTeamDetail() {
  if (!teamId.value) return;
  loading.value = true;
  try {
    const res: any = await api.get(`/api/teams/${teamId.value}`);
    const data = res?.data !== undefined ? res.data : res;
    if (data && (data.id || data.name)) {
      team.value = data;
      if (team.value.members?.length > 0 && !selectedMember.value) {
        selectedMember.value = team.value.members[0];
      }
    } else {
      team.value = null;
    }
  } catch (err: any) {
    console.error("Failed to fetch team detail:", err);
    team.value = null;
  } finally {
    loading.value = false;
  }
}

// Load all users to populate assignment modals
async function fetchAllUsers() {
  try {
    const res: any = await api.get("/api/users?pageSize=200");
    const data = res?.data !== undefined ? res.data : res;
    if (Array.isArray(data)) {
      allUsers.value = data;
    }
  } catch (err) {
    console.error("Failed to fetch users list:", err);
  }
}

onMounted(async () => {
  await Promise.all([fetchTeamDetail(), fetchAllUsers()]);
});

// All Members List
const allMembers = computed(() => {
  return team.value?.members || [];
});

// Team Captain
const teamCaptain = computed(() => {
  return allMembers.value.find((m: any) => m.isCaptain || (team.value?.captainId && m.userId === team.value?.captainId)) || null;
});

// Buddies (Leaders)
const buddiesList = computed(() => {
  return allMembers.value.filter((m: any) => m.role === "BUDDY");
});

// Primary Buddy
const primaryBuddy = computed(() => {
  const primaries = buddiesList.value.filter((b: any) => b.buddyRole === "PRIMARY");
  return primaries.length > 0 ? primaries[0] : buddiesList.value[0] || null;
});

// Participants (Squad Members)
const participantsList = computed(() => {
  return allMembers.value.filter((m: any) => m.role === "PARTICIPANT");
});

// Available Free Agent Participants for Adding
const availableParticipants = computed(() => {
  const currentMemberIds = new Set(allMembers.value.map((m: any) => m.userId));
  return allUsers.value.filter(
    (u: any) => u.role === "PARTICIPANT" && !u.teamId && !currentMemberIds.has(u.id)
  );
});

// Available Buddies
const availableBuddies = computed(() => {
  const currentBuddyIds = new Set(buddiesList.value.map((b: any) => b.userId));
  return allUsers.value.filter(
    (u: any) => u.role === "BUDDY" && !currentBuddyIds.has(u.id)
  );
});

// Class distribution in team
const classDistribution = computed(() => {
  const dist: Record<string, number> = {};
  allMembers.value.forEach((m: any) => {
    const cls = m.characterClass || "CYBER_KNIGHT";
    dist[cls] = (dist[cls] || 0) + 1;
  });
  return dist;
});

// Squad Synergy Score (OVR)
const squadSynergyScore = computed(() => {
  const memberCount = allMembers.value.length;
  if (memberCount === 0) return 60;
  const avgTier = allMembers.value.reduce((acc: number, m: any) => acc + (m.characterTier || 1), 0) / memberCount;
  const buddyBonus = buddiesList.value.length > 0 ? 8 : 0;
  const diversityBonus = Object.keys(classDistribution.value).length * 3;
  return Math.min(99, Math.round(70 + (avgTier * 5) + buddyBonus + diversityBonus));
});

// Combined Team Radar Stats
const teamStats = computed(() => {
  const memberCount = Math.max(1, allMembers.value.length);
  const synergy = squadSynergyScore.value;

  let totalAtk = 0;
  let totalDef = 0;
  let totalTac = 0;
  let totalSpd = 0;
  let totalAcc = 0;

  allMembers.value.forEach((m: any) => {
    const cls = (m.characterClass as CharacterClass) || CharacterClass.CYBER_KNIGHT;
    const base = RPG_CHARACTERS[cls]?.stats || { str: 75, int: 75, agi: 70, vit: 80, wis: 70 };
    const tierMult = m.characterTier === 3 ? 1.4 : m.characterTier === 2 ? 1.2 : 1.0;
    totalAtk += base.str * tierMult;
    totalDef += base.vit * tierMult;
    totalTac += base.int * tierMult;
    totalSpd += base.agi * tierMult;
    totalAcc += base.wis * tierMult;
  });

  return {
    atk: Math.min(99, Math.round(totalAtk / memberCount)),
    def: Math.min(99, Math.round(totalDef / memberCount)),
    tac: Math.min(99, Math.round(totalTac / memberCount)),
    spd: Math.min(99, Math.round(totalSpd / memberCount)),
    acc: Math.min(99, Math.round(totalAcc / memberCount)),
    syn: synergy,
  };
});

// Team Radar Hexagon SVG Coordinates (Center: 100, 100, Max Radius: 75)
const teamRadarPoints = computed(() => {
  const cx = 100;
  const cy = 100;
  const maxR = 75;

  const s = teamStats.value;
  const rAtk = (s.atk / 100) * maxR;
  const rTac = (s.tac / 100) * maxR;
  const rSpd = (s.spd / 100) * maxR;
  const rDef = (s.def / 100) * maxR;
  const rAcc = (s.acc / 100) * maxR;
  const rSyn = (s.syn / 100) * maxR;

  const p1 = `${cx},${cy - rAtk}`;
  const p2 = `${cx + rTac * 0.866},${cy - rTac * 0.5}`;
  const p3 = `${cx + rSpd * 0.866},${cy + rSpd * 0.5}`;
  const p4 = `${cx},${cy + rDef}`;
  const p5 = `${cx - rAcc * 0.866},${cy + rAcc * 0.5}`;
  const p6 = `${cx - rSyn * 0.866},${cy - rSyn * 0.5}`;

  return `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`;
});

// Class Color Helper
function getMemberClassColor(characterClass?: string) {
  const cls = (characterClass as CharacterClass) || CharacterClass.CYBER_KNIGHT;
  return RPG_CHARACTERS[cls]?.color || "#38bdf8";
}

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

// Open Modals
function openAssignMemberModal() {
  selectedUserToAssign.value = "";
  showAddMemberModal.value = true;
}

function openAssignBuddyModal() {
  selectedBuddyToAssign.value = "";
  selectedBuddyRole.value = buddiesList.value.length === 0 ? "PRIMARY" : "ASSISTANT";
  showAssignBuddyModal.value = true;
}

// Add member to team
async function addMemberToTeam() {
  if (!team.value || !selectedUserToAssign.value) return;
  saving.value = true;
  try {
    const res: any = await api.put(`/api/users/${selectedUserToAssign.value}`, {
      teamId: team.value.id,
    });
    if (res?.success || res?.data?.success || res?.id) {
      showAddMemberModal.value = false;
      await Promise.all([fetchTeamDetail(), fetchAllUsers()]);
    }
  } catch (err: any) {
    alert("Gagal menambahkan anggota: " + (err.message || "Error server"));
  } finally {
    saving.value = false;
  }
}

// Submit Assign Buddy
async function submitAssignBuddy() {
  if (!team.value || !selectedBuddyToAssign.value) return;
  saving.value = true;
  try {
    const res: any = await api.post(`/api/users/${selectedBuddyToAssign.value}/assign-buddy`, {
      teamId: team.value.id,
      buddyRole: selectedBuddyRole.value,
    });
    if (res?.success || res?.data?.success || res?.id) {
      showAssignBuddyModal.value = false;
      await Promise.all([fetchTeamDetail(), fetchAllUsers()]);
    }
  } catch (err: any) {
    alert("Gagal menugaskan buddy: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

// Remove member from team
async function removeMemberFromTeam(member: any) {
  if (confirm(`Keluarkan ${member.fullName} (@${member.username}) dari tim ${team.value.name}?`)) {
    try {
      await api.put(`/api/users/${member.userId}`, {
        teamId: null,
      });
      await Promise.all([fetchTeamDetail(), fetchAllUsers()]);
    } catch (err: any) {
      alert("Gagal mengeluarkan anggota: " + err.message);
    }
  }
}

// Open Submit Captain Modal
function openSubmitCaptainModal() {
  selectedCaptainId.value = teamCaptain.value?.userId || team.value?.captainId || "";
  showSubmitCaptainModal.value = true;
}

// Set or Clear Captain directly
async function setCaptain(captainUserId: string | null) {
  if (!team.value) return;
  saving.value = true;
  try {
    const res: any = await api.put(`/api/teams/${team.value.id}`, {
      captainId: captainUserId || null,
    });
    if (res?.success || res?.data?.success || res?.id) {
      await fetchTeamDetail();
    }
  } catch (err: any) {
    alert("Gagal memperbarui ketua tim: " + (err.message || "Error server"));
  } finally {
    saving.value = false;
  }
}

// Submit Captain Assignment Modal
async function submitCaptainAssignment() {
  await setCaptain(selectedCaptainId.value || null);
  showSubmitCaptainModal.value = false;
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
