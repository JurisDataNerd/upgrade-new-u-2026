<template>
  <div class="p-4 md:p-6 space-y-4 font-mono text-gray-200 select-none pb-12 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <NuxtLink
        to="/ormawa"
        class="pixel-btn h-8 px-3 bg-[#1c1611] border border-[#523e2b] text-[#f59e0b] hover:bg-[#2e2116] hover:border-[#f59e0b] text-xs font-pixel flex items-center gap-1.5 transition-all shadow-sm"
        title="Kembali ke Daftar Stan Ormawa"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">KEMBALI KE ORMAWA</span>
      </NuxtLink>

      <button
        v-if="booth"
        @click="openQrModal = true"
        class="pixel-btn h-8 px-3 bg-[#9333ea]/20 border border-[#c084fc] text-[#e9d5ff] hover:bg-[#9333ea]/40 text-xs font-pixel flex items-center gap-1.5 transition-all"
        title="Lihat & Cetak QR Code Stan"
      >
        <QrCode class="h-3.5 w-3.5 text-[#facc15]" />
        <span class="hidden sm:inline">KARTU QR</span>
      </button>

      <button
        v-if="booth"
        @click="openEditModal"
        class="pixel-btn h-8 px-3 bg-[#ca8a04]/20 border border-[#f59e0b] text-[#facc15] hover:bg-[#ca8a04]/40 text-xs font-pixel flex items-center gap-1.5 transition-all"
        title="Edit Data Stan"
      >
        <Pencil class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">EDIT STAN</span>
      </button>

      <button
        @click="fetchBoothDetail"
        :disabled="loading"
        class="pixel-btn h-8 w-8 bg-[#1c1611] border border-[#523e2b] text-gray-300 hover:text-white hover:border-gray-500 text-xs flex items-center justify-center transition-all"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Top Breadcrumb & Navigation Bar -->
    <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono border-b border-[#4a3624]/60 pb-2">
      <NuxtLink to="/ormawa" class="text-gray-400 hover:text-[#f59e0b]">MANAJEMEN ORMAWA</NuxtLink>
      <span>/</span>
      <span class="text-[#c084fc] font-bold uppercase truncate max-w-[200px] sm:max-w-md">
        {{ booth?.name || 'DETAIL STAN' }}
      </span>
      <span v-if="booth?.boothNumber" class="text-amber-400 font-bold">
        ({{ booth.boothNumber }})
      </span>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="loading && !booth" class="py-24 flex flex-col items-center justify-center space-y-4">
      <RotateCw class="h-10 w-10 text-[#c084fc] animate-spin" />
      <div class="font-pixel text-sm text-[#c084fc] tracking-wider animate-pulse">
        MENGHUBUNGKAN KE DATA STAN ORMAWA...
      </div>
    </div>

    <!-- 404 / Error State -->
    <div v-else-if="!booth" class="py-16 text-center space-y-3 bg-[#1e1429]/60 border border-red-500/30 rounded-lg p-6">
      <AlertTriangle class="h-12 w-12 text-red-400 mx-auto" />
      <h2 class="font-pixel text-base text-red-400">DATA STAN ORMAWA TIDAK DITEMUKAN</h2>
      <p class="text-xs text-gray-400">ID stan tidak valid atau telah dihapus dari sistem.</p>
      <NuxtLink
        to="/ormawa"
        class="inline-flex h-8 px-4 items-center gap-2 rounded bg-[#ca8a04] text-black font-pixel text-xs font-bold hover:bg-[#eab308]"
      >
        KEMBALI KE DAFTAR ORMAWA
      </NuxtLink>
    </div>

    <!-- Main Detail Content -->
    <div v-else class="space-y-4">
      <!-- 1. Hero / Profile Card Stan Ormawa -->
      <div class="pixel-card p-5 border-2 border-[#9333ea] bg-[#1a1324] relative overflow-hidden shadow-xl">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <!-- Left: Identity & Badge -->
          <div class="flex items-start sm:items-center gap-4 flex-1">
            <!-- Badge Icon -->
            <div
              class="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-lg border-2 border-[#facc15] flex items-center justify-center font-pixel text-xl md:text-2xl font-bold text-white shadow-lg"
              :style="{ backgroundColor: booth.badgeColor || '#9333ea' }"
            >
              {{ booth.shortName?.slice(0, 3) || booth.code.slice(0, 3) }}
            </div>

            <!-- Titles & Metadata -->
            <div class="space-y-2 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2 py-0.5 text-[9px] font-pixel bg-[#9333ea] text-white border border-[#c084fc] rounded">
                  {{ booth.category }}
                </span>
                <span v-if="booth.boothNumber" class="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#2b2014] text-[#facc15] border border-[#ca8a04]/60 rounded">
                  {{ booth.boothNumber }}
                </span>
                <span class="px-2 py-0.5 text-[9px] font-mono bg-[#162518] text-[#4ade80] border border-[#16a34a] rounded">
                  {{ booth.floorName ? `${booth.floorName}` : (booth.floorNumber ? `Lantai ${booth.floorNumber}` : 'Lantai 3-5') }}
                </span>
              </div>

              <h1 class="font-pixel text-base sm:text-xl lg:text-2xl text-[#facc15] font-bold tracking-wide flex flex-wrap items-center gap-2">
                <span>{{ booth.name }}</span>
                <span v-if="booth.shortName" class="text-xs sm:text-sm text-amber-300 font-mono font-normal">
                  ({{ booth.shortName }})
                </span>
              </h1>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                <span class="flex items-center gap-1 text-amber-400 font-bold">
                  <Tag class="h-3 w-3" />
                  KODE: {{ booth.code }}
                </span>
                <span v-if="booth.contactPerson" class="flex items-center gap-1 text-gray-300">
                  <Phone class="h-3 w-3 text-emerald-400" />
                  CP: {{ booth.contactPerson }}
                </span>
                <span v-if="booth.instagram" class="flex items-center gap-1 text-[#d8b4fe]">
                  <Instagram class="h-3 w-3 text-pink-400" />
                  {{ booth.instagram }}
                </span>
              </div>

              <p v-if="booth.description" class="text-xs text-gray-300 pt-1 leading-relaxed max-w-3xl font-sans">
                {{ booth.description }}
              </p>
            </div>
          </div>

          <!-- Right: Status Toggle & Token Preview -->
          <div class="flex flex-col items-start lg:items-end gap-3 shrink-0 border-t lg:border-t-0 border-[#523e2b] pt-3 lg:pt-0">
            <!-- Active Toggle -->
            <button
              @click="toggleBoothStatus"
              class="px-3 py-1 text-xs font-pixel border rounded transition-all cursor-pointer shadow flex items-center gap-1.5"
              :class="booth.isActive
                ? 'border-[#4ade80] bg-[#16351b] text-[#86efac] hover:bg-[#1f4a26]'
                : 'border-red-600 bg-[#351616] text-red-300 hover:bg-[#4a1f1f]'"
              :title="booth.isActive ? 'Klik untuk nonaktifkan stan' : 'Klik untuk aktifkan stan'"
            >
              <span class="h-2 w-2 rounded-full" :class="booth.isActive ? 'bg-[#4ade80] animate-pulse' : 'bg-red-400'"></span>
              <span>{{ booth.isActive ? 'STAN AKTIF' : 'STAN NONAKTIF' }}</span>
            </button>

            <!-- QR Token Box -->
            <div class="flex items-center gap-1.5 bg-[#140e1c] border border-[#523e2b] p-1.5 rounded">
              <code class="text-[11px] text-[#facc15] px-1 font-bold whitespace-nowrap">
                {{ booth.qrCode }}
              </code>
              <button
                @click="copyQrToken"
                class="h-6 px-2 text-[10px] font-pixel bg-[#271d15] border border-[#523e2b] text-gray-300 hover:text-white hover:bg-[#3d2d1e] rounded flex items-center gap-1 cursor-pointer shrink-0"
                title="Salin Kode Token"
              >
                <Copy class="h-3 w-3" />
                <span>{{ copied ? 'TERSALIN' : 'SALIN' }}</span>
              </button>
            </div>

            <div class="text-[11px] text-emerald-400 font-bold font-mono">
              Reward: +{{ booth.xpReward || 75 }} XP Paspor
            </div>
          </div>
        </div>
      </div>

      <!-- 2. HUD Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Total Mahasiswa Hadir -->
        <div class="pixel-card p-3 border-2 border-[#16a34a] bg-[#132215] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#4ade80] uppercase">TOTAL MAHASISWA HADIR</span>
            <Users class="h-4 w-4 text-[#4ade80]" />
          </div>
          <div class="font-pixel text-xl text-[#4ade80] font-bold">
            {{ totalAttendees }} <span class="text-xs text-[#86efac] font-mono font-normal">Maba</span>
          </div>
          <span class="text-[10px] text-[#86efac]">Telah memindai QR stan ini</span>
        </div>

        <!-- Total XP Diterima -->
        <div class="pixel-card p-3 border border-[#9333ea] bg-[#1e1329] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#c084fc] uppercase">XP EXPO TERSALUR</span>
            <Zap class="h-4 w-4 text-[#facc15]" />
          </div>
          <div class="font-pixel text-xl text-[#c084fc] font-bold">
            +{{ totalXpEarned.toLocaleString('id-ID') }} XP
          </div>
          <span class="text-[10px] text-[#e9d5ff]">Gamifikasi paspor mahasiswa</span>
        </div>

        <!-- Partisipasi Tim / Regu -->
        <div class="pixel-card p-3 border border-[#ca8a04] bg-[#221a0f] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#facc15] uppercase">PARTISIPASI REGU</span>
            <Trophy class="h-4 w-4 text-[#facc15]" />
          </div>
          <div class="font-pixel text-xl text-[#facc15] font-bold">
            {{ uniqueTeamsCount }} <span class="text-xs text-[#fde047] font-mono font-normal">Regu</span>
          </div>
          <span class="text-[10px] text-[#fde047]">Kelompok petualang yang hadir</span>
        </div>

        <!-- Nilai Reward per Scan -->
        <div class="pixel-card p-3 border border-[#523e2b] bg-[#1a140f] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-gray-400 uppercase">STANDAR REWARD</span>
            <Sparkles class="h-4 w-4 text-[#f59e0b]" />
          </div>
          <div class="font-pixel text-xl text-foreground font-bold">
            +{{ booth.xpReward || 75 }} XP
          </div>
          <span class="text-[10px] text-muted-foreground">Maksimal 10 stan per mahasiswa</span>
        </div>
      </div>

      <!-- 3. TABEL PRESENSI / ABSENSI MAHASISWA DI STAN INI -->
      <div class="space-y-3">
        <!-- Toolbar Presensi -->
        <div class="pixel-toolbar-sticky p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#1d1510] border-2 border-[#523e2b]">
          <div class="flex flex-wrap items-center gap-2 flex-1">
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="font-pixel text-xs text-[#facc15] uppercase">DAFTAR ABSEN MAHASISWA</span>
            </div>

            <!-- Search Input -->
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <Search class="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama mahasiswa atau NIM..."
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Filter by Team -->
            <select
              v-model="selectedTeam"
              class="h-8 bg-[#15100c] border border-[#523e2b] px-2 text-xs text-foreground focus:outline-none focus:border-[#c084fc]"
            >
              <option value="">Semua Regu</option>
              <option v-for="t in availableTeams" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </div>

          <!-- Actions: Export CSV & Count -->
          <div class="flex items-center justify-between sm:justify-end gap-3">
            <span class="text-xs text-muted-foreground font-mono">
              Menampilkan <strong>{{ filteredAttendees.length }}</strong> dari {{ totalAttendees }} maba
            </span>

            <button
              @click="exportAttendanceCsv"
              :disabled="attendees.length === 0"
              class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#162518] text-[#4ade80] border-[#16a34a] flex items-center gap-1.5 hover:bg-[#1f3822] cursor-pointer disabled:opacity-50"
              title="Download Data Presensi Stan CSV"
            >
              <Download class="h-3 w-3 text-[#4ade80]" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>

        <!-- Table of Attendees -->
        <div class="pixel-card border border-[#523e2b] bg-[#1a140f] overflow-hidden shadow-lg">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b-2 border-[#523e2b] bg-[#221812] text-gray-300 font-pixel text-[10px] uppercase">
                  <th class="p-3 w-12 text-center">NO</th>
                  <th class="p-3 min-w-[220px]">MAHASISWA (MABA)</th>
                  <th class="p-3 min-w-[150px]">REGU / TIM PETUALANG</th>
                  <th class="p-3 min-w-[160px]">KELAS KARAKTER</th>
                  <th class="p-3 min-w-[160px]">WAKTU SCAN ABSEN</th>
                  <th class="p-3 min-w-[100px] text-center">XP EARNED</th>
                  <th class="p-3 w-32 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#3d2d1e]">
                <tr v-if="loadingAttendees">
                  <td colspan="7" class="p-10 text-center text-muted-foreground font-mono">
                    <RotateCw class="h-6 w-6 animate-spin mx-auto mb-2 text-[#c084fc]" />
                    Memuat daftar kehadiran mahasiswa dari database...
                  </td>
                </tr>

                <tr v-else-if="filteredAttendees.length === 0">
                  <td colspan="7" class="p-12 text-center text-muted-foreground font-mono">
                    <Users class="h-10 w-10 text-gray-500 mx-auto mb-2 opacity-60" />
                    <div class="font-pixel text-xs text-gray-300">BELUM ADA MAHASISWA YANG ABSEN DI STAN INI</div>
                    <p class="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                      Mahasiswa akan langsung tercatat saat memindai QR Code paspor stan melalui Player App smartphone mereka.
                    </p>
                  </td>
                </tr>

                <tr
                  v-for="(att, idx) in filteredAttendees"
                  :key="att.scanId"
                  class="hover:bg-[#20152b] transition-colors"
                >
                  <!-- No -->
                  <td class="p-3 text-center font-mono text-gray-400">
                    {{ idx + 1 }}
                  </td>

                  <!-- Mahasiswa (Clickable to Participant Detail) -->
                  <td class="p-3">
                    <div class="flex items-center gap-2.5">
                      <div class="h-8 w-8 rounded-full border-2 border-[#523e2b] bg-[#271d15] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                        <img
                          :src="att.avatarUrl || (att.gender === 'PEREMPUAN' ? '/character-cewek-avatar.png' : '/character-cowok-avatar.png')"
                          alt="Avatar"
                          class="h-full w-full object-contain"
                        />
                      </div>
                      <div class="min-w-0">
                        <NuxtLink
                          :to="`/participants/${att.participantId}`"
                          class="font-bold text-foreground hover:text-[#facc15] truncate block cursor-pointer transition-colors"
                        >
                          {{ att.fullName }}
                        </NuxtLink>
                        <div class="font-mono text-[10px] text-amber-400">
                          NIM: {{ att.username }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Regu Petualang (Clickable to Team Detail if available) -->
                  <td class="p-3 font-mono">
                    <NuxtLink
                      v-if="att.teamId"
                      :to="`/teams/${att.teamId}`"
                      class="inline-block px-1.5 py-0.5 text-[9px] font-bold border border-[#ca8a04]/50 bg-[#2b2014] text-[#facc15] rounded hover:border-[#facc15]"
                    >
                      {{ att.teamName || 'Regu' }}
                    </NuxtLink>
                    <span
                      v-else
                      class="inline-block px-1.5 py-0.5 text-[9px] font-bold border border-gray-600 bg-black/40 text-gray-400 rounded"
                    >
                      {{ att.teamName || 'Independen' }}
                    </span>
                  </td>

                  <!-- Karakter RPG -->
                  <td class="p-3 font-mono text-[11px] text-gray-300">
                    <div class="flex items-center gap-1">
                      <span class="text-[#c084fc] font-bold">{{ att.characterClass || 'Petualang' }}</span>
                      <span v-if="att.characterTier" class="text-[10px] text-muted-foreground">
                        (T{{ att.characterTier }})
                      </span>
                    </div>
                  </td>

                  <!-- Waktu Scan Absen -->
                  <td class="p-3 font-mono">
                    <div class="text-foreground font-bold flex items-center gap-1">
                      <Clock class="h-3 w-3 text-[#f59e0b]" />
                      <span>{{ formatTime(att.scannedAt) }}</span>
                    </div>
                    <div class="text-[10px] text-muted-foreground">
                      {{ formatDate(att.scannedAt) }}
                    </div>
                  </td>

                  <!-- XP Earned -->
                  <td class="p-3 text-center font-mono font-bold text-emerald-400">
                    +{{ att.xpEarned || 75 }} XP
                  </td>

                  <!-- Status -->
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 text-[9px] font-pixel border border-[#4ade80] bg-[#16351b] text-[#86efac] rounded inline-flex items-center gap-1">
                      <CheckCircle2 class="h-3 w-3" />
                      <span>HADIR</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: PRATINJAU QR CODE STAN                                             -->
    <!-- ========================================================================= -->
    <div
      v-if="openQrModal && booth"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div class="pixel-card w-full max-w-md border-4 border-[#9333ea] bg-[#1e1429] p-5 space-y-4 shadow-2xl text-center">
        <!-- Header -->
        <div class="border-b-2 border-[#9333ea] pb-2">
          <div class="flex items-center justify-between">
            <span class="font-pixel text-[10px] font-bold text-[#c084fc]">
              ORMAWA EXPO 2026
            </span>
            <span class="border border-[#c084fc] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#facc15]">
              {{ booth.boothNumber || booth.code }}
            </span>
          </div>
          <h2 class="font-pixel text-sm text-[#facc15] mt-1 uppercase tracking-wider">
            {{ booth.name }}
          </h2>
          <p class="font-mono text-[10px] text-[#d8b4fe]">
            {{ booth.category }} • {{ booth.floorName || 'Selasar Lantai 3-5' }}
          </p>
        </div>

        <!-- Big QR Image -->
        <div class="flex flex-col items-center justify-center p-4 bg-white border-2 border-black rounded shadow-inner">
          <img
            :src="getQrImageUrl(booth.qrCode)"
            :alt="booth.code"
            class="h-56 w-56 object-contain"
          />
          <span class="font-mono text-xs text-black font-bold mt-2 tracking-wider">
            {{ booth.qrCode }}
          </span>
        </div>

        <!-- Instructions -->
        <div class="text-[10px] font-mono text-[#d8b4fe] bg-[#2a1b3a] p-2.5 border border-[#6b21a8] text-left space-y-1">
          <p class="font-bold text-[#facc15]">📱 PETUNJUK PESERTA:</p>
          <p>1. Buka player app Maba saat mengunjungi stan ini.</p>
          <p>2. Pindai QR di atas untuk mendapatkan reward +{{ booth.xpReward || 75 }} XP & paspor stan.</p>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-[#6b21a8]">
          <NuxtLink
            to="/qr-center"
            class="pixel-btn h-8 px-3 text-[10px] font-pixel bg-[#ca8a04] text-black border-[#facc15] flex items-center justify-center gap-1 hover:bg-[#eab308] cursor-pointer"
          >
            <Printer class="h-3 w-3" />
            <span>CETAK DI QR CENTER</span>
          </NuxtLink>

          <button
            @click="openQrModal = false"
            class="pixel-btn h-8 px-3 text-[10px] font-pixel bg-[#271d15] text-gray-300 border-[#523e2b] hover:bg-[#3d2d1e] cursor-pointer"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: FORM EDIT STAN ORMAWA                                              -->
    <!-- ========================================================================= -->
    <div
      v-if="showEditModal && booth"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div class="pixel-card w-full max-w-xl border-2 border-[#9333ea] bg-[#1a140f] p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-start justify-between border-b-2 border-[#523e2b] pb-3 shrink-0">
          <div>
            <span class="px-2 py-0.5 font-pixel text-[10px] bg-[#9333ea] text-white border border-[#c084fc]">
              EDIT STAN EXPO
            </span>
            <h2 class="font-pixel text-sm text-[#facc15] mt-1 uppercase tracking-wider">
              {{ formState.name }}
            </h2>
          </div>

          <button
            @click="showEditModal = false"
            class="h-7 w-7 rounded bg-[#271d15] border border-[#523e2b] text-gray-400 hover:text-white hover:bg-[#3d2d1e] flex items-center justify-center cursor-pointer"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Form Fields Scrollable -->
        <form @submit.prevent="submitBoothForm" class="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 text-xs">
          <!-- Kode Stan (Read-only) & Nomor Booth -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Kode Stan (Unik)
              </label>
              <input
                v-model="formState.code"
                disabled
                type="text"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground uppercase opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Nomor Booth
              </label>
              <input
                v-model="formState.boothNumber"
                type="text"
                placeholder="misal: BOOTH E3-01"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>
          </div>

          <!-- Nama Stan & Singkatan -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Nama Lengkap Ormawa / UKM <span class="text-red-400">*</span>
              </label>
              <input
                v-model="formState.name"
                type="text"
                required
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Singkatan
              </label>
              <input
                v-model="formState.shortName"
                type="text"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground uppercase placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>
          </div>

          <!-- Kategori & Lantai -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Kategori Ormawa <span class="text-red-400">*</span>
              </label>
              <input
                v-model="formState.category"
                type="text"
                required
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Lokasi Lantai Kampus
              </label>
              <select
                v-model="formState.floorId"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#c084fc]"
              >
                <option :value="null">Pilih Lantai...</option>
                <option v-for="f in floors" :key="f.id" :value="f.id">
                  Lantai {{ f.number }} — {{ f.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Deskripsi Stan -->
          <div>
            <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
              Deskripsi & Program Kerja Singkat
            </label>
            <textarea
              v-model="formState.description"
              rows="2"
              placeholder="Jelaskan bidang kegiatan stan..."
              class="w-full bg-[#15100c] border border-[#523e2b] p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
            ></textarea>
          </div>

          <!-- Token QR & XP Reward -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Token QR Code Fisik
              </label>
              <input
                v-model="formState.qrCode"
                type="text"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Reward XP Maba
              </label>
              <input
                v-model.number="formState.xpReward"
                type="number"
                min="0"
                step="5"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>
          </div>

          <!-- Kontak & Instagram -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Narahubung / CP
              </label>
              <input
                v-model="formState.contactPerson"
                type="text"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Instagram / Medsos
              </label>
              <input
                v-model="formState.instagram"
                type="text"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>
          </div>

          <!-- Status Switch -->
          <div class="pt-2 border-t border-[#4a3624] flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsActiveCheck"
              v-model="formState.isActive"
              class="h-4 w-4 rounded accent-[#9333ea]"
            />
            <label for="editIsActiveCheck" class="text-xs text-gray-200 cursor-pointer">
              Stan aktif dan dapat dipindai oleh mahasiswa saat Expo
            </label>
          </div>

          <!-- Modal Action Buttons -->
          <div class="pt-4 border-t border-[#523e2b] flex items-center justify-end gap-2">
            <button
              type="button"
              @click="showEditModal = false"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#271d15] text-gray-300 border-[#523e2b] hover:bg-[#3d2d1e] cursor-pointer"
            >
              BATAL
            </button>
            <button
              type="submit"
              :disabled="savingForm"
              class="pixel-btn h-8 px-5 text-xs font-pixel font-bold bg-[#9333ea] text-white border-[#c084fc] hover:bg-[#a855f7] cursor-pointer shadow flex items-center gap-1.5"
            >
              <RotateCw v-if="savingForm" class="h-3 w-3 animate-spin" />
              <span>SIMPAN PERUBAHAN</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  ArrowLeft,
  Store,
  Users,
  Pencil,
  RotateCw,
  QrCode,
  Search,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  Trophy,
  Zap,
  Download,
  Printer,
  Copy,
  Tag,
  Phone,
  Instagram,
  AlertTriangle,
} from "lucide-vue-next";
import { useApi } from "@/composables/useApi";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const api = useApi();
const toast = useToast();
const boothId = computed(() => route.params.id as string);

// State
const loading = ref(false);
const loadingAttendees = ref(false);
const booth = ref<any>(null);
const attendees = ref<any[]>([]);
const floors = ref<any[]>([]);

// Filter states
const searchQuery = ref("");
const selectedTeam = ref("");
const copied = ref(false);

// Modals
const openQrModal = ref(false);
const showEditModal = ref(false);
const savingForm = ref(false);
const formState = reactive({
  code: "",
  name: "",
  shortName: "",
  category: "",
  floorId: null as string | null,
  boothNumber: "",
  description: "",
  qrCode: "",
  xpReward: 75,
  contactPerson: "",
  instagram: "",
  isActive: true,
});

// Computed Available Teams
const availableTeams = computed(() => {
  const set = new Set<string>();
  attendees.value.forEach((a) => {
    if (a.teamName) set.add(a.teamName);
  });
  return Array.from(set).sort();
});

// Filtered Attendees
const filteredAttendees = computed(() => {
  return attendees.value.filter((a) => {
    if (selectedTeam.value && a.teamName !== selectedTeam.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchName = a.fullName?.toLowerCase().includes(q);
      const matchNim = a.username?.toLowerCase().includes(q);
      const matchTeam = a.teamName?.toLowerCase().includes(q);
      if (!matchName && !matchNim && !matchTeam) return false;
    }
    return true;
  });
});

// Metrics
const totalAttendees = computed(() => attendees.value.length);
const totalXpEarned = computed(() => {
  return attendees.value.reduce((acc, a) => acc + (a.xpEarned || 75), 0);
});
const uniqueTeamsCount = computed(() => availableTeams.value.length);

// Data Fetching
async function fetchFloors() {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/floors");
    if (res?.success && Array.isArray(res.data)) {
      floors.value = res.data;
    }
  } catch (err) {
    console.error("Gagal memuat data lantai:", err);
  }
}

async function fetchBoothDetail() {
  if (!boothId.value) return;
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any }>(`/api/ormawa/booths/${boothId.value}`);
    if (res?.success && res.data) {
      booth.value = res.data;
    }
  } catch (err) {
    console.error("Gagal memuat detail stan ormawa:", err);
    booth.value = null;
  } finally {
    loading.value = false;
  }
}

async function fetchAttendees() {
  if (!boothId.value) return;
  loadingAttendees.value = true;
  try {
    const res = await api.get<{ success: boolean; data: { attendees: any[] } }>(`/api/ormawa/booths/${boothId.value}/visitors`);
    if (res?.success && res.data?.attendees) {
      attendees.value = res.data.attendees;
    }
  } catch (err) {
    console.error("Gagal memuat rekap presensi stan:", err);
  } finally {
    loadingAttendees.value = false;
  }
}

// Actions
async function toggleBoothStatus() {
  if (!booth.value) return;
  const newStatus = !booth.value.isActive;
  try {
    await api.put(`/api/ormawa/booths/${booth.value.id}`, { isActive: newStatus });
    booth.value.isActive = newStatus;
    toast.info(
      newStatus ? "Stan Diaktifkan" : "Stan Dinonaktifkan",
      `Status stan "${booth.value.name}" telah diubah menjadi ${newStatus ? 'aktif' : 'nonaktif'}.`
    );
  } catch (err) {
    console.error("Gagal mengubah status stan:", err);
    toast.error("Gagal Mengubah Status", "Gagal mengubah status stan.");
  }
}

function openEditModal() {
  if (!booth.value) return;
  formState.code = booth.value.code;
  formState.name = booth.value.name;
  formState.shortName = booth.value.shortName || "";
  formState.category = booth.value.category;
  formState.floorId = booth.value.floorId || null;
  formState.boothNumber = booth.value.boothNumber || "";
  formState.description = booth.value.description || "";
  formState.qrCode = booth.value.qrCode || "";
  formState.xpReward = booth.value.xpReward || 75;
  formState.contactPerson = booth.value.contactPerson || "";
  formState.instagram = booth.value.instagram || "";
  formState.isActive = booth.value.isActive;
  showEditModal.value = true;
}

async function submitBoothForm() {
  if (!booth.value) return;
  savingForm.value = true;
  try {
    const res = await api.put(`/api/ormawa/booths/${booth.value.id}`, {
      name: formState.name,
      shortName: formState.shortName || null,
      category: formState.category,
      floorId: formState.floorId || null,
      boothNumber: formState.boothNumber || null,
      description: formState.description || null,
      qrCode: formState.qrCode || undefined,
      xpReward: formState.xpReward,
      contactPerson: formState.contactPerson || null,
      instagram: formState.instagram || null,
      isActive: formState.isActive,
    });

    if (res?.success && res.data) {
      booth.value = { ...booth.value, ...res.data };
    }
    showEditModal.value = false;
    toast.success("Perubahan Disimpan!", `Informasi stan "${formState.name}" berhasil diperbarui.`);
    await fetchBoothDetail();
  } catch (err: any) {
    toast.error("Gagal Menyimpan Perubahan", err?.data?.error?.message || err?.message || "Gagal menyimpan perubahan stan.");
  } finally {
    savingForm.value = false;
  }
}

function copyQrToken() {
  if (!booth.value?.qrCode) return;
  navigator.clipboard.writeText(booth.value.qrCode);
  copied.value = true;
  toast.success("Token Tersalin!", `Token QR "${booth.value.qrCode}" disalin ke clipboard.`);
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function getQrImageUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(code || '')}`;
}

// CSV Export
function exportAttendanceCsv() {
  if (!booth.value || attendees.value.length === 0) return;
  const headers = ["No", "NIM", "Nama Lengkap", "Regu / Tim", "Kelas Karakter", "Tier", "Waktu Scan", "XP Didapat"];
  const rows = attendees.value.map((a, i) => [
    i + 1,
    `"${a.username}"`,
    `"${a.fullName}"`,
    `"${a.teamName || 'Independen'}"`,
    `"${a.characterClass || 'Petualang'}"`,
    `"Tier ${a.characterTier || 1}"`,
    `"${formatDateTime(a.scannedAt)}"`,
    a.xpEarned || 75,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PRESENSI_ORMAWA_${booth.value.code}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Formatters
function formatTime(isoString: string) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(isoString: string) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(isoString: string) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return `${d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
}

onMounted(() => {
  fetchFloors();
  fetchBoothDetail();
  fetchAttendees();
});
</script>
