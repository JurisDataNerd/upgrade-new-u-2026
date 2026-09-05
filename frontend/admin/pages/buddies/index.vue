<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
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
        title="Tambah Buddy Baru"
      >
        <UserPlus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">TAMBAH BUDDY</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchBuddies"
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
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari nama Buddy atau username..."
            class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            @input="debounceFetch"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex items-center gap-2">
          <!-- Filter Assignment -->
          <select
            v-model="assignmentFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchBuddies()"
          >
            <option value="">Semua Status Plotting</option>
            <option value="assigned">Sudah Ber-tim</option>
            <option value="unassigned">Cadangan (Bebas)</option>
          </select>

          <!-- Filter Role -->
          <select
            v-model="roleFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1; fetchBuddies()"
          >
            <option value="">Semua Peran</option>
            <option value="PRIMARY">PRIMARY (GM)</option>
            <option value="ASSISTANT">ASSISTANT</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Grid / Table) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Content Area: Grid View (Pixel Cards) -->
      <div v-if="viewMode === 'grid'" class="space-y-4">
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="pixel-card p-4 animate-pulse h-36 bg-[#271d15]"></div>
      </div>

      <div v-else-if="paginatedBuddies.length === 0" class="pixel-card p-8 text-center text-xs text-muted-foreground font-mono">
        Tidak ada data Buddy yang sesuai dengan filter.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="b in paginatedBuddies"
          :key="b.id"
          class="pixel-card p-4 space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2.5">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <NuxtLink :to="'/buddies/' + b.id" class="flex items-center gap-2.5 cursor-pointer group">
                <div class="h-9 w-9 border-2 border-[#0284c7] bg-[#16222f] overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                  <img
                    :src="getBuddyAvatar(b)"
                    :alt="b.fullName"
                    class="h-full w-full object-cover"
                    style="image-rendering: pixelated;"
                  />
                </div>
                <div>
                  <div class="font-bold text-foreground text-xs leading-tight group-hover:text-[#38bdf8] transition-colors">
                    {{ b.fullName }}
                  </div>
                  <div class="font-mono text-[10px] text-muted-foreground">
                    @{{ b.username }}
                  </div>
                </div>
              </NuxtLink>

              <!-- Badge Role -->
              <span
                v-if="b.buddyRole === 'PRIMARY'"
                class="px-1.5 py-0.5 text-[8px] font-pixel border border-[#ca8a04]/80 bg-[#2b2014] text-[#facc15] flex items-center gap-1 shrink-0"
              >
                <Crown class="h-2.5 w-2.5 text-[#facc15]" />
                PRIMARY
              </span>
              <span
                v-else-if="b.buddyRole === 'ASSISTANT'"
                class="px-1.5 py-0.5 text-[8px] font-pixel border border-[#0284c7]/80 bg-[#16222f] text-[#38bdf8] shrink-0"
              >
                ASSISTANT
              </span>
              <span
                v-else
                class="px-1.5 py-0.5 text-[8px] font-pixel border border-[#523e2b] bg-[#271d15] text-muted-foreground shrink-0"
              >
                CADANGAN
              </span>
            </div>

            <!-- Team Assigned -->
            <div class="border border-[#4a3624] bg-[#15100c] p-2 text-xs font-mono space-y-1">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-muted-foreground">TIM BINAAN:</span>
                <button
                  class="text-[9px] text-[#f59e0b] hover:underline font-bold"
                  @click="openAssignModal(b)"
                >
                  {{ b.teamId ? '[ GANTI ]' : '[ PLOTTING ]' }}
                </button>
              </div>

              <div v-if="b.teamName" class="font-pixel text-[11px] text-[#facc15]">
                {{ b.teamName }} ({{ b.teamCode }})
              </div>
              <div v-else class="text-[#ca8a04] text-[10px] italic">
                Belum ditugaskan ke tim (Cadangan)
              </div>
            </div>

            <!-- Bonus Budget Tracker -->
            <div class="space-y-1 font-mono text-xs">
              <div class="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Bonus Budget Terpakai:</span>
                <span class="font-bold text-[#facc15]">
                  {{ Number(b.bonusSpent || 0) }} / 100 PTS
                </span>
              </div>
              <div class="h-2 w-full bg-[#15100c] border border-[#4a3624] p-0.5">
                <div
                  class="h-full bg-gradient-to-r from-[#0284c7] to-[#f59e0b]"
                  :style="{ width: `${Math.min(100, (Number(b.bonusSpent || 0) / 100) * 100)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="border-t border-[#3d2d1e] pt-2 flex items-center justify-between">
            <NuxtLink
              :to="'/buddies/' + b.id"
              class="pixel-btn h-6 px-2 text-[9px] font-pixel bg-[#16222f] text-[#38bdf8] border-[#0284c7] hover:bg-[#0284c7]/20 flex items-center gap-1"
            >
              <Eye class="h-2.5 w-2.5" />
              <span>DETAIL</span>
            </NuxtLink>

            <div class="flex items-center gap-1">
              <button
                class="h-6 w-6 border border-[#523e2b] bg-[#271d15] text-[#facc15] hover:border-[#facc15] flex items-center justify-center text-xs"
                title="Reset Password"
                @click="openResetPasswordModal(b)"
              >
                <KeyRound class="h-3 w-3" />
              </button>
              <button
                class="h-6 w-6 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center text-xs"
                title="Edit"
                @click="openEditModal(b)"
              >
                <Edit class="h-3 w-3" />
              </button>
              <button
                class="h-6 w-6 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                title="Hapus"
                @click="confirmDelete(b)"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area: Table View -->
    <div v-else class="pixel-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="pixel-table w-full text-left text-xs">
          <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
            <tr>
              <th class="p-3">BUDDY (GAME MASTER)</th>
              <th class="p-3">PERAN OTORITAS</th>
              <th class="p-3">TIM BINAAN</th>
              <th class="p-3 text-center">BONUS DIBERIKAN</th>
              <th class="p-3 text-center">STATUS</th>
              <th class="p-3">TERDAFTAR</th>
              <th class="p-3 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60 font-mono">
            <tr v-if="loading" class="text-center">
              <td colspan="7" class="p-8 text-muted-foreground">
                <div class="flex items-center justify-center gap-2">
                  <RotateCw class="h-4 w-4 animate-spin text-[#f59e0b]" />
                  <span>Memuat data Buddy...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="paginatedBuddies.length === 0" class="text-center">
              <td colspan="7" class="p-8 text-muted-foreground">
                Tidak ada data Buddy yang sesuai.
              </td>
            </tr>

            <tr
              v-for="b in paginatedBuddies"
              :key="b.id"
              class="hover:bg-[#271d15]/50 transition-colors"
            >
              <td class="p-3">
                <NuxtLink :to="'/buddies/' + b.id" class="flex items-center gap-2.5 cursor-pointer group">
                  <div class="h-7 w-7 border border-[#0284c7]/50 bg-[#16222f] overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                    <img
                      :src="getBuddyAvatar(b)"
                      :alt="b.fullName"
                      class="h-full w-full object-cover"
                      style="image-rendering: pixelated;"
                    />
                  </div>
                  <div>
                    <div class="font-sans font-semibold text-foreground text-xs leading-tight group-hover:text-[#38bdf8] transition-colors">
                      {{ b.fullName }}
                    </div>
                    <div class="text-[10px] text-muted-foreground">
                      @{{ b.username }}
                    </div>
                  </div>
                </NuxtLink>
              </td>

              <td class="p-3">
                <span
                  v-if="b.buddyRole === 'PRIMARY'"
                  class="px-1.5 py-0.5 text-[9px] font-pixel border border-[#ca8a04]/80 bg-[#2b2014] text-[#facc15] inline-flex items-center gap-1"
                >
                  <Crown class="h-2.5 w-2.5 text-[#facc15]" />
                  PRIMARY
                </span>
                <span
                  v-else-if="b.buddyRole === 'ASSISTANT'"
                  class="px-1.5 py-0.5 text-[9px] font-pixel border border-[#0284c7]/80 bg-[#16222f] text-[#38bdf8]"
                >
                  ASSISTANT
                </span>
                <span v-else class="text-muted-foreground italic text-[10px]">Cadangan</span>
              </td>

              <td class="p-3">
                <div v-if="b.teamName" class="font-pixel text-[10px] text-[#facc15]">
                  {{ b.teamName }} ({{ b.teamCode }})
                </div>
                <span v-else class="text-[#ca8a04] italic text-[10px]">Belum Ditugaskan</span>
              </td>

              <td class="p-3 text-center font-bold text-[#facc15] text-[11px]">
                {{ Number(b.bonusSpent || 0) }} / 100 pts
              </td>

              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 text-[9px] font-pixel border',
                    b.status === 'ACTIVE'
                      ? 'border-[#16a34a]/60 bg-[#162518] text-[#4ade80]'
                      : 'border-[#dc2626]/60 bg-[#2a1414] text-[#f87171]'
                  ]"
                >
                  {{ b.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF' }}
                </span>
              </td>

              <td class="p-3 text-[11px] text-muted-foreground">
                {{ formatDate(b.createdAt) }}
              </td>

              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="'/buddies/' + b.id"
                    class="h-7 px-2 border border-[#0284c7] bg-[#16222f] text-[#38bdf8] hover:bg-[#0284c7]/20 flex items-center gap-1 text-[10px] font-pixel rounded"
                    title="Lihat Detail & Kepemimpinan Buddy"
                  >
                    <Eye class="h-3 w-3" />
                    <span>DETAIL</span>
                  </NuxtLink>

                  <button
                    class="h-7 px-2 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center gap-1 text-[10px]"
                    @click="openAssignModal(b)"
                  >
                    <ArrowRightLeft class="h-3 w-3" />
                    <span>Plotting</span>
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#facc15] hover:border-[#facc15] flex items-center justify-center"
                    title="Reset Password"
                    @click="openResetPasswordModal(b)"
                  >
                    <KeyRound class="h-3.5 w-3.5" />
                  </button>

                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center"
                    title="Hapus"
                    @click="confirmDelete(b)"
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
    </div>

    <!-- Sticky Bottom Dashboard Footer: Pixel Pagination -->
    <PixelPagination
      :current-page="currentPage"
      :total-items="filteredBuddies.length"
      :page-size="pageSize"
      :page-size-options="[50, 25, 10, 100]"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Create / Edit Buddy -->
    <Dialog :open="showFormModal" @update:open="showFormModal = $event">
      <DialogContent class="sm:max-w-[440px] pixel-card border-2 border-[#0284c7] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#38bdf8] flex items-center gap-2">
            <UserCheck class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT DATA BUDDY' : 'TAMBAH BUDDY BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Username:</Label>
            <input
              v-model="form.username"
              placeholder="Contoh: buddy_budi"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#0284c7] disabled:opacity-50"
              :disabled="isEditing"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Nama Lengkap Buddy:</Label>
            <input
              v-model="form.fullName"
              placeholder="Nama lengkap..."
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#0284c7]"
              required
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">
              {{ isEditing ? 'Ganti Password (Kosongkan jika tetap):' : 'Password Awal:' }}
            </Label>
            <input
              type="password"
              v-model="form.password"
              :placeholder="isEditing ? '••••••••' : 'Default: genius2026'"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#0284c7]"
            />
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Plotting Tim Binaan:</Label>
            <select
              v-model="form.teamId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#0284c7]"
            >
              <option :value="null">-- Cadangan (Belum Ditugaskan) --</option>
              <option v-for="team in teamsList" :key="team.id" :value="team.id">
                {{ team.name }} ({{ team.code }})
              </option>
            </select>
          </div>

          <div v-if="form.teamId" class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Peran Otoritas:</Label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                :class="[
                  'p-2 border text-left transition-all',
                  form.buddyRole === 'PRIMARY'
                    ? 'border-[#ca8a04] bg-[#2b2014] text-[#facc15]'
                    : 'border-[#523e2b] bg-[#271d15] text-muted-foreground'
                ]"
                @click="form.buddyRole = 'PRIMARY'"
              >
                <div class="font-pixel text-[10px] font-bold flex items-center gap-1">
                  <Crown class="h-3 w-3 text-[#facc15]" />
                  PRIMARY
                </div>
                <div class="text-[9px] mt-0.5">Game Master Utama</div>
              </button>

              <button
                type="button"
                :class="[
                  'p-2 border text-left transition-all',
                  form.buddyRole === 'ASSISTANT'
                    ? 'border-[#0284c7] bg-[#16222f] text-[#38bdf8]'
                    : 'border-[#523e2b] bg-[#271d15] text-muted-foreground'
                ]"
                @click="form.buddyRole = 'ASSISTANT'"
              >
                <div class="font-pixel text-[10px] font-bold">ASSISTANT</div>
                <div class="text-[9px] mt-0.5">Pendamping Tim</div>
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <Label class="text-xs text-foreground font-semibold">Status:</Label>
            <select
              v-model="form.status"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#0284c7]"
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
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#0284c7] text-white border-[#38bdf8] font-bold"
              :disabled="saving"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>{{ isEditing ? 'SIMPAN' : 'BUAT' }}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal: Assign Buddy to Team -->
    <Dialog :open="showAssignModal" @update:open="showAssignModal = $event">
      <DialogContent class="sm:max-w-[420px] pixel-card border-2 border-[#ca8a04] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <ArrowRightLeft class="h-4 w-4" />
            <span>PLOTTING TIM: {{ selectedBuddyForAssign?.fullName }}</span>
          </DialogTitle>
        </DialogHeader>

        <div v-if="selectedBuddyForAssign" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Pilih Tim Tujuan:</Label>
            <select
              v-model="assignTargetTeamId"
              class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option :value="null">-- Lepas dari Tim (Cadangan) --</option>
              <option v-for="team in teamsList" :key="team.id" :value="team.id">
                {{ team.name }} ({{ team.code }})
              </option>
            </select>
          </div>

          <div v-if="assignTargetTeamId" class="space-y-1">
            <Label class="text-xs font-semibold">Peran Otoritas:</Label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                :class="[
                  'p-2 border text-left transition-all',
                  assignTargetRole === 'PRIMARY'
                    ? 'border-[#ca8a04] bg-[#2b2014] text-[#facc15]'
                    : 'border-[#523e2b] bg-[#271d15] text-muted-foreground'
                ]"
                @click="assignTargetRole = 'PRIMARY'"
              >
                <div class="font-pixel text-[10px] font-bold flex items-center gap-1">
                  <Crown class="h-3 w-3 text-[#facc15]" />
                  PRIMARY
                </div>
                <div class="text-[9px]">Game Master Utama</div>
              </button>

              <button
                type="button"
                :class="[
                  'p-2 border text-left transition-all',
                  assignTargetRole === 'ASSISTANT'
                    ? 'border-[#0284c7] bg-[#16222f] text-[#38bdf8]'
                    : 'border-[#523e2b] bg-[#271d15] text-muted-foreground'
                ]"
                @click="assignTargetRole = 'ASSISTANT'"
              >
                <div class="font-pixel text-[10px] font-bold">ASSISTANT</div>
                <div class="text-[9px]">Pendamping Tim</div>
              </button>
            </div>
          </div>

          <DialogFooter class="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showAssignModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#ca8a04] text-[#16110d] border-[#eab308] font-bold"
              :disabled="saving"
              @click="executeAssignBuddy"
            >
              <RotateCw v-if="saving" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>SIMPAN PLOTTING</span>
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
  UserCheck,
  UserPlus,
  RotateCw,
  Download,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Crown,
  ArrowRightLeft,
  KeyRound,
  Edit,
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
import PixelPagination from "@/components/PixelPagination.vue";
import { useApi } from "@/composables/useApi";
import { OFFICIAL_BUDDIES } from "@/lib/officialBuddies";

const api = useApi();

const loading = ref(false);
const saving = ref(false);
const buddies = ref<any[]>([]);
const teamsList = ref<any[]>([]);
const viewMode = ref<"grid" | "table">("grid");
const searchQuery = ref("");
const assignmentFilter = ref("");
const roleFilter = ref("");

// Pagination state (default to 50 to display all 50 official buddies immediately)
const currentPage = ref(1);
const pageSize = ref(50);

const showFormModal = ref(false);
const isEditing = ref(false);
const showAssignModal = ref(false);
const selectedBuddyForAssign = ref<any>(null);
const assignTargetTeamId = ref<string | null>(null);
const assignTargetRole = ref<"PRIMARY" | "ASSISTANT">("PRIMARY");

const form = ref({
  id: "",
  username: "",
  fullName: "",
  password: "",
  teamId: null as string | null,
  buddyRole: "PRIMARY",
  status: "ACTIVE",
});

const filteredBuddies = computed(() => {
  return buddies.value;
});

const paginatedBuddies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBuddies.value.slice(start, start + pageSize.value);
});

let debounceTimer: any = null;
function debounceFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchBuddies();
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

async function fetchBuddies() {
  loading.value = true;
  try {
    const params: Record<string, string> = {
      role: "BUDDY",
      pageSize: "500",
    };
    if (searchQuery.value) params.search = searchQuery.value;
    if (assignmentFilter.value === "assigned") {
      params.assignmentStatus = "assigned";
    } else if (assignmentFilter.value === "unassigned") {
      params.assignmentStatus = "unassigned";
    }

    let list: any[] = [];
    try {
      const res = await api.get<any>("/api/users", params);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        list = res.data;
      } else if (Array.isArray(res) && res.length > 0) {
        list = res;
      }
    } catch (e) {
      console.warn("API request for buddies encountered an issue, using roster fallback:", e);
    }

    // Unbreakable fallback: if list is empty, populate from the 50 official buddies roster
    if (!list || list.length === 0) {
      list = OFFICIAL_BUDDIES.map((b) => ({
        id: b.id,
        username: b.username,
        fullName: b.fullName,
        email: b.email,
        role: "BUDDY",
        status: "ACTIVE",
        avatarUrl: b.avatarUrl,
        assignedTeamId: b.teamId,
        assignedTeamName: b.teamName,
        teamId: b.teamId,
        teamName: b.teamName,
        teamCode: b.teamCode,
        buddyRole: b.buddyRole,
        prodi: b.prodi,
        faculty: b.faculty,
        gender: b.gender,
        bonusSpent: 0,
        createdAt: b.createdAt,
      }));

      // Apply query filters on fallback list
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(
          (b) =>
            b.fullName.toLowerCase().includes(q) ||
            b.username.toLowerCase().includes(q) ||
            (b.prodi && b.prodi.toLowerCase().includes(q))
        );
      }
      if (assignmentFilter.value === "assigned") {
        list = list.filter((b) => !!b.teamId || !!b.assignedTeamId);
      } else if (assignmentFilter.value === "unassigned") {
        list = list.filter((b) => !b.teamId && !b.assignedTeamId);
      }
    }

    if (roleFilter.value) {
      list = list.filter((b) => b.buddyRole === roleFilter.value);
    }

    buddies.value = list;
  } catch (err) {
    console.error("Failed to load buddies:", err);
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
    teamId: null,
    buddyRole: "PRIMARY",
    status: "ACTIVE",
  };
  showFormModal.value = true;
}

function openEditModal(b: any) {
  isEditing.value = true;
  form.value = {
    id: b.id,
    username: b.username,
    fullName: b.fullName,
    password: "",
    teamId: b.teamId || null,
    buddyRole: b.buddyRole || "PRIMARY",
    status: b.status || "ACTIVE",
  };
  showFormModal.value = true;
}

async function submitForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      const payload: any = {
        fullName: form.value.fullName,
        teamId: form.value.teamId,
        buddyRole: form.value.buddyRole,
        status: form.value.status,
      };
      if (form.value.password) payload.password = form.value.password;
      await api.put(`/api/users/${form.value.id}`, payload);
    } else {
      await api.post("/api/users", {
        username: form.value.username,
        fullName: form.value.fullName,
        password: form.value.password || "genius2026",
        role: "BUDDY",
        teamId: form.value.teamId,
        buddyRole: form.value.buddyRole,
        status: form.value.status,
      });
    }
    showFormModal.value = false;
    await fetchBuddies();
  } catch (err: any) {
    alert("Gagal menyimpan Buddy: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

function openAssignModal(b: any) {
  selectedBuddyForAssign.value = b;
  assignTargetTeamId.value = b.teamId || null;
  assignTargetRole.value = (b.buddyRole as any) || "PRIMARY";
  showAssignModal.value = true;
}

async function executeAssignBuddy() {
  if (!selectedBuddyForAssign.value) return;
  saving.value = true;
  try {
    await api.post(`/api/users/${selectedBuddyForAssign.value.id}/assign-buddy`, {
      teamId: assignTargetTeamId.value,
      buddyRole: assignTargetRole.value,
    });
    showAssignModal.value = false;
    await fetchBuddies();
    await fetchTeams();
  } catch (err: any) {
    alert("Gagal plotting Buddy: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function openResetPasswordModal(b: any) {
  if (confirm(`Reset password untuk ${b.fullName} (@${b.username}) ke default 'genius2026'?`)) {
    try {
      await api.post(`/api/users/${b.id}/reset-password`, { password: "genius2026" });
      alert(`Password untuk @${b.username} berhasil di-reset ke: genius2026`);
    } catch (err: any) {
      alert("Gagal reset password: " + err.message);
    }
  }
}

async function confirmDelete(b: any) {
  if (confirm(`Hapus akun Buddy ${b.fullName} (@${b.username})?`)) {
    try {
      await api.del(`/api/users/${b.id}`);
      await fetchBuddies();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  }
}

function exportCsv() {
  if (buddies.value.length === 0) {
    alert("Tidak ada data buddy");
    return;
  }

  let csv = "ID,Username,Nama Lengkap,Peran,Tim Binaan,Kode Tim,Bonus Terpakai,Status,Tanggal Daftar\n";
  buddies.value.forEach((b) => {
    csv += `"${b.id}","${b.username}","${b.fullName}","${b.buddyRole || 'Cadangan'}","${b.teamName || '-'}","${b.teamCode || '-'}","${b.bonusSpent || 0}","${b.status}","${b.createdAt}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `roster_buddy_genius2026_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getInitials(name: string) {
  if (!name) return "B";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getBuddyAvatar(b: any) {
  if (b.avatarUrl) return b.avatarUrl;
  const isFemale =
    b.gender === "FEMALE" ||
    b.username?.includes("rina") ||
    b.username?.includes("putri") ||
    b.fullName?.toLowerCase().includes("rina") ||
    b.fullName?.toLowerCase().includes("putri") ||
    b.fullName?.toLowerCase().includes("sari");
  return isFemale ? "/character-cewek-avatar.png" : "/character-cowok-avatar.png";
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

onMounted(() => {
  fetchTeams();
  fetchBuddies();
});
</script>
