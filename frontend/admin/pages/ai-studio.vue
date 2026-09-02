<template>
  <div class="p-4 md:p-6 space-y-5 flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <div class="border border-[#523e2b] bg-[#1d1611] px-2.5 py-1 text-[11px] font-mono flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span class="text-muted-foreground hidden sm:inline">Provider:</span>
        <span class="text-[#facc15] font-bold">Google Gemini</span>
      </div>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchSupportedModels"
        title="Cek Status Model AI"
      >
        <RotateCw :class="['h-3.5 w-3.5', checkingModels && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Subtitle / Info Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-xs text-muted-foreground border-b border-[#4a3624]/60 pb-2">
      <p>
        Pusat otomatisasi kecerdasan buatan untuk merancang soal kuis, variasi pertanyaan, petunjuk misi, dan narasi RPG.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <span class="border border-indigo-500/50 bg-indigo-950/60 px-2 py-0.5 text-[9px] font-pixel text-indigo-300 flex items-center gap-1">
          <Sparkles class="h-3 w-3 text-indigo-400 animate-pulse" />
          AI ENGINE ACTIVE
        </span>
      </div>
    </div>

    <!-- Mode Selector Navigation Tabs (Pixel Style) -->
    <div class="flex flex-wrap gap-1.5 border-b-2 border-[#4a3624] pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'pixel-btn h-8 px-3 text-xs font-mono font-bold flex items-center gap-2 transition-all',
          activeTab === tab.id
            ? 'bg-[#2b2014] text-[#facc15] border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.3)]'
            : 'bg-[#1a140f] text-muted-foreground border-[#4a3624] hover:text-foreground hover:bg-[#271d15]',
        ]"
      >
        <component :is="tab.icon" class="h-3.5 w-3.5" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- ========================================== -->
    <!-- TAB 1: AI QUIZ GENERATOR                  -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'quiz'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Configuration Form (5 cols) -->
        <div class="lg:col-span-5 pixel-card p-4 space-y-4">
          <div class="flex items-center justify-between border-b border-[#4a3624] pb-2">
            <h2 class="font-pixel text-xs text-[#f59e0b] flex items-center gap-2">
              <Sparkles class="h-3.5 w-3.5 text-indigo-400" />
              KONFIGURASI GENERATOR SOAL
            </h2>
            <span class="text-[10px] font-mono text-muted-foreground">Form Parameter</span>
          </div>

          <!-- Topic Input -->
          <div class="space-y-1">
            <label class="font-mono text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Topik Soal / Konteks Kampus *</span>
              <span class="text-[9px] text-[#f59e0b]">Min. 3 karakter</span>
            </label>
            <input
              v-model="quizForm.topic"
              placeholder="Contoh: Sejarah berdirinya UNU Yogyakarta & 9 Lantai Kampus..."
              class="w-full h-8 text-xs font-mono px-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
            <!-- Quick Preset Topics -->
            <div class="flex flex-wrap gap-1 pt-1">
              <button
                v-for="preset in presetTopics"
                :key="preset"
                @click="quizForm.topic = preset"
                class="border border-[#4a3624] bg-[#16110d] px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground hover:text-[#facc15] hover:border-[#ca8a04]"
              >
                + {{ preset }}
              </button>
            </div>
          </div>

          <!-- Question Count & Difficulty Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-mono text-[11px] text-muted-foreground">Jumlah Soal</label>
              <select
                v-model.number="quizForm.count"
                class="w-full h-8 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option :value="1">1 Soal (Kilat)</option>
                <option :value="3">3 Soal (Standar)</option>
                <option :value="5">5 Soal (Set Lengkap)</option>
                <option :value="10">10 Soal (Bank Penuh)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-mono text-[11px] text-muted-foreground">Tingkat Kesulitan</label>
              <select
                v-model="quizForm.difficulty"
                class="w-full h-8 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="EASY">Easy (Pemula)</option>
                <option value="MEDIUM">Medium (Menengah)</option>
                <option value="HARD">Hard (Tantangan)</option>
              </select>
            </div>
          </div>

          <!-- Category & Model Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-mono text-[11px] text-muted-foreground">Kategori Soal</label>
              <select
                v-model="quizForm.category"
                class="w-full h-8 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="Kampus UNU">Wawasan Kampus UNU</option>
                <option value="Sains & AI">Sains & AI</option>
                <option value="Logika">Logika Komputasi</option>
                <option value="Umum">Pengetahuan Umum</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-mono text-[11px] text-muted-foreground">Model AI Pilihan</label>
              <select
                v-model="quizForm.preferredModel"
                class="w-full h-8 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="gemini-flash-latest">Gemini Flash (Cepat)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="mimo-v2.5">Mimo v2.5 (FreeFaucet)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep)</option>
              </select>
            </div>
          </div>

          <!-- Auto-save Checkbox -->
          <div class="border border-[#4a3624] bg-[#16110d] p-2.5 rounded">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="quizForm.autoSave"
                class="rounded border-[#ca8a04] bg-[#271d15] text-[#f59e0b] focus:ring-0"
              />
              <div class="flex flex-col">
                <span class="font-mono text-xs font-bold text-foreground">Auto-Save ke Database</span>
                <span class="font-mono text-[10px] text-muted-foreground">
                  Langsung simpan soal hasil AI ke Bank Soal tanpa perlu review satu per satu.
                </span>
              </div>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            @click="generateQuestions"
            :disabled="generatingQuestions || !quizForm.topic.trim()"
            class="pixel-btn w-full h-9 bg-[#6366f1] text-white border-[#818cf8] font-mono font-bold flex items-center justify-center gap-2 hover:bg-[#4f46e5] disabled:opacity-50"
          >
            <Sparkles :class="['h-4 w-4', generatingQuestions && 'animate-spin']" />
            <span>{{ generatingQuestions ? 'SEDANG MEMPROSES AI...' : 'GENERATE SOAL AI' }}</span>
          </button>
        </div>

        <!-- Generated Questions Preview (7 cols) -->
        <div class="lg:col-span-7 pixel-card p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-[#4a3624] pb-2">
            <div class="flex items-center gap-2">
              <h2 class="font-pixel text-xs text-[#f59e0b]">HASIL GENERATE AI</h2>
              <span v-if="generatedQuestions.length" class="border border-[#ca8a04]/40 bg-[#2b2014] px-1.5 py-0.2 text-[9px] font-mono text-[#facc15]">
                {{ generatedQuestions.length }} Soal Dibuat
              </span>
            </div>
            <div v-if="lastUsedModel" class="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
              <span>Engine:</span>
              <span class="text-indigo-400 font-bold">{{ lastUsedModel }}</span>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="!generatingQuestions && generatedQuestions.length === 0"
            class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2 border border-dashed border-[#4a3624] bg-[#16110d]"
          >
            <Bot class="h-10 w-10 text-[#523e2b]" />
            <p class="font-mono text-xs text-foreground font-bold">Belum Ada Soal yang Di-generate</p>
            <p class="font-mono text-[11px] max-w-sm">
              Isi topik pada formulir di sebelah kiri dan klik tombol "Generate Soal AI" untuk memulai.
            </p>
          </div>

          <!-- Loading State -->
          <div
            v-if="generatingQuestions"
            class="flex flex-col items-center justify-center py-12 text-center space-y-3 border border-[#ca8a04]/30 bg-[#2b2014]/20"
          >
            <div class="relative">
              <Sparkles class="h-10 w-10 text-[#f59e0b] animate-bounce" />
            </div>
            <p class="font-pixel text-xs text-[#facc15]">MERACIK SOAL DENGAN AI...</p>
            <p class="font-mono text-[11px] text-muted-foreground max-w-xs">
              Model AI sedang menyusun opsi jawaban, pilihan pengecoh, dan penjelasan logis.
            </p>
          </div>

          <!-- Questions List Cards -->
          <div v-if="!generatingQuestions && generatedQuestions.length > 0" class="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
            <div
              v-for="(q, idx) in generatedQuestions"
              :key="idx"
              class="border border-[#523e2b] bg-[#1d1611] p-3 space-y-2.5 hover:border-[#ca8a04] transition-colors"
            >
              <!-- Question Header -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-pixel text-xs text-[#f59e0b]">#{{ idx + 1 }}</span>
                  <span class="border border-[#4a3624] bg-[#271d15] px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                    {{ q.difficulty || quizForm.difficulty }}
                  </span>
                  <span class="border border-[#4a3624] bg-[#271d15] px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                    {{ q.category || quizForm.category }}
                  </span>
                </div>

                <!-- Individual Save Button if not autosaved -->
                <button
                  v-if="!quizForm.autoSave && !q.isSaved"
                  @click="saveSingleQuestion(q, idx)"
                  :disabled="q.saving"
                  class="pixel-btn h-6 px-2 text-[10px] font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1 hover:bg-[#eab308]"
                >
                  <Plus class="h-3 w-3" />
                  <span>{{ q.saving ? 'MENYIMPAN...' : 'SIMPAN KE BANK' }}</span>
                </button>
                <span v-else class="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 class="h-3 w-3" /> TERSIMPAN
                </span>
              </div>

              <!-- Question Text -->
              <p class="font-sans text-xs font-bold text-foreground leading-relaxed">
                {{ q.question }}
              </p>

              <!-- Options Grid (4 options) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                <div
                  v-for="(opt, optIdx) in q.options"
                  :key="optIdx"
                  :class="[
                    'p-2 text-[11px] font-mono border flex items-center gap-2',
                    opt === q.answer
                      ? 'border-emerald-600/70 bg-emerald-950/40 text-emerald-200 font-bold'
                      : 'border-[#3a291c] bg-[#16110d] text-muted-foreground',
                  ]"
                >
                  <span
                    :class="[
                      'h-4 w-4 shrink-0 flex items-center justify-center text-[9px] font-bold border',
                      opt === q.answer
                        ? 'border-emerald-500 bg-emerald-700 text-white'
                        : 'border-[#523e2b] bg-[#271d15] text-muted-foreground',
                    ]"
                  >
                    {{ ['A', 'B', 'C', 'D'][optIdx] || optIdx + 1 }}
                  </span>
                  <span class="truncate">{{ opt }}</span>
                  <Check v-if="opt === q.answer" class="ml-auto h-3 w-3 text-emerald-400 shrink-0" />
                </div>
              </div>

              <!-- Explanation Box -->
              <div v-if="q.explanation" class="border-t border-[#3a291c] pt-2 text-[10px] font-mono text-muted-foreground flex items-start gap-1.5">
                <Info class="h-3.5 w-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                <span><strong>Penjelasan:</strong> {{ q.explanation }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 2: QUESTION VARIATIONS GENERATOR      -->
    <!-- ========================================== -->
    <div v-else-if="activeTab === 'variations'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Variation Selector (5 cols) -->
        <div class="lg:col-span-5 pixel-card p-4 space-y-4">
          <div class="border-b border-[#4a3624] pb-2">
            <h2 class="font-pixel text-xs text-[#f59e0b] flex items-center gap-2">
              <GitFork class="h-3.5 w-3.5 text-cyan-400" />
              PILIH SOAL REFERENSI
            </h2>
            <p class="font-mono text-[10px] text-muted-foreground mt-0.5">
              Pilih satu soal dari Bank Soal untuk dibuatkan variasi redaksi baru oleh AI.
            </p>
          </div>

          <!-- Question Dropdown Selector -->
          <div class="space-y-1">
            <label class="font-mono text-[11px] text-muted-foreground">Pilih Soal Sumber</label>
            <select
              v-model="variationForm.questionId"
              class="w-full h-9 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="">-- Pilih Soal dari Database --</option>
              <option v-for="q in existingQuestions" :key="q.id" :value="q.id">
                [{{ q.category || 'Umum' }}] {{ q.questionText.slice(0, 50) }}...
              </option>
            </select>
          </div>

          <!-- Variation Count -->
          <div class="space-y-1">
            <label class="font-mono text-[11px] text-muted-foreground">Jumlah Variasi Baru</label>
            <select
              v-model.number="variationForm.count"
              class="w-full h-8 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            >
              <option :value="2">2 Variasi Baru</option>
              <option :value="3">3 Variasi Baru</option>
              <option :value="5">5 Variasi Baru</option>
            </select>
          </div>

          <!-- Auto-save Toggle -->
          <div class="border border-[#4a3624] bg-[#16110d] p-2.5 rounded">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="variationForm.autoSave"
                class="rounded border-[#ca8a04] bg-[#271d15] text-[#f59e0b] focus:ring-0"
              />
              <span class="font-mono text-xs text-foreground font-bold">Auto-Save Variasi ke Bank Soal</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            @click="generateVariations"
            :disabled="generatingVariations || !variationForm.questionId"
            class="pixel-btn w-full h-9 bg-[#0284c7] text-white border-[#38bdf8] font-mono font-bold flex items-center justify-center gap-2 hover:bg-[#0369a1] disabled:opacity-50"
          >
            <Sparkles :class="['h-4 w-4', generatingVariations && 'animate-spin']" />
            <span>{{ generatingVariations ? 'MEMBUAT VARIASI...' : 'BUAT VARIASI SOAL' }}</span>
          </button>
        </div>

        <!-- Variation Results (7 cols) -->
        <div class="lg:col-span-7 pixel-card p-4 space-y-3">
          <div class="border-b border-[#4a3624] pb-2 flex items-center justify-between">
            <h2 class="font-pixel text-xs text-[#f59e0b]">HASIL VARIASI SOAL</h2>
            <span v-if="generatedVariations.length" class="text-[10px] font-mono text-cyan-400 font-bold">
              {{ generatedVariations.length }} Variasi Dihasilkan
            </span>
          </div>

          <div
            v-if="!generatingVariations && generatedVariations.length === 0"
            class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-[#4a3624] bg-[#16110d]"
          >
            <GitFork class="h-10 w-10 text-[#523e2b] mb-2" />
            <p class="font-mono text-xs text-foreground font-bold">Belum Ada Variasi yang Dibuat</p>
            <p class="font-mono text-[11px]">Pilih soal pada formulir dan klik "Buat Variasi Soal".</p>
          </div>

          <div v-if="generatingVariations" class="py-12 text-center space-y-2">
            <Sparkles class="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
            <p class="font-mono text-xs text-cyan-300">Merumuskan ulang kalimat dan pengecoh...</p>
          </div>

          <!-- Variations List -->
          <div v-if="!generatingVariations && generatedVariations.length > 0" class="space-y-3">
            <div
              v-for="(v, idx) in generatedVariations"
              :key="idx"
              class="border border-[#523e2b] bg-[#1d1611] p-3 space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="font-pixel text-[10px] text-cyan-400">VARIASI #{{ idx + 1 }}</span>
                <span class="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 class="h-3 w-3" /> TERSIMPAN KE BANK
                </span>
              </div>
              <p class="font-sans text-xs font-bold text-foreground">{{ v.question }}</p>
              <div class="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <div
                  v-for="(opt, optIdx) in v.options"
                  :key="optIdx"
                  :class="[
                    'p-1.5 border',
                    opt === v.answer ? 'border-emerald-600 bg-emerald-950/40 text-emerald-200' : 'border-[#3a291c] text-muted-foreground'
                  ]"
                >
                  {{ opt }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 3: RPG QUEST NARRATIVE GENERATOR      -->
    <!-- ========================================== -->
    <div v-else-if="activeTab === 'narrative'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Form (5 cols) -->
        <div class="lg:col-span-5 pixel-card p-4 space-y-4">
          <div class="border-b border-[#4a3624] pb-2">
            <h2 class="font-pixel text-xs text-[#f59e0b] flex items-center gap-2">
              <ScrollText class="h-3.5 w-3.5 text-amber-400" />
              KONFIGURASI NARASI POS RPG
            </h2>
            <p class="font-mono text-[10px] text-muted-foreground mt-0.5">
              Ciptakan teks pengantar cerita imersif saat tim tiba di lantai dan pos misi.
            </p>
          </div>

          <div class="space-y-1">
            <label class="font-mono text-[11px] text-muted-foreground">Nama Ruangan / Pos *</label>
            <input
              v-model="narrativeForm.locationName"
              placeholder="Contoh: Lab Komputasi Quantum Lantai 3..."
              class="w-full h-8 text-xs font-mono px-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-mono text-[11px] text-muted-foreground">Lantai Kampus</label>
              <select
                v-model.number="narrativeForm.floorNumber"
                class="w-full h-8 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option v-for="f in 9" :key="f" :value="f">Lantai {{ f }}</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-mono text-[11px] text-muted-foreground">Jenis Game</label>
              <select
                v-model="narrativeForm.gameType"
                class="w-full h-8 text-xs font-mono px-2 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="Team Quiz">Team Quiz (001)</option>
                <option value="Speed Reaction">Speed Reaction (002)</option>
                <option value="Memory Match">Memory Match (003)</option>
                <option value="Teka-Teki Logika">Puzzle Lab</option>
              </select>
            </div>
          </div>

          <button
            @click="generateNarrative"
            :disabled="generatingNarrative || !narrativeForm.locationName.trim()"
            class="pixel-btn w-full h-9 bg-[#d97706] text-white border-[#f59e0b] font-mono font-bold flex items-center justify-center gap-2 hover:bg-[#b45309] disabled:opacity-50"
          >
            <Sparkles :class="['h-4 w-4', generatingNarrative && 'animate-spin']" />
            <span>{{ generatingNarrative ? 'MENYUSUN NARASI...' : 'GENERATE NARASI RPG' }}</span>
          </button>
        </div>

        <!-- Narrative Output (7 cols) -->
        <div class="lg:col-span-7 pixel-card p-4 space-y-3">
          <div class="border-b border-[#4a3624] pb-2 flex items-center justify-between">
            <h2 class="font-pixel text-xs text-[#f59e0b]">HASIL NARASI QUEST</h2>
            <button
              v-if="generatedNarrative"
              @click="copyToClipboard(generatedNarrative)"
              class="border border-[#523e2b] bg-[#271d15] px-2 py-0.5 text-[10px] font-mono text-[#facc15] hover:border-[#ca8a04]"
            >
              📋 Salin Teks
            </button>
          </div>

          <div
            v-if="!generatingNarrative && !generatedNarrative"
            class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-[#4a3624] bg-[#16110d]"
          >
            <ScrollText class="h-10 w-10 text-[#523e2b] mb-2" />
            <p class="font-mono text-xs text-foreground font-bold">Narasi Siap Dihasilkan</p>
            <p class="font-mono text-[11px]">Masukkan data ruangan untuk menghasilkan cerita quest RPG.</p>
          </div>

          <div v-if="generatingNarrative" class="py-12 text-center space-y-2">
            <Sparkles class="h-8 w-8 text-amber-400 animate-spin mx-auto" />
            <p class="font-mono text-xs text-amber-300">Menulis pengantar petualangan kampus...</p>
          </div>

          <div v-if="!generatingNarrative && generatedNarrative" class="border border-[#523e2b] bg-[#16110d] p-4 rounded space-y-3">
            <div class="flex items-center gap-2 text-[10px] font-mono text-[#f59e0b]">
              <MapPin class="h-3.5 w-3.5" />
              <span>{{ narrativeForm.locationName }} (Lantai {{ narrativeForm.floorNumber }})</span>
            </div>
            <div class="font-sans text-xs text-foreground leading-relaxed whitespace-pre-line border-l-2 border-[#f59e0b] pl-3 py-1">
              {{ generatedNarrative }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 4: IN-GAME HINT / CLUE GENERATOR      -->
    <!-- ========================================== -->
    <div v-else-if="activeTab === 'hint'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-5 pixel-card p-4 space-y-4">
          <div class="border-b border-[#4a3624] pb-2">
            <h2 class="font-pixel text-xs text-[#f59e0b] flex items-center gap-2">
              <Lightbulb class="h-3.5 w-3.5 text-yellow-400" />
              GENERATOR PETUNJUK (HINT)
            </h2>
            <p class="font-mono text-[10px] text-muted-foreground mt-0.5">
              Ciptakan petunjuk cerdas otomatis yang membantu peserta tanpa membocorkan jawaban langsung.
            </p>
          </div>

          <div class="space-y-1">
            <label class="font-mono text-[11px] text-muted-foreground">Teks Soal / Pertanyaan *</label>
            <textarea
              v-model="hintForm.questionText"
              rows="3"
              placeholder="Masukkan teks soal yang butuh petunjuk..."
              class="w-full text-xs font-mono p-2.5 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div class="space-y-1">
            <label class="font-mono text-[11px] text-muted-foreground">Konteks Tambahan (Opsional)</label>
            <input
              v-model="hintForm.context"
              placeholder="Contoh: Kuis Cepat Lantai 5 UNU..."
              class="w-full h-8 text-xs font-mono px-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <button
            @click="generateHint"
            :disabled="generatingHint || !hintForm.questionText.trim()"
            class="pixel-btn w-full h-9 bg-[#ca8a04] text-[#16110d] border-[#eab308] font-mono font-bold flex items-center justify-center gap-2 hover:bg-[#eab308] disabled:opacity-50"
          >
            <Sparkles :class="['h-4 w-4', generatingHint && 'animate-spin']" />
            <span>{{ generatingHint ? 'MERACIK CLUE...' : 'GENERATE CLUE / HINT' }}</span>
          </button>
        </div>

        <div class="lg:col-span-7 pixel-card p-4 space-y-3">
          <div class="border-b border-[#4a3624] pb-2 flex items-center justify-between">
            <h2 class="font-pixel text-xs text-[#f59e0b]">PETUNJUK HASIL AI</h2>
          </div>

          <div
            v-if="!generatingHint && !generatedHint"
            class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-[#4a3624] bg-[#16110d]"
          >
            <Lightbulb class="h-10 w-10 text-[#523e2b] mb-2" />
            <p class="font-mono text-xs text-foreground font-bold">Belum Ada Clue yang Dibuat</p>
            <p class="font-mono text-[11px]">Ketik soal di sebelah kiri dan klik "Generate Clue / Hint".</p>
          </div>

          <div v-if="generatingHint" class="py-12 text-center space-y-2">
            <Lightbulb class="h-8 w-8 text-yellow-400 animate-pulse mx-auto" />
            <p class="font-mono text-xs text-yellow-300">Merumuskan petunjuk logis...</p>
          </div>

          <div v-if="!generatingHint && generatedHint" class="border border-yellow-600/40 bg-yellow-950/20 p-4 rounded space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-yellow-300 font-mono">
              <Lightbulb class="h-4 w-4" />
              <span>Smart Clue:</span>
            </div>
            <p class="font-mono text-xs text-foreground leading-relaxed">
              "{{ generatedHint }}"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Sparkles,
  HelpCircle,
  GitFork,
  ScrollText,
  Lightbulb,
  Bot,
  RotateCw,
  Plus,
  Check,
  CheckCircle2,
  Info,
  MapPin,
} from "lucide-vue-next";
import { useApi } from "@/composables/useApi";

const api = useApi();

const activeTab = ref("quiz");
const checkingModels = ref(false);
const lastUsedModel = ref("");

const tabs = [
  { id: "quiz", label: "Quiz Generator", icon: HelpCircle },
  { id: "variations", label: "Variasi Soal", icon: GitFork },
  { id: "narrative", label: "Narasi RPG Pos", icon: ScrollText },
  { id: "hint", label: "Clue / Hint Generator", icon: Lightbulb },
];

const presetTopics = [
  "Sejarah & Visi Misi UNU Yogyakarta",
  "9 Lantai Gedung Kampus UNU Jogja",
  "Kecerdasan Buatan & Pemrograman Dasar",
  "Etika Digital & Aswaja An-Nahdliyah",
  "Logika Matematika & Algoritma",
];

// Tab 1: Quiz Form
const quizForm = ref({
  topic: "",
  count: 3,
  difficulty: "MEDIUM",
  category: "Kampus UNU",
  preferredModel: "gemini-flash-latest",
  autoSave: true,
});
const generatingQuestions = ref(false);
const generatedQuestions = ref<any[]>([]);

// Tab 2: Variations Form
const existingQuestions = ref<any[]>([]);
const variationForm = ref({
  questionId: "",
  count: 2,
  autoSave: true,
});
const generatingVariations = ref(false);
const generatedVariations = ref<any[]>([]);

// Tab 3: Narrative Form
const narrativeForm = ref({
  locationName: "",
  floorNumber: 1,
  gameType: "Team Quiz",
});
const generatingNarrative = ref(false);
const generatedNarrative = ref("");

// Tab 4: Hint Form
const hintForm = ref({
  questionText: "",
  context: "",
});
const generatingHint = ref(false);
const generatedHint = ref("");

onMounted(async () => {
  await fetchExistingQuestions();
});

async function fetchSupportedModels() {
  checkingModels.value = true;
  try {
    const res = await api.get("/ai/models");
    if (res?.success) {
      alert(`Model AI Aktif: ${res.models?.length || 0} model terdeteksi via Gemini & FreeTokenFaucet.`);
    }
  } catch (err: any) {
    alert("Gagal mengecek model AI: " + (err.message || err));
  } finally {
    checkingModels.value = false;
  }
}

async function fetchExistingQuestions() {
  try {
    const res = await api.get("/questions");
    if (res?.success && Array.isArray(res.data)) {
      existingQuestions.value = res.data;
    }
  } catch (err) {
    console.error("Failed to load questions:", err);
  }
}

async function generateQuestions() {
  if (!quizForm.value.topic.trim()) return;
  generatingQuestions.value = true;
  try {
    const res = await api.post("/ai/generate-questions", {
      topic: quizForm.value.topic,
      count: quizForm.value.count,
      difficulty: quizForm.value.difficulty,
      category: quizForm.value.category,
      preferredModel: quizForm.value.preferredModel,
      autoSave: quizForm.value.autoSave,
    });

    if (res?.success) {
      generatedQuestions.value = (res.data?.questions || []).map((q: any) => ({
        ...q,
        isSaved: quizForm.value.autoSave,
        saving: false,
      }));
      lastUsedModel.value = res.data?.modelUsed || quizForm.value.preferredModel;
      await fetchExistingQuestions();
    } else {
      alert("AI Error: " + (res?.error?.message || "Gagal membuat soal"));
    }
  } catch (err: any) {
    alert("Gagal menghubungi server AI: " + (err.message || err));
  } finally {
    generatingQuestions.value = false;
  }
}

async function saveSingleQuestion(q: any, idx: number) {
  q.saving = true;
  try {
    const res = await api.post("/questions", {
      questionText: q.question,
      options: q.options,
      correctAnswer: q.answer,
      explanation: q.explanation || null,
      difficulty: q.difficulty || quizForm.value.difficulty,
      category: q.category || quizForm.value.category,
      type: "MULTIPLE_CHOICE",
      baseScore: 10,
    });
    if (res?.success) {
      q.isSaved = true;
      await fetchExistingQuestions();
    }
  } catch (err: any) {
    alert("Gagal menyimpan soal: " + err.message);
  } finally {
    q.saving = false;
  }
}

async function generateVariations() {
  if (!variationForm.value.questionId) return;
  generatingVariations.value = true;
  try {
    const res = await api.post("/ai/generate-variations", {
      questionId: variationForm.value.questionId,
      count: variationForm.value.count,
      autoSave: variationForm.value.autoSave,
    });
    if (res?.success) {
      generatedVariations.value = res.data?.variations || [];
      await fetchExistingQuestions();
    } else {
      alert("Error: " + (res?.error?.message || "Gagal membuat variasi"));
    }
  } catch (err: any) {
    alert("Gagal membuat variasi soal: " + (err.message || err));
  } finally {
    generatingVariations.value = false;
  }
}

async function generateNarrative() {
  if (!narrativeForm.value.locationName.trim()) return;
  generatingNarrative.value = true;
  try {
    const res = await api.post("/ai/generate-narrative", {
      locationName: narrativeForm.value.locationName,
      floorNumber: narrativeForm.value.floorNumber,
      gameType: narrativeForm.value.gameType,
    });
    if (res?.success) {
      generatedNarrative.value = res.data?.narrative || "";
    } else {
      alert("Error: " + (res?.error?.message || "Gagal membuat narasi"));
    }
  } catch (err: any) {
    alert("Gagal membuat narasi RPG: " + (err.message || err));
  } finally {
    generatingNarrative.value = false;
  }
}

async function generateHint() {
  if (!hintForm.value.questionText.trim()) return;
  generatingHint.value = true;
  try {
    const res = await api.post("/ai/generate-hint", {
      questionText: hintForm.value.questionText,
      context: hintForm.value.context,
    });
    if (res?.success) {
      generatedHint.value = res.data?.hint || "";
    }
  } catch (err: any) {
    alert("Gagal membuat hint: " + (err.message || err));
  } finally {
    generatingHint.value = false;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  alert("Teks narasi berhasil disalin ke clipboard!");
}
</script>
