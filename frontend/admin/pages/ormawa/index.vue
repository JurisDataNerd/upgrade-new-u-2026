<template>
  <div class="flex-1 flex flex-col min-h-0 select-none font-mono">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        @click="openCreateModal"
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#9333ea] text-white border-[#c084fc] flex items-center gap-1.5 hover:bg-[#a855f7] cursor-pointer shadow"
        title="Daftarkan Stan Baru"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline font-pixel">TAMBAH STAN EXPO</span>
      </button>

      <NuxtLink
        to="/qr-center"
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#271d15] text-[#facc15] border-[#ca8a04] flex items-center gap-1.5 hover:bg-[#3d2d1e] cursor-pointer"
        title="Buka QR Print Center"
      >
        <QrCode class="h-3.5 w-3.5 text-[#f59e0b]" />
        <span class="hidden md:inline font-pixel text-[11px]">QR PRINT CENTER</span>
      </NuxtLink>

      <button
        @click="handleRefresh"
        :disabled="loading"
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e] cursor-pointer"
        title="Segarkan Data"
      >
        <RotateCw class="h-3.5 w-3.5" :class="{ 'animate-spin': loading }" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Header -->
    <div class="px-4 md:px-6 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#4a3624]/60 text-xs text-muted-foreground">
      <div>
        <h1 class="font-pixel text-xs sm:text-sm text-[#f59e0b] font-bold uppercase tracking-wider flex items-center gap-2">
          <Store class="h-4 w-4 text-[#c084fc]" />
          <span>MANAJEMEN ORMAWA & UKM EXPO (HARI 3)</span>
        </h1>
        <p class="text-[11px] text-gray-400 mt-0.5">
          Pusat kendali stan kemahasiswaan, monitoring kehadiran/absen stan real-time, pencetakan QR paspor, dan evaluasi kunjungan Maba.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-[#9333ea]/60 bg-[#251538] px-2.5 py-1 text-[10px] font-pixel text-[#c084fc] flex items-center gap-1.5">
          <Sparkles class="h-3 w-3 text-[#facc15]" />
          DAY 3 EXPO
        </span>
        <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-2.5 py-1 text-[10px] font-pixel text-[#facc15] flex items-center gap-1.5">
          <Users class="h-3 w-3 text-[#f59e0b]" />
          {{ totalVisitsCount }} KUNJUNGAN
        </span>
      </div>
    </div>

    <!-- Main Scrollable Content Area -->
    <div class="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
      <!-- 1. Stats HUD Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Total Stan Aktif -->
        <div class="pixel-card p-3 border border-[#523e2b] bg-[#1a140f] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-gray-400 uppercase">STAN TERDAFTAR</span>
            <Store class="h-3.5 w-3.5 text-[#c084fc]" />
          </div>
          <div class="font-pixel text-lg text-foreground font-bold">
            {{ activeBoothsCount }} <span class="text-xs text-muted-foreground font-mono font-normal">/ {{ booths.length }} Aktif</span>
          </div>
          <span class="text-[10px] text-muted-foreground">Stan UKM & Komunitas UNU</span>
        </div>

        <!-- Total Kunjungan Maba -->
        <div class="pixel-card p-3 border border-[#16a34a] bg-[#132215] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#4ade80] uppercase">TOTAL KUNJUNGAN</span>
            <CheckCircle2 class="h-3.5 w-3.5 text-[#4ade80]" />
          </div>
          <div class="font-pixel text-lg text-[#4ade80] font-bold">
            {{ totalVisitsCount }}
          </div>
          <span class="text-[10px] text-[#86efac]">Scan QR Paspor Maba Berhasil</span>
        </div>

        <!-- Stan Terpopuler -->
        <div class="pixel-card p-3 border border-[#ca8a04] bg-[#221a0f] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#facc15] uppercase">STAN TERFAVORIT</span>
            <Trophy class="h-3.5 w-3.5 text-[#facc15]" />
          </div>
          <div class="font-pixel text-xs text-[#facc15] font-bold truncate" :title="topBooth?.name || 'Belum ada data'">
            {{ topBooth?.name || "Belum ada kunjungan" }}
          </div>
          <span class="text-[10px] text-[#fde047]">
            {{ topBooth ? `${topBooth.visitorCount} Pengunjung` : 'Menunggu pemindaian' }}
          </span>
        </div>

        <!-- Total XP Expo Terdistribusi -->
        <div class="pixel-card p-3 border border-[#9333ea] bg-[#1e1329] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-pixel text-[#c084fc] uppercase">XP TERDISTRIBUSI</span>
            <Zap class="h-3.5 w-3.5 text-[#facc15]" />
          </div>
          <div class="font-pixel text-lg text-[#c084fc] font-bold">
            +{{ totalXpDistributed.toLocaleString('id-ID') }} XP
          </div>
          <span class="text-[10px] text-[#e9d5ff]">Bonus paspor kemahasiswaan</span>
        </div>
      </div>

      <!-- 2. Main Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-[#4a3624]/60 pb-1 text-xs">
        <button
          @click="activeTab = 'booths'"
          :class="[
            'h-9 px-4 rounded font-pixel text-[10px] sm:text-xs flex items-center gap-2 border transition-all cursor-pointer',
            activeTab === 'booths'
              ? 'bg-[#9333ea] text-white border-[#c084fc] font-bold shadow-md'
              : 'bg-[#1e1429] text-gray-300 border-[#523e2b] hover:border-[#c084fc]'
          ]"
        >
          <Store class="h-3.5 w-3.5" />
          <span>DAFTAR STAN & PRESENSI PER STAN ({{ booths.length }})</span>
        </button>

        <button
          @click="activeTab = 'visitors'"
          :class="[
            'h-9 px-4 rounded font-pixel text-[10px] sm:text-xs flex items-center gap-2 border transition-all cursor-pointer',
            activeTab === 'visitors'
              ? 'bg-[#ca8a04] text-black border-[#facc15] font-bold shadow-md'
              : 'bg-[#271d15] text-gray-300 border-[#523e2b] hover:border-[#f59e0b]'
          ]"
        >
          <Clock class="h-3.5 w-3.5" />
          <span>STREAM ABSENSI REALTIME ({{ recentScans.length }})</span>
        </button>
      </div>

      <!-- ================= TAB 1: MANAJEMEN STAN & PRESENSI PER STAN ================= -->
      <div v-if="activeTab === 'booths'" class="space-y-3">
        <!-- Filter Toolbar -->
        <div class="pixel-toolbar-sticky p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#1d1510] border border-[#523e2b]">
          <div class="flex flex-wrap items-center gap-2 flex-1">
            <!-- Search Bar -->
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <Search class="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama ormawa, kode stan, nomor booth..."
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Floor Filter -->
            <select
              v-model="selectedFloor"
              class="h-8 bg-[#15100c] border border-[#523e2b] px-2 text-xs text-foreground focus:outline-none focus:border-[#c084fc]"
            >
              <option :value="0">Semua Lantai</option>
              <option v-for="f in floors" :key="f.id" :value="f.number">
                Lantai {{ f.number }} ({{ f.name }})
              </option>
            </select>

            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              class="h-8 bg-[#15100c] border border-[#523e2b] px-2 text-xs text-foreground focus:outline-none focus:border-[#c084fc]"
            >
              <option value="">Semua Kategori</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>

            <!-- Status Filter -->
            <select
              v-model="selectedStatus"
              class="h-8 bg-[#15100c] border border-[#523e2b] px-2 text-xs text-foreground focus:outline-none focus:border-[#c084fc]"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground font-mono">
            <span>Menampilkan <strong>{{ filteredBooths.length }}</strong> dari {{ booths.length }} stan</span>
          </div>
        </div>

        <!-- Table / Grid of Booths -->
        <div class="pixel-card border border-[#523e2b] bg-[#1a140f] overflow-hidden">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b-2 border-[#523e2b] bg-[#221812] text-gray-300 font-pixel text-[10px] uppercase">
                  <th class="p-3 w-12 text-center">NO</th>
                  <th class="p-3 min-w-[220px]">STAN & KODE ORMAWA</th>
                  <th class="p-3 min-w-[140px]">KATEGORI & LOKASI</th>
                  <th class="p-3 min-w-[160px]">TOKEN QR CODE</th>
                  <th class="p-3 min-w-[190px] text-center bg-[#281c33] text-[#facc15] border-x border-[#523e2b]">
                    DETAIL & ABSENSI MABA
                  </th>
                  <th class="p-3 w-28 text-center">STATUS</th>
                  <th class="p-3 w-32 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#3d2d1e]">
                <tr v-if="loading && booths.length === 0">
                  <td colspan="7" class="p-8 text-center text-muted-foreground font-mono">
                    <RotateCw class="h-6 w-6 animate-spin mx-auto mb-2 text-[#c084fc]" />
                    Memuat data stan ormawa dari database...
                  </td>
                </tr>

                <tr v-else-if="filteredBooths.length === 0">
                  <td colspan="7" class="p-8 text-center text-muted-foreground font-mono">
                    <Store class="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    Tidak ada stan ormawa yang sesuai dengan filter.
                  </td>
                </tr>

                <tr
                  v-for="(booth, idx) in filteredBooths"
                  :key="booth.id"
                  class="hover:bg-[#241a13] transition-colors"
                >
                  <!-- No -->
                  <td class="p-3 text-center font-mono text-gray-400">
                    {{ idx + 1 }}
                  </td>

                  <!-- Stan & Kode (Clickable to Detail) -->
                  <td class="p-3">
                    <div class="flex items-start gap-2.5">
                      <NuxtLink
                        :to="`/ormawa/${booth.id}`"
                        class="h-8 w-8 shrink-0 rounded border flex items-center justify-center font-pixel text-xs font-bold text-white shadow-sm mt-0.5 hover:scale-105 transition-transform"
                        :style="{ backgroundColor: booth.badgeColor || '#9333ea', borderColor: '#facc15' }"
                        :title="`Buka detail ${booth.name}`"
                      >
                        {{ booth.shortName?.slice(0, 2) || booth.code.slice(0, 2) }}
                      </NuxtLink>
                      <div class="min-w-0">
                        <NuxtLink
                          :to="`/ormawa/${booth.id}`"
                          class="font-bold text-foreground hover:text-[#facc15] transition-colors flex items-center gap-1.5 flex-wrap cursor-pointer"
                        >
                          <span>{{ booth.name }}</span>
                          <span v-if="booth.shortName" class="text-[10px] font-mono px-1 py-0.2 bg-[#2d1f14] border border-[#523e2b] text-amber-300">
                            {{ booth.shortName }}
                          </span>
                        </NuxtLink>
                        <div class="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono">
                          <span class="text-amber-400 font-bold">{{ booth.code }}</span>
                          <span>•</span>
                          <span class="text-[#c084fc] font-bold">{{ booth.boothNumber || 'BOOTH EXPO' }}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Kategori & Lokasi -->
                  <td class="p-3 font-mono">
                    <div class="inline-block px-1.5 py-0.5 text-[9px] font-bold border border-[#9333ea]/50 bg-[#2d153e] text-[#d8b4fe] rounded mb-1">
                      {{ booth.category }}
                    </div>
                    <div class="text-[11px] text-gray-300">
                      {{ booth.floorName ? `${booth.floorName}` : (booth.floorNumber ? `Lantai ${booth.floorNumber}` : 'Lantai 3-5') }}
                    </div>
                    <div v-if="booth.description" class="text-[10px] text-muted-foreground truncate max-w-[180px]" :title="booth.description">
                      {{ booth.description }}
                    </div>
                  </td>

                  <!-- Token QR Code -->
                  <td class="p-3 font-mono">
                    <div class="flex items-center gap-1.5">
                      <code class="text-[10px] bg-[#130e0a] px-1.5 py-0.5 border border-[#4a3624] text-[#facc15] truncate max-w-[120px]" :title="booth.qrCode">
                        {{ booth.qrCode }}
                      </code>
                      <button
                        @click="openQrPreview(booth)"
                        class="h-6 w-6 rounded bg-[#271d15] border border-[#523e2b] text-[#f59e0b] hover:bg-[#3d2d1e] flex items-center justify-center shrink-0 cursor-pointer"
                        title="Lihat QR Code Fisik"
                      >
                        <QrCode class="h-3 w-3" />
                      </button>
                    </div>
                    <div class="text-[10px] text-emerald-400 mt-1 font-bold">
                      +{{ booth.xpReward || 75 }} XP Reward
                    </div>
                  </td>

                  <!-- DETAIL & PRESENSI / ABSEN MAHASISWA -->
                  <td class="p-3 text-center bg-[#20152b] border-x border-[#523e2b]">
                    <NuxtLink
                      :to="`/ormawa/${booth.id}`"
                      class="pixel-btn h-8 px-3 text-[11px] font-pixel w-full flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-sm"
                      :class="booth.visitorCount > 0
                        ? 'bg-[#16a34a] text-white border-[#4ade80] hover:bg-[#15803d]'
                        : 'bg-[#271d15] text-gray-300 border-[#523e2b] hover:border-[#facc15]'"
                      :title="`Buka detail stan & daftar hadir maba di ${booth.name}`"
                    >
                      <Users class="h-3.5 w-3.5" />
                      <span>DETAIL & ABSEN ({{ booth.visitorCount }}) ➔</span>
                    </NuxtLink>
                    <div class="text-[9px] text-gray-400 font-mono mt-1">
                      {{ booth.visitorCount > 0 ? `${booth.visitorCount} maba telah absen` : 'Belum ada maba scan' }}
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="p-3 text-center">
                    <button
                      @click="toggleBoothStatus(booth)"
                      class="px-2 py-0.5 text-[9px] font-pixel border rounded transition-colors cursor-pointer"
                      :class="booth.isActive
                        ? 'border-[#4ade80] bg-[#16351b] text-[#86efac] hover:bg-[#1f4a26]'
                        : 'border-red-600 bg-[#351616] text-red-300 hover:bg-[#4a1f1f]'"
                      :title="booth.isActive ? 'Klik untuk nonaktifkan stan' : 'Klik untuk aktifkan stan'"
                    >
                      {{ booth.isActive ? '● AKTIF' : '○ NONAKTIF' }}
                    </button>
                  </td>

                  <!-- Aksi -->
                  <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <!-- Go to Detail -->
                      <NuxtLink
                        :to="`/ormawa/${booth.id}`"
                        class="h-7 w-7 rounded bg-[#271d15] border border-[#523e2b] text-[#c084fc] hover:bg-[#3d2d1e] hover:border-[#c084fc] flex items-center justify-center cursor-pointer"
                        title="Buka Halaman Detail Stan"
                      >
                        <ExternalLink class="h-3 w-3" />
                      </NuxtLink>

                      <!-- Edit -->
                      <button
                        @click="openEditModal(booth)"
                        class="h-7 w-7 rounded bg-[#271d15] border border-[#523e2b] text-[#f59e0b] hover:bg-[#3d2d1e] hover:border-[#f59e0b] flex items-center justify-center cursor-pointer"
                        title="Edit Stan"
                      >
                        <Pencil class="h-3 w-3" />
                      </button>

                      <!-- Delete -->
                      <button
                        @click="confirmDelete(booth)"
                        class="h-7 w-7 rounded bg-[#271d15] border border-[#523e2b] text-red-400 hover:bg-red-950/40 hover:border-red-500 flex items-center justify-center cursor-pointer"
                        title="Hapus Stan"
                      >
                        <Trash2 class="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= TAB 2: STREAM ABSENSI REALTIME ================= -->
      <div v-else-if="activeTab === 'visitors'" class="space-y-3">
        <!-- Visitor Toolbar -->
        <div class="pixel-toolbar-sticky p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#1d1510] border border-[#523e2b]">
          <div class="flex flex-wrap items-center gap-2 flex-1">
            <!-- Search Bar -->
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <Search class="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="visitorSearchQuery"
                type="text"
                placeholder="Cari nama mahasiswa, NIM, regu, atau stan..."
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#ca8a04]"
              />
            </div>

            <!-- Filter by Booth -->
            <select
              v-model="visitorSelectedBooth"
              class="h-8 bg-[#15100c] border border-[#523e2b] px-2 text-xs text-foreground focus:outline-none focus:border-[#ca8a04]"
            >
              <option value="">Semua Stan Ormawa</option>
              <option v-for="b in booths" :key="b.id" :value="b.id">
                {{ b.name }} ({{ b.boothNumber || b.code }})
              </option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="exportVisitorsCsv"
              class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#162518] text-[#4ade80] border-[#16a34a] flex items-center gap-1.5 hover:bg-[#1f3822] cursor-pointer"
              title="Download Data Kunjungan CSV"
            >
              <Download class="h-3 w-3 text-[#4ade80]" />
              <span>EXPORT REKAP (CSV)</span>
            </button>
          </div>
        </div>

        <!-- Realtime Scans Table -->
        <div class="pixel-card border border-[#523e2b] bg-[#1a140f] overflow-hidden">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b-2 border-[#523e2b] bg-[#221812] text-gray-300 font-pixel text-[10px] uppercase">
                  <th class="p-3 w-12 text-center">NO</th>
                  <th class="p-3 min-w-[140px]">WAKTU SCAN</th>
                  <th class="p-3 min-w-[220px]">MAHASISWA (MABA)</th>
                  <th class="p-3 min-w-[140px]">REGU / TIM PETUALANG</th>
                  <th class="p-3 min-w-[220px]">STAN YANG DIKUNJUNGI</th>
                  <th class="p-3 min-w-[100px] text-center">XP EARNED</th>
                  <th class="p-3 w-28 text-center">STATUS VERIFIKASI</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#3d2d1e]">
                <tr v-if="loadingRecentScans">
                  <td colspan="7" class="p-8 text-center text-muted-foreground font-mono">
                    <RotateCw class="h-6 w-6 animate-spin mx-auto mb-2 text-[#ca8a04]" />
                    Memuat log presensi maba dari database...
                  </td>
                </tr>

                <tr v-else-if="filteredRecentScans.length === 0">
                  <td colspan="7" class="p-8 text-center text-muted-foreground font-mono">
                    <Users class="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    Belum ada riwayat absensi atau scan stan tercatat.
                  </td>
                </tr>

                <tr
                  v-for="(scan, idx) in filteredRecentScans"
                  :key="scan.scanId"
                  class="hover:bg-[#241a13] transition-colors"
                >
                  <!-- No -->
                  <td class="p-3 text-center font-mono text-gray-400">
                    {{ idx + 1 }}
                  </td>

                  <!-- Waktu Scan -->
                  <td class="p-3 font-mono">
                    <div class="text-foreground font-bold flex items-center gap-1">
                      <Clock class="h-3 w-3 text-[#f59e0b]" />
                      <span>{{ formatTime(scan.scannedAt) }}</span>
                    </div>
                    <div class="text-[10px] text-muted-foreground">
                      {{ formatDate(scan.scannedAt) }}
                    </div>
                  </td>

                  <!-- Mahasiswa -->
                  <td class="p-3">
                    <div class="flex items-center gap-2.5">
                      <div class="h-7 w-7 rounded-full border border-[#523e2b] bg-[#271d15] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                        <img
                          :src="scan.avatarUrl || (scan.gender === 'PEREMPUAN' ? '/character-cewek-avatar.png' : '/character-cowok-avatar.png')"
                          alt="Avatar"
                          class="h-full w-full object-contain"
                        />
                      </div>
                      <div class="min-w-0">
                        <NuxtLink
                          :to="`/participants/${scan.participantId}`"
                          class="font-bold text-foreground hover:text-[#facc15] truncate block"
                        >
                          {{ scan.fullName }}
                        </NuxtLink>
                        <div class="font-mono text-[10px] text-amber-400">
                          NIM: {{ scan.username }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Regu -->
                  <td class="p-3 font-mono">
                    <div class="inline-block px-1.5 py-0.5 text-[9px] font-bold border border-[#ca8a04]/50 bg-[#2b2014] text-[#facc15] rounded">
                      {{ scan.teamName || 'Independen' }}
                    </div>
                  </td>

                  <!-- Stan (Clickable to Detail) -->
                  <td class="p-3">
                    <NuxtLink
                      :to="`/ormawa/${scan.boothId}`"
                      class="font-bold text-foreground hover:text-[#c084fc] flex items-center gap-1.5 flex-wrap"
                    >
                      <span>{{ scan.boothName }}</span>
                      <span class="text-[9px] font-mono px-1 py-0.2 bg-[#2d153e] border border-[#9333ea]/50 text-[#d8b4fe]">
                        {{ scan.boothNumber || scan.boothCode }}
                      </span>
                    </NuxtLink>
                    <div class="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Kategori: {{ scan.category }}
                    </div>
                  </td>

                  <!-- XP -->
                  <td class="p-3 text-center font-mono font-bold text-emerald-400">
                    +{{ scan.xpEarned || 75 }} XP
                  </td>

                  <!-- Status -->
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 text-[9px] font-pixel border border-[#4ade80] bg-[#16351b] text-[#86efac] rounded">
                      TERCATAT
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
    <!-- MODAL: FORM TAMBAH / EDIT STAN ORMAWA                                     -->
    <!-- ========================================================================= -->
    <div
      v-if="showFormModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div class="pixel-card w-full max-w-xl border-2 border-[#9333ea] bg-[#1a140f] p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-start justify-between border-b-2 border-[#523e2b] pb-3 shrink-0">
          <div>
            <span class="px-2 py-0.5 font-pixel text-[10px] bg-[#9333ea] text-white border border-[#c084fc]">
              {{ isEditing ? 'EDIT STAN EXPO' : 'TAMBAH STAN BARU' }}
            </span>
            <h2 class="font-pixel text-sm text-[#facc15] mt-1 uppercase tracking-wider">
              {{ isEditing ? formState.name : 'Daftarkan Stan Ormawa / UKM' }}
            </h2>
          </div>

          <button
            @click="showFormModal = false"
            class="h-7 w-7 rounded bg-[#271d15] border border-[#523e2b] text-gray-400 hover:text-white hover:bg-[#3d2d1e] flex items-center justify-center cursor-pointer"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Form Fields Scrollable -->
        <form @submit.prevent="submitBoothForm" class="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 text-xs">
          <!-- Kode Stan & Nomor Booth -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-pixel text-[10px] text-gray-300 mb-1 uppercase">
                Kode Stan (Unik) <span class="text-red-400">*</span>
              </label>
              <input
                v-model="formState.code"
                :disabled="isEditing"
                type="text"
                placeholder="misal: UKM-ROBOTIK"
                required
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground uppercase placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc] disabled:opacity-60"
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
                placeholder="misal: Komunitas Robotika & AI UNU"
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
                placeholder="ROBOTIKA"
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
                list="categoryList"
                placeholder="Pilih atau ketik kategori..."
                required
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
              <datalist id="categoryList">
                <option value="Sains & Teknologi" />
                <option value="Olahraga & Beladiri" />
                <option value="Seni & Paduan Suara" />
                <option value="Seni Pertunjukan & Sastra" />
                <option value="Sosial & Kemanusiaan" />
                <option value="Lingkungan & Alam" />
                <option value="Keagamaan & Dakwah" />
                <option value="Penelitian & Penalaran" />
              </datalist>
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
              placeholder="Jelaskan bidang kegiatan atau karya yang dipamerkan di stan..."
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
                placeholder="Kosongkan untuk auto-generate"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
              <span class="text-[9px] text-muted-foreground font-mono">Otomatis jika dibiarkan kosong</span>
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
                placeholder="75"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
              <span class="text-[9px] text-emerald-400 font-mono">Standar: +75 XP (maks 10 stan)</span>
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
                placeholder="misal: Kak Rizky (08123456789)"
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
                placeholder="@unu_robotik"
                class="h-8 w-full bg-[#15100c] border border-[#523e2b] px-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#c084fc]"
              />
            </div>
          </div>

          <!-- Status Switch -->
          <div class="pt-2 border-t border-[#4a3624] flex items-center gap-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              v-model="formState.isActive"
              class="h-4 w-4 rounded accent-[#9333ea]"
            />
            <label for="isActiveCheck" class="text-xs text-gray-200 cursor-pointer">
              Stan aktif dan dapat dipindai oleh mahasiswa saat Expo
            </label>
          </div>

          <!-- Modal Action Buttons -->
          <div class="pt-4 border-t border-[#523e2b] flex items-center justify-end gap-2">
            <button
              type="button"
              @click="showFormModal = false"
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
              <span>{{ isEditing ? 'SIMPAN PERUBAHAN' : 'BUAT STAN BARU' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: PRATINJAU QR CODE STAN                                             -->
    <!-- ========================================================================= -->
    <div
      v-if="showQrModal && selectedBoothForQr"
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
              {{ selectedBoothForQr.boothNumber || selectedBoothForQr.code }}
            </span>
          </div>
          <h2 class="font-pixel text-sm text-[#facc15] mt-1 uppercase tracking-wider">
            {{ selectedBoothForQr.name }}
          </h2>
          <p class="font-mono text-[10px] text-[#d8b4fe]">
            {{ selectedBoothForQr.category }} • {{ selectedBoothForQr.floorName || 'Selasar Lantai 3-5' }}
          </p>
        </div>

        <!-- Big QR Image -->
        <div class="flex flex-col items-center justify-center p-4 bg-white border-2 border-black rounded shadow-inner">
          <img
            :src="getQrImageUrl(selectedBoothForQr.qrCode)"
            :alt="selectedBoothForQr.code"
            class="h-56 w-56 object-contain"
          />
          <span class="font-mono text-xs text-black font-bold mt-2 tracking-wider">
            {{ selectedBoothForQr.qrCode }}
          </span>
        </div>

        <!-- Instructions -->
        <div class="text-[10px] font-mono text-[#d8b4fe] bg-[#2a1b3a] p-2.5 border border-[#6b21a8] text-left space-y-1">
          <p class="font-bold text-[#facc15]">📱 PETUNJUK PESERTA:</p>
          <p>1. Buka player app Maba saat mengunjungi stan ini.</p>
          <p>2. Pindai QR di atas untuk mendapatkan reward +{{ selectedBoothForQr.xpReward || 75 }} XP & paspor stan.</p>
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
            @click="showQrModal = false"
            class="pixel-btn h-8 px-3 text-[10px] font-pixel bg-[#271d15] text-gray-300 border-[#523e2b] hover:bg-[#3d2d1e] cursor-pointer"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  Store,
  Users,
  Plus,
  RotateCw,
  QrCode,
  Search,
  Pencil,
  Trash2,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  Trophy,
  Zap,
  Download,
  Printer,
  ExternalLink,
} from "lucide-vue-next";
import { useApi } from "@/composables/useApi";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";

const api = useApi();
const toast = useToast();
const confirmModal = useConfirm();

// Active Tab
const activeTab = ref<"booths" | "visitors">("booths");
const loading = ref(false);

// State Data
const booths = ref<any[]>([]);
const floors = ref<any[]>([]);
const recentScans = ref<any[]>([]);
const loadingRecentScans = ref(false);

// Filters for Booths
const searchQuery = ref("");
const selectedFloor = ref(0);
const selectedCategory = ref("");
const selectedStatus = ref("all");

// Filters for Visitors Tab
const visitorSearchQuery = ref("");
const visitorSelectedBooth = ref("");

// QR Code Preview Modal State
const showQrModal = ref(false);
const selectedBoothForQr = ref<any>(null);

// Form Modal State
const showFormModal = ref(false);
const isEditing = ref(false);
const savingForm = ref(false);
const formState = reactive({
  id: "",
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

// Computed Available Categories
const availableCategories = computed(() => {
  const set = new Set<string>();
  booths.value.forEach((b) => {
    if (b.category) set.add(b.category);
  });
  return Array.from(set).sort();
});

// Filtered Booths
const filteredBooths = computed(() => {
  return booths.value.filter((b) => {
    // Search
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchName = b.name?.toLowerCase().includes(q);
      const matchCode = b.code?.toLowerCase().includes(q);
      const matchShort = b.shortName?.toLowerCase().includes(q);
      const matchBooth = b.boothNumber?.toLowerCase().includes(q);
      const matchCat = b.category?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchShort && !matchBooth && !matchCat) return false;
    }

    // Floor
    if (selectedFloor.value !== 0 && b.floorNumber !== selectedFloor.value) {
      return false;
    }

    // Category
    if (selectedCategory.value && b.category !== selectedCategory.value) {
      return false;
    }

    // Status
    if (selectedStatus.value === "active" && !b.isActive) return false;
    if (selectedStatus.value === "inactive" && b.isActive) return false;

    return true;
  });
});

// Filtered Recent Scans
const filteredRecentScans = computed(() => {
  return recentScans.value.filter((s) => {
    if (visitorSelectedBooth.value && s.boothId !== visitorSelectedBooth.value) {
      return false;
    }
    if (visitorSearchQuery.value.trim()) {
      const q = visitorSearchQuery.value.toLowerCase().trim();
      const matchName = s.fullName?.toLowerCase().includes(q);
      const matchNim = s.username?.toLowerCase().includes(q);
      const matchTeam = s.teamName?.toLowerCase().includes(q);
      const matchBooth = s.boothName?.toLowerCase().includes(q);
      if (!matchName && !matchNim && !matchTeam && !matchBooth) return false;
    }
    return true;
  });
});

// Metrics HUD
const activeBoothsCount = computed(() => booths.value.filter((b) => b.isActive).length);
const totalVisitsCount = computed(() => {
  return booths.value.reduce((acc, b) => acc + (b.visitorCount || 0), 0);
});
const totalXpDistributed = computed(() => {
  return recentScans.value.reduce((acc, s) => acc + (s.xpEarned || 75), 0) || (totalVisitsCount.value * 75);
});
const topBooth = computed(() => {
  if (booths.value.length === 0) return null;
  const sorted = [...booths.value].sort((a, b) => (b.visitorCount || 0) - (a.visitorCount || 0));
  return sorted[0]?.visitorCount > 0 ? sorted[0] : null;
});

// Load Data
async function loadFloors() {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/floors");
    if (res?.success && Array.isArray(res.data)) {
      floors.value = res.data;
    }
  } catch (err) {
    console.error("Gagal memuat daftar lantai:", err);
  }
}

async function loadBooths() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/ormawa/booths?includeInactive=true");
    if (res?.success && Array.isArray(res.data)) {
      booths.value = res.data;
    }
  } catch (err) {
    console.error("Gagal memuat stan ormawa:", err);
  } finally {
    loading.value = false;
  }
}

async function loadRecentScans() {
  loadingRecentScans.value = true;
  try {
    const res = await api.get<{ success: boolean; data: { totalVisits: number; scans: any[] } }>("/api/ormawa/visitors?limit=200");
    if (res?.success && res.data?.scans) {
      recentScans.value = res.data.scans;
    }
  } catch (err) {
    console.error("Gagal memuat riwayat kunjungan:", err);
  } finally {
    loadingRecentScans.value = false;
  }
}

function handleRefresh() {
  loadBooths();
  loadRecentScans();
}

// Form Handlers
function openCreateModal() {
  isEditing.value = false;
  formState.id = "";
  formState.code = "";
  formState.name = "";
  formState.shortName = "";
  formState.category = "";
  formState.floorId = null;
  formState.boothNumber = "";
  formState.description = "";
  formState.qrCode = "";
  formState.xpReward = 75;
  formState.contactPerson = "";
  formState.instagram = "";
  formState.isActive = true;
  showFormModal.value = true;
}

function openEditModal(booth: any) {
  isEditing.value = true;
  formState.id = booth.id;
  formState.code = booth.code;
  formState.name = booth.name;
  formState.shortName = booth.shortName || "";
  formState.category = booth.category;
  formState.floorId = booth.floorId || null;
  formState.boothNumber = booth.boothNumber || "";
  formState.description = booth.description || "";
  formState.qrCode = booth.qrCode || "";
  formState.xpReward = booth.xpReward || 75;
  formState.contactPerson = booth.contactPerson || "";
  formState.instagram = booth.instagram || "";
  formState.isActive = booth.isActive;
  showFormModal.value = true;
}

async function submitBoothForm() {
  savingForm.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/ormawa/booths/${formState.id}`, {
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
      toast.success("Stan Berhasil Diperbarui!", `Informasi stan "${formState.name}" berhasil disimpan.`);
    } else {
      await api.post("/api/ormawa/booths", {
        code: formState.code,
        name: formState.name,
        shortName: formState.shortName || null,
        category: formState.category,
        floorId: formState.floorId || null,
        boothNumber: formState.boothNumber || null,
        description: formState.description || null,
        qrCode: formState.qrCode || null,
        xpReward: formState.xpReward,
        contactPerson: formState.contactPerson || null,
        instagram: formState.instagram || null,
        isActive: formState.isActive,
      });
      toast.success("Stan Berhasil Didaftarkan!", `Stan "${formState.name}" (${formState.code}) telah ditambahkan.`);
    }

    showFormModal.value = false;
    await loadBooths();
  } catch (err: any) {
    const msg = err?.data?.error?.message || err?.message || "Gagal menyimpan data stan.";
    toast.error("Gagal Menyimpan Stan", msg);
  } finally {
    savingForm.value = false;
  }
}

async function toggleBoothStatus(booth: any) {
  const newStatus = !booth.isActive;
  try {
    await api.put(`/api/ormawa/booths/${booth.id}`, { isActive: newStatus });
    booth.isActive = newStatus;
    toast.info(
      newStatus ? "Stan Diaktifkan" : "Stan Dinonaktifkan",
      `Stan "${booth.name}" sekarang ${newStatus ? 'dapat' : 'tidak dapat'} dipindai maba.`
    );
  } catch (err) {
    console.error("Gagal mengubah status stan:", err);
    toast.error("Gagal Mengubah Status", "Terjadi kesalahan saat memperbarui status stan.");
  }
}

async function confirmDelete(booth: any) {
  const confirmed = await confirmModal.show({
    title: "Hapus Stan Ormawa?",
    description: `Apakah Anda yakin ingin menghapus stan '${booth.name}' (${booth.code})?\n\nPERINGATAN: Seluruh riwayat presensi maba di stan ini juga akan dihapus permanen!`,
    confirmText: "Ya, Hapus Stan",
    cancelText: "Batal",
    variant: "danger",
    icon: "trash",
  });
  if (!confirmed) return;

  try {
    await api.del(`/api/ormawa/booths/${booth.id}`);
    toast.success("Stan Berhasil Dihapus", `Stan "${booth.name}" telah dihapus.`);
    await loadBooths();
    await loadRecentScans();
  } catch (err: any) {
    toast.error("Gagal Menghapus Stan", err?.data?.error?.message || "Terjadi kesalahan saat menghapus stan.");
  }
}

// QR Preview
function openQrPreview(booth: any) {
  selectedBoothForQr.value = booth;
  showQrModal.value = true;
}

function getQrImageUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(code || '')}`;
}

// CSV Export Utilities
function exportVisitorsCsv() {
  if (recentScans.value.length === 0) return;
  const headers = ["No", "NIM", "Nama Lengkap", "Regu", "Kode Stan", "Nama Stan", "Kategori", "Waktu Scan", "XP Didapat"];
  const rows = recentScans.value.map((s, i) => [
    i + 1,
    `"${s.username}"`,
    `"${s.fullName}"`,
    `"${s.teamName || 'Independen'}"`,
    `"${s.boothCode}"`,
    `"${s.boothName}"`,
    `"${s.category}"`,
    `"${formatDateTime(s.scannedAt)}"`,
    s.xpEarned || 75,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `LOG_PRESENSI_EXPO_DAY3_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Date/Time Formatting
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
  loadFloors();
  loadBooths();
  loadRecentScans();
});
</script>
