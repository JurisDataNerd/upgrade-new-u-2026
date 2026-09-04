<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#162518] text-[#4ade80] border-[#16a34a] flex items-center gap-1.5 hover:bg-[#1f3822]"
        @click="showImportModal = true"
        title="Import CSV"
      >
        <Upload class="h-3.5 w-3.5 text-[#4ade80]" />
        <span class="hidden sm:inline">IMPORT CSV</span>
      </button>

      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#271d15] text-[#38bdf8] border-[#0284c7] flex items-center gap-1.5 hover:bg-[#3d2d1e]"
        @click="exportCsv"
        title="Export CSV"
      >
        <Download class="h-3.5 w-3.5 text-[#38bdf8]" />
        <span class="hidden sm:inline">EXPORT</span>
      </button>

      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCreateModal"
        title="Tambah Peserta Baru"
      >
        <UserPlus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">TAMBAH PESERTA</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchParticipants"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Sticky Top Pixel Toolbar (Flush nempel Topbar) -->
    <div class="pixel-toolbar-sticky px-4 md:px-6 py-2.5 space-y-2.5 shrink-0">
      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <!-- View Mode Switcher -->
        <div class="flex items-center gap-1">
          <button
            @click="viewMode = 'table'"
            :class="[
              'h-7 px-2.5 text-xs font-pixel flex items-center gap-1.5 transition-colors border',
              viewMode === 'table'
                ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
                : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
            ]"
          >
            <TableIcon class="h-3 w-3" />
            <span>TABEL</span>
          </button>
          <button
            @click="viewMode = 'grid'"
            :class="[
              'h-7 px-2.5 text-xs font-pixel flex items-center gap-1.5 transition-colors border',
              viewMode === 'grid'
                ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] font-bold'
                : 'bg-[#271d15] border-[#523e2b] text-muted-foreground hover:text-foreground'
            ]"
          >
            <LayoutGrid class="h-3 w-3" />
            <span>KARTU</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari mahasiswa, username, atau gelar..."
            class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            @input="debounceFetch"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Filter Tier Evolusi -->
          <select
            v-model="selectedTierFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchParticipants()"
          >
            <option value="">Semua Tier</option>
            <option value="1">⭐ Tier 1: Novice</option>
            <option value="2">⭐⭐ Tier 2: Advanced</option>
            <option value="3">👑 Tier 3: Ascended</option>
          </select>

          <!-- Filter Gender -->
          <select
            v-model="selectedGenderFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchParticipants()"
          >
            <option value="">Semua Gender</option>
            <option value="MALE">♂ Laki-laki</option>
            <option value="FEMALE">♀ Perempuan</option>
          </select>

          <!-- Filter Character Class -->
          <select
            v-model="selectedClassFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchParticipants()"
          >
            <option value="">Semua Kelas RPG</option>
            <option v-for="cls in characterClassesList" :key="cls.id" :value="cls.id">
              {{ cls.icon }} {{ cls.nameId }}
            </option>
          </select>

          <!-- Filter Team -->
          <select
            v-model="selectedTeamFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchParticipants()"
          >
            <option value="">Semua Tim</option>
            <option value="assigned">Sudah Ber-tim</option>
            <option value="unassigned">Free Agent (Tanpa Tim)</option>
            <option v-for="team in teamsList" :key="team.id" :value="team.id">
              {{ team.name }} ({{ team.code }})
            </option>
          </select>

          <!-- Filter Status -->
          <select
            v-model="selectedStatusFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchParticipants()"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
        </div>
      </div>

      <!-- Batch Actions Bar (Shows when selected) -->
      <div
        v-if="selectedUserIds.length > 0"
        class="flex items-center justify-between gap-2 bg-[#2a1d14] border border-[#ca8a04] px-3 py-1.5 text-xs font-mono text-[#facc15]"
      >
        <div class="flex items-center gap-1.5">
          <CheckSquare class="h-3.5 w-3.5 text-[#f59e0b]" />
          <span>{{ selectedUserIds.length }} peserta terpilih</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="pixel-btn h-6 px-2 text-[10px] bg-[#ca8a04] text-[#16110d] font-bold border-[#eab308]"
            @click="showBatchAssignModal = true"
          >
            Plotting Tim
          </button>
          <button
            class="pixel-btn h-6 px-2 text-[10px] bg-[#78350f] text-[#fef08a] font-bold border-[#92400e]"
            @click="batchUnassignTeam"
          >
            Lepas Tim
          </button>
          <button
            class="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            @click="selectedUserIds = []"
          >
            Batal
          </button>
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Table / Grid) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Content Area: Table View (Default) -->
      <div v-if="viewMode === 'table'" class="pixel-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="pixel-table w-full text-left text-xs">
          <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
            <tr>
              <th class="p-3 w-8 text-center">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="rounded bg-[#1a140f] border-[#523e2b] text-[#f59e0b] focus:ring-[#f59e0b] cursor-pointer"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="p-3">MAHASISWA PESERTA</th>
              <th class="p-3">TIER & EVOLUSI KELAS</th>
              <th class="p-3">GENDER & TITLE</th>
              <th class="p-3">TIM PETUALANG</th>
              <th class="p-3 text-center">TOTAL SKOR</th>
              <th class="p-3 text-center">STATUS</th>
              <th class="p-3 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60 font-mono">
            <tr v-if="loading" class="text-center">
              <td colspan="8" class="p-8 text-muted-foreground">
                <div class="flex items-center justify-center gap-2">
                  <RotateCw class="h-4 w-4 animate-spin text-[#f59e0b]" />
                  <span>Memuat data peserta & evolusi RPG...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="paginatedParticipants.length === 0" class="text-center">
              <td colspan="8" class="p-8 text-muted-foreground">
                Tidak ada data peserta yang cocok dengan filter.
              </td>
            </tr>

            <tr
              v-for="p in paginatedParticipants"
              :key="p.id"
              class="hover:bg-[#271d15]/50 transition-colors"
            >
              <!-- Checkbox -->
              <td class="p-3 text-center">
                <input
                  type="checkbox"
                  :value="p.id"
                  v-model="selectedUserIds"
                  class="rounded bg-[#1a140f] border-[#523e2b] text-[#f59e0b] focus:ring-[#f59e0b] cursor-pointer"
                />
              </td>

              <!-- Name & Avatar with Tier Aura -->
              <td class="p-3">
                <div
                  class="flex items-center gap-2.5 cursor-pointer group"
                  @click="openTacticalDetail(p)"
                  title="Klik untuk Inspect Loadout RPG & Stats Detail"
                >
                  <div
                    class="h-9 w-9 rounded-lg overflow-hidden border-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                    :style="{
                      borderColor: getTierColor(p.characterTier),
                      boxShadow: `0 0 10px ${getTierColor(p.characterTier)}55`,
                      background: '#1a140f',
                    }"
                  >
                    <img
                      :src="p.avatarUrl || (p.gender === 'FEMALE' ? '/character-cewek-avatar.png' : '/character-cowok-avatar.png')"
                      :alt="p.fullName"
                      class="h-full w-full object-cover"
                      style="image-rendering: pixelated;"
                    />
                  </div>
                  <div>
                    <div class="font-sans font-semibold text-foreground text-xs leading-tight group-hover:text-[#f59e0b] transition-colors flex items-center gap-1">
                      <span>{{ p.fullName }}</span>
                      <Crosshair class="h-3 w-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div class="text-[10px] text-muted-foreground">
                      @{{ p.username }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Tier & Evolved Class -->
              <td class="p-3">
                <div class="space-y-1">
                  <!-- Tier Pill Badge -->
                  <div>
                    <span
                      class="px-1.5 py-0.5 text-[9px] font-pixel border rounded inline-block"
                      :style="{
                        borderColor: getTierColor(p.characterTier),
                        backgroundColor: `${getTierColor(p.characterTier)}18`,
                        color: getTierColor(p.characterTier),
                      }"
                    >
                      {{ getTierBadge(p.characterTier) }}
                    </span>
                  </div>

                  <!-- Evolved Class Name -->
                  <div
                    class="font-mono text-[11px] font-bold"
                    :style="{ color: getClassColor(p.characterClass) }"
                  >
                    {{ getClassIcon(p.characterClass) }} {{ getEvolvedClassName(p.characterClass, p.characterTier) }}
                  </div>
                </div>
              </td>

              <!-- Gender & Title -->
              <td class="p-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span
                      v-if="p.gender === 'FEMALE'"
                      class="px-1.5 py-0.5 border border-[#ec4899]/50 bg-[#3b1227] text-[#f472b6] text-[9px] font-bold rounded"
                    >
                      ♀ Perempuan
                    </span>
                    <span
                      v-else
                      class="px-1.5 py-0.5 border border-[#0284c7]/50 bg-[#0c2a3f] text-[#38bdf8] text-[9px] font-bold rounded"
                    >
                      ♂ Laki-laki
                    </span>
                  </div>

                  <!-- Title Banner -->
                  <div class="font-pixel text-[10px] text-[#facc15]">
                    [{{ p.characterTitle || 'Novice Adventurer' }}]
                  </div>
                </div>
              </td>

              <!-- Team -->
              <td class="p-3">
                <div v-if="p.teamName" class="flex items-center gap-1.5">
                  <span class="px-1.5 py-0.5 border border-[#ca8a04]/60 bg-[#2b2014] text-[#facc15] text-[10px] font-pixel">
                    {{ p.teamName }}
                  </span>
                  <span class="text-[10px] text-muted-foreground">({{ p.teamCode }})</span>
                </div>
                <span v-else class="text-[#ca8a04] italic text-[10px]">Free Agent</span>
              </td>

              <!-- Total Score -->
              <td class="p-3 text-center font-bold text-[#4ade80] text-xs">
                {{ Number(p.totalScore || 0).toLocaleString() }} pts
              </td>

              <!-- Status -->
              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 text-[9px] font-pixel border',
                    p.status === 'ACTIVE'
                      ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                      : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                  ]"
                >
                  {{ p.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- Inspect RPG Loadout & Tactical Detail Button -->
                  <button
                    class="h-7 w-7 border border-[#ca8a04] bg-[#271d15] text-[#facc15] hover:bg-[#ca8a04] hover:text-[#16110d] flex items-center justify-center shadow-[0_0_8px_rgba(202,138,4,0.3)] transition-all"
                    title="Inspect RPG Loadout & Stats Hexagon"
                    @click="openTacticalDetail(p)"
                  >
                    <Crosshair class="h-3.5 w-3.5" />
                  </button>

                  <!-- Award Title Button -->
                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#facc15] hover:bg-[#ca8a04]/20 flex items-center justify-center"
                    title="Sematkan Gelar & Promosi Tier"
                    @click="openAwardTitleModal(p)"
                  >
                    <Award class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#38bdf8] hover:border-[#0284c7] flex items-center justify-center"
                    title="Riwayat Skor Ledger"
                    @click="openLedgerModal(p)"
                  >
                    <History class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center"
                    title="Edit Profil & Tier RPG"
                    @click="openEditModal(p)"
                  >
                    <Edit class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#facc15] hover:border-[#facc15] flex items-center justify-center"
                    title="Reset Password"
                    @click="openResetPasswordModal(p)"
                  >
                    <KeyRound class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center"
                    title="Hapus"
                    @click="confirmDelete(p)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Content Area: Grid View (Pixel RPG Cards) -->
    <div v-else class="space-y-4">
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="pixel-card p-4 animate-pulse h-36 bg-[#271d15]"></div>
      </div>

      <div v-else-if="paginatedParticipants.length === 0" class="pixel-card p-8 text-center text-xs text-muted-foreground font-mono">
        Tidak ada data peserta ditemukan.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="p in paginatedParticipants"
          :key="p.id"
          class="pixel-card p-4 space-y-3 flex flex-col justify-between"
          :style="{ borderColor: getTierColor(p.characterTier) }"
        >
          <div class="space-y-2.5">
            <!-- Header with Avatar & Details -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <!-- Avatar with class border & gender tag -->
                <div class="relative">
                  <div
                    class="h-11 w-11 rounded-lg overflow-hidden border-2 flex items-center justify-center shrink-0"
                    :style="{
                      borderColor: getTierColor(p.characterTier),
                      boxShadow: `0 0 12px ${getTierColor(p.characterTier)}55`,
                      background: '#15100c',
                    }"
                  >
                    <img
                      :src="p.avatarUrl || (p.gender === 'FEMALE' ? '/character-cewek-avatar.png' : '/character-cowok-avatar.png')"
                      :alt="p.fullName"
                      class="h-full w-full object-cover"
                      style="image-rendering: pixelated;"
                    />
                  </div>
                  <span
                    class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-[#080C14]"
                    :class="p.gender === 'FEMALE' ? 'bg-[#ec4899] text-white' : 'bg-[#0284c7] text-white'"
                  >
                    {{ p.gender === 'FEMALE' ? '♀' : '♂' }}
                  </span>
                </div>

                <div>
                  <div class="font-bold text-foreground text-xs leading-tight">
                    {{ p.fullName }}
                  </div>
                  <div class="font-mono text-[10px] text-muted-foreground">
                    @{{ p.username }}
                  </div>
                </div>
              </div>

              <!-- Tier Badge -->
              <span
                class="px-1.5 py-0.5 text-[8px] font-pixel border rounded"
                :style="{
                  borderColor: getTierColor(p.characterTier),
                  backgroundColor: `${getTierColor(p.characterTier)}22`,
                  color: getTierColor(p.characterTier),
                }"
              >
                {{ getTierBadge(p.characterTier) }}
              </span>
            </div>

            <!-- RPG Title & Job Class Banner -->
            <div
              class="border p-2 text-xs font-mono space-y-1 rounded"
              :style="{
                borderColor: `${getClassColor(p.characterClass)}44`,
                background: `${getClassColor(p.characterClass)}10`,
              }"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold" :style="{ color: getClassColor(p.characterClass) }">
                  {{ getClassIcon(p.characterClass) }} {{ getEvolvedClassName(p.characterClass, p.characterTier) }}
                </span>
                <span class="font-pixel text-[9px] text-[#facc15]">
                  [{{ p.characterTitle || 'Novice Adventurer' }}]
                </span>
              </div>
            </div>

            <!-- Team Details -->
            <div class="border border-[#4a3624] bg-[#15100c] p-2 text-xs font-mono">
              <div class="text-[10px] text-muted-foreground">TIM PETUALANG:</div>
              <div v-if="p.teamName" class="font-pixel text-[11px] text-[#facc15] mt-0.5">
                {{ p.teamName }} ({{ p.teamCode }})
              </div>
              <div v-else class="text-[#ca8a04] text-[10px] italic mt-0.5">
                Free Agent (Belum Ber-tim)
              </div>
            </div>

            <!-- Score Pill -->
            <div class="flex items-center justify-between font-mono text-xs border-t border-[#3d2d1e] pt-2">
              <span class="text-muted-foreground text-[11px]">Skor Terkumpul:</span>
              <span class="font-bold text-[#4ade80] font-pixel text-xs">
                {{ Number(p.totalScore || 0).toLocaleString() }} PTS
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t border-[#3d2d1e] pt-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                class="text-[11px] font-mono text-[#facc15] hover:text-[#fde047] flex items-center gap-1 font-bold"
                @click="openTacticalDetail(p)"
              >
                <Crosshair class="h-3 w-3 text-amber-400" />
                <span>Inspect Loadout</span>
              </button>

              <button
                class="text-[11px] font-mono text-gray-400 hover:text-white flex items-center gap-1"
                @click="openAwardTitleModal(p)"
              >
                <Award class="h-3 w-3" />
                <span>Gelar</span>
              </button>
            </div>

            <div class="flex items-center gap-1">
              <button
                class="h-6 w-6 border border-[#523e2b] bg-[#271d15] text-[#38bdf8] hover:border-[#0284c7] flex items-center justify-center text-xs"
                title="Ledger"
                @click="openLedgerModal(p)"
              >
                <History class="h-3 w-3" />
              </button>
              <button
                class="h-6 w-6 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center text-xs"
                title="Edit"
                @click="openEditModal(p)"
              >
                <Edit class="h-3 w-3" />
              </button>
              <button
                class="h-6 w-6 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                title="Hapus"
                @click="confirmDelete(p)"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Sticky Bottom Dashboard Footer: Pixel Pagination -->
    <PixelPagination
      :current-page="currentPage"
      :total-items="filteredParticipants.length"
      :page-size="pageSize"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Award Title & Tier Upgrade -->
    <Dialog :open="showAwardModal" @update:open="showAwardModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#ca8a04] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#facc15] flex items-center gap-2">
            <Award class="h-4 w-4" />
            <span>SEMATKAN GELAR & TIER UNTUK {{ selectedParticipant?.fullName }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="executeAwardTitle" class="space-y-3 py-1 font-mono text-xs">
          <p class="text-muted-foreground">
            Sematkan gelar kehormatan baru atau naikkan status tier evolusi petualang secara langsung:
          </p>

          <!-- Select Title Catalog or Custom -->
          <div class="space-y-1">
            <Label class="text-xs font-semibold text-foreground">Pilih Gelar dari Katalog:</Label>
            <select
              v-model="awardTitleForm.title"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#ca8a04]"
              required
            >
              <option value="">-- Pilih Gelar --</option>
              <option v-for="tItem in titleCatalogList" :key="tItem.id" :value="tItem.title">
                {{ tItem.icon }} {{ tItem.title }} (Tier {{ tItem.requiredTier }})
              </option>
            </select>
          </div>

          <!-- Custom Title Option -->
          <div class="space-y-1">
            <Label class="text-xs font-semibold text-foreground">Atau Ketik Gelar Spesial Kustom:</Label>
            <input
              v-model="awardTitleForm.customTitle"
              placeholder="Contoh: Juara Mini Game L7"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#ca8a04]"
            />
          </div>

          <!-- Promote Tier Option -->
          <div class="space-y-1">
            <Label class="text-xs font-semibold text-foreground">Promosikan ke Tier Evolusi:</Label>
            <select
              v-model.number="awardTitleForm.upgradeTier"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#ca8a04]"
            >
              <option :value="1">⭐ Tier 1: Novice</option>
              <option :value="2">⭐⭐ Tier 2: Advanced (Paladin / Arcanist / Sniper)</option>
              <option :value="3">👑 Tier 3: Ascended (Supreme Sovereign / Singularity Sage)</option>
            </select>
          </div>

          <DialogFooter class="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showAwardModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>SEMATKAN GELAR</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal: Create / Edit Participant -->
    <Dialog :open="showFormModal" @update:open="showFormModal = $event">
      <DialogContent class="sm:max-w-[480px] max-h-[90vh] overflow-y-auto pixel-card border-2 border-[#ca8a04] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <GraduationCap class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT DATA PESERTA & TIER' : 'TAMBAH PESERTA RPG BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-3 py-1 font-mono text-xs">
          <!-- Username / NIM -->
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Username / NIM:</Label>
            <input
              v-model="form.username"
              placeholder="Contoh: 240101001"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b] disabled:opacity-50"
              :disabled="isEditing"
              required
            />
          </div>

          <!-- Full Name -->
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Nama Lengkap Mahasiswa:</Label>
            <input
              v-model="form.fullName"
              placeholder="Nama lengkap..."
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              required
            />
          </div>

          <!-- Gender & Character Class (Two Columns) -->
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Gender -->
            <div class="space-y-1">
              <Label class="text-xs text-foreground font-semibold">Gender:</Label>
              <select
                v-model="form.gender"
                class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="MALE">♂ Laki-laki</option>
                <option value="FEMALE">♀ Perempuan</option>
              </select>
            </div>

            <!-- RPG Character Class -->
            <div class="space-y-1">
              <Label class="text-xs text-foreground font-semibold">Kelas Karakter RPG:</Label>
              <select
                v-model="form.characterClass"
                class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option v-for="cls in characterClassesList" :key="cls.id" :value="cls.id">
                  {{ cls.icon }} {{ cls.nameId }}
                </option>
              </select>
            </div>
          </div>

          <!-- Character Tier & Title (Two Columns) -->
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Tier -->
            <div class="space-y-1">
              <Label class="text-xs text-foreground font-semibold">Tier Evolusi:</Label>
              <select
                v-model.number="form.characterTier"
                class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option :value="1">⭐ Tier 1: Novice</option>
                <option :value="2">⭐⭐ Tier 2: Advanced</option>
                <option :value="3">👑 Tier 3: Ascended</option>
              </select>
            </div>

            <!-- Title -->
            <div class="space-y-1">
              <Label class="text-xs text-foreground font-semibold">Gelar (Title):</Label>
              <input
                v-model="form.characterTitle"
                placeholder="Novice Adventurer"
                class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          <!-- Avatar / Profile Photo URL -->
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Foto Profil / Avatar URL:</Label>
            <div class="flex items-center gap-2">
              <div
                class="h-8 w-8 rounded overflow-hidden border border-[#523e2b] bg-[#15100c] shrink-0 flex items-center justify-center"
              >
                <img
                  v-if="form.avatarUrl"
                  :src="form.avatarUrl"
                  alt="Preview"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-[9px] font-pixel text-[#f59e0b]">?</span>
              </div>
              <input
                v-model="form.avatarUrl"
                placeholder="https://... atau biarkan avatar evolusi default"
                class="flex-1 h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">
              {{ isEditing ? 'Ganti Password (Kosongkan jika tetap):' : 'Password Awal:' }}
            </Label>
            <input
              type="password"
              v-model="form.password"
              :placeholder="isEditing ? '••••••••' : 'Default: genius2026'"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <!-- Team Plotting -->
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Plotting Tim Petualang:</Label>
            <select
              v-model="form.teamId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option :value="null">-- Free Agent (Belum Ada Tim) --</option>
              <option v-for="team in teamsList" :key="team.id" :value="team.id">
                {{ team.name }} ({{ team.code }})
              </option>
            </select>
          </div>

          <!-- Status -->
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Status Akun:</Label>
            <select
              v-model="form.status"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="ACTIVE">AKTIF</option>
              <option value="INACTIVE">NONAKTIF</option>
            </select>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showFormModal = false"
            >
              Batal
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>{{ isEditing ? 'SIMPAN' : 'BUAT' }}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal: Batch Assign Team -->
    <Dialog :open="showBatchAssignModal" @update:open="showBatchAssignModal = $event">
      <DialogContent class="sm:max-w-[400px] pixel-card border-2 border-[#ca8a04] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <Users class="h-4 w-4" />
            <span>PLOTTING MASSAL KE TIM</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-1 font-mono text-xs">
          <p class="text-muted-foreground">
            Menugaskan <strong>{{ selectedUserIds.length }} peserta terpilih</strong> ke tim:
          </p>

          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Tim Tujuan:</Label>
            <select
              v-model="batchTargetTeamId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="">-- Pilih Tim --</option>
              <option v-for="team in teamsList" :key="team.id" :value="team.id">
                {{ team.name }} ({{ team.code }})
              </option>
            </select>
          </div>

          <DialogFooter class="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showBatchAssignModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="!batchTargetTeamId || saving"
              @click="executeBatchAssign"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>TERAPKAN</span>
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Modal: Bulk CSV Import -->
    <Dialog :open="showImportModal" @update:open="showImportModal = $event">
      <DialogContent class="sm:max-w-[560px] pixel-card border-2 border-[#16a34a] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#4ade80] flex items-center gap-2">
            <Upload class="h-4 w-4" />
            <span>IMPORT PESERTA RPG VIA CSV</span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 py-1 font-mono text-xs">
          <div class="flex items-center justify-between border border-[#4a3624] bg-[#15100c] p-2.5">
            <div>
              <p class="font-semibold text-foreground text-xs">Format: username,fullName,password,teamCode,gender,characterClass,characterTitle,characterTier</p>
            </div>
            <button
              class="pixel-btn text-[10px] px-2 h-6 bg-[#271d15] text-[#4ade80] border-[#16a34a]"
              @click="downloadCsvTemplate"
            >
              Download Template
            </button>
          </div>

          <!-- Paste Raw CSV Text -->
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Paste Teks CSV:</Label>
            <textarea
              v-model="csvRawText"
              rows="4"
              placeholder="240101001,Ahmad Dahlan,genius2026,GENIUS-01,MALE,CYBER_KNIGHT,Novice Adventurer,1&#10;240101002,Fatimah Zahra,genius2026,GENIUS-01,FEMALE,TECH_MAGE,Master Kuis Cepat,2"
              class="w-full bg-[#15100c] border border-[#523e2b] p-2 text-[11px] font-mono focus:outline-none focus:border-[#4ade80]"
              @input="parseRawCsv"
            ></textarea>
          </div>

          <!-- Preview Table -->
          <div v-if="parsedPreview.length > 0" class="space-y-1.5">
            <div class="font-semibold text-[#4ade80] text-xs">
              {{ parsedPreview.length }} data siap diimpor
            </div>
            <div class="max-h-36 overflow-y-auto border border-[#4a3624] bg-[#15100c]">
              <table class="w-full text-left text-[10px]">
                <thead class="bg-[#271d15] text-[#f59e0b] border-b border-[#4a3624]">
                  <tr>
                    <th class="p-1.5">#</th>
                    <th class="p-1.5">Username</th>
                    <th class="p-1.5">Nama</th>
                    <th class="p-1.5">Gender</th>
                    <th class="p-1.5">Kelas</th>
                    <th class="p-1.5">Tier</th>
                    <th class="p-1.5">Title</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#3d2d1e]/60">
                  <tr v-for="(item, idx) in parsedPreview.slice(0, 5)" :key="idx">
                    <td class="p-1.5 text-muted-foreground">{{ idx + 1 }}</td>
                    <td class="p-1.5 font-bold text-foreground">{{ item.username }}</td>
                    <td class="p-1.5">{{ item.fullName }}</td>
                    <td class="p-1.5">{{ item.gender || 'MALE' }}</td>
                    <td class="p-1.5">{{ item.characterClass || 'CYBER_KNIGHT' }}</td>
                    <td class="p-1.5 text-[#38bdf8]">Tier {{ item.characterTier || 1 }}</td>
                    <td class="p-1.5 text-[#facc15]">{{ item.characterTitle || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter class="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showImportModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#16a34a] text-white border-[#22c55e] font-bold"
              :disabled="parsedPreview.length === 0 || importing"
              @click="executeImport"
            >
              <RotateCw v-if="importing" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>IMPORT ({{ parsedPreview.length }})</span>
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Modal: Detail & Point Ledger History -->
    <Dialog :open="showLedgerModal" @update:open="showLedgerModal = $event">
      <DialogContent class="sm:max-w-[480px] pixel-card border-2 border-[#38bdf8] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center gap-2">
            <History class="h-4 w-4" />
            <span>POINT LEDGER: {{ selectedParticipant?.fullName }}</span>
          </DialogTitle>
        </DialogHeader>

        <div v-if="selectedParticipant" class="space-y-3 py-1 font-mono text-xs">
          <div class="flex items-center justify-between border border-[#4a3624] bg-[#15100c] p-2.5">
            <div>
              <div class="font-bold text-foreground">{{ selectedParticipant.fullName }}</div>
              <div class="text-[10px] text-muted-foreground">
                @{{ selectedParticipant.username }} • {{ selectedParticipant.teamName || 'Free Agent' }} • [{{ selectedParticipant.characterTitle || 'Novice Adventurer' }}]
              </div>
            </div>
            <div class="font-pixel text-sm font-bold text-[#4ade80]">
              {{ Number(selectedParticipant.totalScore || 0).toLocaleString() }} PTS
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="font-semibold text-foreground text-xs">Riwayat Transaksi Skor:</div>
            <div v-if="ledgerTransactions.length === 0" class="p-6 text-center border border-[#4a3624] bg-[#15100c] text-muted-foreground">
              Belum ada catatan transaksi skor.
            </div>
            <div v-else class="max-h-48 overflow-y-auto space-y-1 pr-1">
              <div
                v-for="tx in ledgerTransactions"
                :key="tx.id"
                class="flex items-center justify-between border border-[#3d2d1e] bg-[#271d15] p-2"
              >
                <div>
                  <span class="font-semibold text-foreground">{{ tx.reason || 'Sesi Game Selesai' }}</span>
                  <div class="text-[9px] text-muted-foreground">{{ formatDate(tx.createdAt) }}</div>
                </div>
                <span class="font-mono font-bold" :class="tx.amount >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'">
                  {{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount }} pts
                </span>
              </div>
            </div>
          </div>

          <DialogFooter class="pt-2 flex justify-end">
            <button
              class="h-7 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showLedgerModal = false"
            >
              Tutup
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect, onUnmounted } from "vue";
import { useLayoutState } from "@/composables/useLayoutState";
import {
  GraduationCap,
  Users,
  UserPlus,
  Search,
  RotateCw,
  Upload,
  Download,
  History,
  Edit,
  Trash2,
  KeyRound,
  CheckSquare,
  LayoutGrid,
  Table as TableIcon,
  Award,
  Crosshair,
} from "lucide-vue-next";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PixelPagination from "@/components/PixelPagination.vue";
import { useApi } from "@/composables/useApi";
import {
  RPG_CHARACTERS,
  TITLE_CATALOG,
  CharacterClass,
  CharacterTier,
  getEvolutionForClassAndTier,
} from "@genius/types";

const api = useApi();

const loading = ref(false);
const saving = ref(false);
const importing = ref(false);
const participants = ref<any[]>([]);
const teamsList = ref<any[]>([]);
const viewMode = ref<"table" | "grid">("table");
const searchQuery = ref("");
const selectedTeamFilter = ref("");
const selectedStatusFilter = ref("");
const selectedGenderFilter = ref("");
const selectedClassFilter = ref("");
const selectedTierFilter = ref("");
const selectedUserIds = ref<string[]>([]);

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const showFormModal = ref(false);
const isEditing = ref(false);
const showBatchAssignModal = ref(false);
const batchTargetTeamId = ref("");
const showImportModal = ref(false);
const showLedgerModal = ref(false);
const showAwardModal = ref(false);
const showTacticalModal = ref(false);
const selectedParticipant = ref<any>(null);
const selectedTacticalParticipant = ref<any>(null);
const ledgerTransactions = ref<any[]>([]);

const csvRawText = ref("");
const parsedPreview = ref<any[]>([]);

const characterClassesList = computed(() => Object.values(RPG_CHARACTERS));
const titleCatalogList = computed(() => TITLE_CATALOG);

const form = ref({
  id: "",
  username: "",
  fullName: "",
  password: "",
  gender: "MALE",
  characterClass: "CYBER_KNIGHT",
  characterTitle: "Novice Adventurer",
  characterTier: 1,
  avatarUrl: "",
  teamId: null as string | null,
  status: "ACTIVE",
});

const awardTitleForm = ref({
  title: "",
  customTitle: "",
  upgradeTier: 1,
});

const totalCount = computed(() => participants.value.length);

const filteredParticipants = computed(() => {
  return participants.value;
});

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredParticipants.value.slice(start, start + pageSize.value);
});

const isAllSelected = computed(() => {
  return (
    paginatedParticipants.value.length > 0 &&
    paginatedParticipants.value.every((p) => selectedUserIds.value.includes(p.id))
  );
});

function getClassColor(classId?: string) {
  const c = classId as CharacterClass;
  return RPG_CHARACTERS[c]?.color || "#38bdf8";
}

function getClassIcon(classId?: string) {
  const c = classId as CharacterClass;
  return RPG_CHARACTERS[c]?.icon || "🛡️";
}

function getEvolvedClassName(classId?: string, tier?: number) {
  const evo = getEvolutionForClassAndTier(classId || "CYBER_KNIGHT", tier || 1);
  return evo?.tierName || "Ksatria Siber";
}

function getTierBadge(tier?: number) {
  if (tier === 3) return "👑 TIER 3: ASCENDED";
  if (tier === 2) return "⭐⭐ TIER 2: ADVANCED";
  return "⭐ TIER 1: NOVICE";
}

function getTierColor(tier?: number) {
  if (tier === 3) return "#ca8a04"; // Gold
  if (tier === 2) return "#38bdf8"; // Bright Cyan
  return "#64748b"; // Silver/Slate
}

function toggleSelectAll(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.checked) {
    const pageIds = paginatedParticipants.value.map((p) => p.id);
    selectedUserIds.value = Array.from(new Set([...selectedUserIds.value, ...pageIds]));
  } else {
    const pageIds = new Set(paginatedParticipants.value.map((p) => p.id));
    selectedUserIds.value = selectedUserIds.value.filter((id) => !pageIds.has(id));
  }
}

let debounceTimer: any = null;
function debounceFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchParticipants();
  }, 300);
}

async function fetchTeams() {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/teams?pageSize=100");
    if (res.success && res.data) teamsList.value = res.data;
  } catch (err) {
    console.error("Failed to load teams:", err);
  }
}

async function fetchParticipants() {
  loading.value = true;
  try {
    const params: Record<string, string> = {
      role: "PARTICIPANT",
      pageSize: "1000",
    };
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedTeamFilter.value === "assigned") {
      params.assignmentStatus = "assigned";
    } else if (selectedTeamFilter.value === "unassigned") {
      params.assignmentStatus = "unassigned";
    } else if (selectedTeamFilter.value) {
      params.teamId = selectedTeamFilter.value;
    }
    if (selectedGenderFilter.value) {
      params.gender = selectedGenderFilter.value;
    }
    if (selectedClassFilter.value) {
      params.characterClass = selectedClassFilter.value;
    }
    if (selectedTierFilter.value) {
      params.tier = selectedTierFilter.value;
    }

    const res = await api.get<{ success: boolean; data: any[] }>("/api/users", params);
    if (res.success && res.data) {
      let list = res.data;
      if (selectedStatusFilter.value) {
        list = list.filter((p) => p.status === selectedStatusFilter.value);
      }
      participants.value = list;
    }
  } catch (err) {
    console.error("Failed to fetch participants:", err);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    username: "",
    fullName: "",
    password: "",
    gender: "MALE",
    characterClass: "CYBER_KNIGHT",
    characterTitle: "Novice Adventurer",
    characterTier: 1,
    avatarUrl: "",
    teamId: null,
    status: "ACTIVE",
  };
  showFormModal.value = true;
}

function openEditModal(p: any) {
  isEditing.value = true;
  form.value = {
    id: p.id,
    username: p.username,
    fullName: p.fullName,
    password: "",
    gender: p.gender || "MALE",
    characterClass: p.characterClass || "CYBER_KNIGHT",
    characterTitle: p.characterTitle || "Novice Adventurer",
    characterTier: p.characterTier || 1,
    avatarUrl: p.avatarUrl || "",
    teamId: p.teamId || null,
    status: p.status || "ACTIVE",
  };
  showFormModal.value = true;
}

function openAwardTitleModal(p: any) {
  selectedParticipant.value = p;
  awardTitleForm.value = {
    title: p.characterTitle || "Novice Adventurer",
    customTitle: "",
    upgradeTier: p.characterTier || 1,
  };
  showAwardModal.value = true;
}

async function executeAwardTitle() {
  if (!selectedParticipant.value) return;
  saving.value = true;
  try {
    const finalTitle = awardTitleForm.value.customTitle.trim() || awardTitleForm.value.title;
    await api.post(`/api/users/${selectedParticipant.value.id}/award-title`, {
      title: finalTitle,
      upgradeTier: awardTitleForm.value.upgradeTier,
    });
    alert(`Gelar '${finalTitle}' berhasil disematkan!`);
    showAwardModal.value = false;
    await fetchParticipants();
  } catch (err: any) {
    alert("Gagal menyematkan gelar: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function submitForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      const payload: any = {
        fullName: form.value.fullName,
        gender: form.value.gender,
        characterClass: form.value.characterClass,
        characterTitle: form.value.characterTitle,
        characterTier: form.value.characterTier,
        avatarUrl: form.value.avatarUrl || null,
        teamId: form.value.teamId,
        status: form.value.status,
      };
      if (form.value.password) payload.password = form.value.password;
      await api.put(`/api/users/${form.value.id}`, payload);
    } else {
      await api.post("/api/users", {
        username: form.value.username,
        fullName: form.value.fullName,
        password: form.value.password || "genius2026",
        role: "PARTICIPANT",
        gender: form.value.gender,
        characterClass: form.value.characterClass,
        characterTitle: form.value.characterTitle,
        characterTier: form.value.characterTier,
        avatarUrl: form.value.avatarUrl || null,
        teamId: form.value.teamId,
        status: form.value.status,
      });
    }
    showFormModal.value = false;
    await fetchParticipants();
  } catch (err: any) {
    alert("Gagal menyimpan peserta: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function openResetPasswordModal(p: any) {
  if (confirm(`Reset password untuk ${p.fullName} (@${p.username}) ke default 'genius2026'?`)) {
    try {
      await api.post(`/api/users/${p.id}/reset-password`, { password: "genius2026" });
      alert(`Password untuk @${p.username} berhasil di-reset ke: genius2026`);
    } catch (err: any) {
      alert("Gagal reset password: " + err.message);
    }
  }
}

async function confirmDelete(p: any) {
  if (confirm(`Hapus peserta ${p.fullName} (@${p.username})?`)) {
    try {
      await api.del(`/api/users/${p.id}`);
      await fetchParticipants();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  }
}

async function executeBatchAssign() {
  if (!batchTargetTeamId.value) return;
  saving.value = true;
  try {
    await api.post("/api/users/batch-assign-team", {
      userIds: selectedUserIds.value,
      teamId: batchTargetTeamId.value,
    });
    showBatchAssignModal.value = false;
    selectedUserIds.value = [];
    await fetchParticipants();
  } catch (err: any) {
    alert("Gagal alokasi tim: " + err.message);
  } finally {
    saving.value = false;
  }
}

async function batchUnassignTeam() {
  if (confirm(`Lepaskan ${selectedUserIds.value.length} peserta dari tim?`)) {
    saving.value = true;
    try {
      await api.post("/api/users/batch-assign-team", {
        userIds: selectedUserIds.value,
        teamId: null,
      });
      selectedUserIds.value = [];
      await fetchParticipants();
    } catch (err: any) {
      alert("Gagal melepaskan peserta: " + err.message);
    } finally {
      saving.value = false;
    }
  }
}

function openTacticalDetail(p: any) {
  navigateTo(`/participants/${p.id}`);
}

async function updateActiveTitleDirect(title: string) {
  if (!selectedTacticalParticipant.value) return;
  try {
    const res = await api.put(`/api/users/${selectedTacticalParticipant.value.id}`, {
      characterTitle: title,
    });
    if (res.success) {
      selectedTacticalParticipant.value.characterTitle = title;
      await fetchParticipants();
    }
  } catch (err: any) {
    alert("Gagal memperbarui gelar: " + (err.data?.error?.message || err.message));
  }
}

async function openLedgerModal(p: any) {
  selectedParticipant.value = p;
  ledgerTransactions.value = [];
  showLedgerModal.value = true;
  try {
    const res = await api.get(`/api/users/${p.id}`);
    if (res.success && res.data?.scoreHistory) {
      ledgerTransactions.value = res.data.scoreHistory;
    }
  } catch (err) {
    console.error("Failed to load ledger:", err);
  }
}

function parseRawCsv() {
  const lines = csvRawText.value.split("\n").map((l) => l.trim()).filter(Boolean);
  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line.toLowerCase().includes("username")) continue;

    const parts = line.split(",").map((p) => p.trim());
    if (parts.length >= 1 && parts[0]) {
      results.push({
        username: parts[0],
        fullName: parts[1] || parts[0],
        password: parts[2] || "genius2026",
        teamCode: parts[3] || undefined,
        gender: parts[4] || "MALE",
        characterClass: parts[5] || "CYBER_KNIGHT",
        characterTitle: parts[6] || "Novice Adventurer",
        characterTier: Number(parts[7]) || 1,
        role: "PARTICIPANT",
      });
    }
  }
  parsedPreview.value = results;
}

async function executeImport() {
  if (parsedPreview.value.length === 0) return;
  importing.value = true;
  try {
    const res = await api.post<{ success: boolean; data: any }>("/api/users/bulk-import", {
      items: parsedPreview.value,
      defaultPassword: "genius2026",
      defaultRole: "PARTICIPANT",
    });

    if (res.success) {
      alert(`Berhasil mengimpor ${res.data.successCount} peserta RPG! (${res.data.skippedCount} dilewati)`);
      showImportModal.value = false;
      csvRawText.value = "";
      parsedPreview.value = [];
      await fetchParticipants();
    }
  } catch (err: any) {
    alert("Gagal impor: " + (err.data?.error?.message || err.message));
  } finally {
    importing.value = false;
  }
}

function downloadCsvTemplate() {
  const csvContent = "username,fullName,password,teamCode,gender,characterClass,characterTitle,characterTier\n240101001,Ahmad Dahlan,genius2026,GENIUS-01,MALE,CYBER_KNIGHT,Novice Adventurer,1\n240101002,Fatimah Azzahra,genius2026,GENIUS-01,FEMALE,TECH_MAGE,Master Kuis Cepat,2";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "template_peserta_rpg_evolution_2026.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportCsv() {
  if (participants.value.length === 0) {
    alert("Tidak ada data peserta");
    return;
  }

  let csv = "ID,Username,Nama Lengkap,Gender,Kelas RPG,Tier Evolusi,Gelar Karakter,Tim,Kode Tim,Skor Total,Status,Tanggal Daftar\n";
  participants.value.forEach((p) => {
    csv += `"${p.id}","${p.username}","${p.fullName}","${p.gender || 'MALE'}","${p.characterClass || 'CYBER_KNIGHT'}","Tier ${p.characterTier || 1}","${p.characterTitle || 'Novice Adventurer'}","${p.teamName || '-'}","${p.teamCode || '-'}","${p.totalScore || 0}","${p.status}","${p.createdAt}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `peserta_rpg_evolution_2026_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getInitials(name: string) {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const { setPageHeader, clearPageHeader } = useLayoutState();

watchEffect(() => {
  setPageHeader({
    title: "Manajemen Peserta RPG & Evolusi",
    badge: `${totalCount.value} Petualang`,
    icon: GraduationCap,
  });
});

onMounted(() => {
  fetchTeams();
  fetchParticipants();
});

onUnmounted(() => {
  clearPageHeader();
});
</script>
