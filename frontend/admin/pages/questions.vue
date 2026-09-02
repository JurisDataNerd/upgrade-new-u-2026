<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Topbar Actions Teleport -->
    <TopbarActions>
      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#6366f1] text-white border-[#818cf8] flex items-center gap-1.5 hover:bg-[#4f46e5]"
        @click="showAiModal = true"
        title="Generate AI Soal"
      >
        <Sparkles class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">GENERATE AI SOAL</span>
      </button>

      <button
        class="pixel-btn h-8 px-3 text-xs font-mono font-bold bg-[#ca8a04] text-[#16110d] border-[#eab308] flex items-center gap-1.5 hover:bg-[#eab308]"
        @click="openCreateModal"
        title="Tambah Manual"
      >
        <Plus class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">TAMBAH MANUAL</span>
      </button>

      <button
        class="pixel-btn h-8 w-8 bg-[#271d15] text-[#f59e0b] border-[#523e2b] flex items-center justify-center hover:bg-[#3d2d1e]"
        @click="fetchQuestions"
        :disabled="loading"
        title="Refresh Data"
      >
        <RotateCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
      </button>
    </TopbarActions>

    <!-- Sticky Top Pixel Toolbar (Flush nempel Topbar) -->
    <div class="pixel-toolbar-sticky px-4 md:px-6 py-2.5 space-y-2 shrink-0">
      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f59e0b]" />
          <input
            v-model="searchQuery"
            placeholder="Cari teks pertanyaan atau kata kunci..."
            class="w-full h-7 text-xs font-mono pl-8 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex items-center gap-2">
          <!-- Category Select -->
          <select
            v-model="categoryFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1"
          >
            <option value="">Semua Kategori</option>
            <option value="Kampus UNU">Wawasan Kampus UNU</option>
            <option value="Sains & AI">Sains & Teknologi</option>
            <option value="Logika">Logika Komputasi</option>
            <option value="Umum">Pengetahuan Umum</option>
          </select>

          <!-- Difficulty Select -->
          <select
            v-model="difficultyFilter"
            class="h-7 bg-[#1d1611] border border-[#523e2b] px-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#f59e0b]"
            @change="currentPage = 1"
          >
            <option value="">Semua Tingkat</option>
            <option value="EASY">Mudah (Easy)</option>
            <option value="MEDIUM">Sedang (Medium)</option>
            <option value="HARD">Sulit (Hard)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Page Content Area (Self-managed padding for Table) -->
    <div class="p-4 md:p-6 space-y-4 flex-1">
      <!-- Questions Table (Pixel Theme) -->
      <div class="pixel-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="pixel-table w-full text-left text-xs font-mono">
            <thead class="bg-[#15100c] border-b-2 border-[#4a3624]">
              <tr>
                <th class="p-3 w-12 text-center">#</th>
                <th class="p-3">PERTANYAAN SOAL</th>
                <th class="p-3 text-center">KATEGORI</th>
                <th class="p-3 text-center">TINGKAT</th>
                <th class="p-3 text-center">KUNCI JAWABAN</th>
                <th class="p-3 text-right">AKSI</th>
              </tr>
            </thead>
          <tbody class="divide-y divide-[#3d2d1e]/60">
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="p-8 text-muted-foreground">
                <div class="flex items-center justify-center gap-2">
                  <RotateCw class="h-4 w-4 animate-spin text-[#f59e0b]" />
                  <span>Memuat bank soal...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="paginatedQuestions.length === 0" class="text-center">
              <td colspan="6" class="p-8 text-muted-foreground">
                Tidak ada soal yang sesuai dengan filter.
              </td>
            </tr>

            <tr
              v-for="(q, idx) in paginatedQuestions"
              :key="q.id"
              class="hover:bg-[#271d15]/50 transition-colors"
            >
              <td class="p-3 text-center text-muted-foreground font-pixel text-[10px]">
                {{ (currentPage - 1) * pageSize + idx + 1 }}
              </td>

              <td class="p-3">
                <div class="font-sans font-semibold text-foreground text-xs leading-relaxed max-w-lg">
                  {{ q.questionText }}
                </div>
                <div class="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                  <span>{{ q.options?.length || 4 }} Pilihan Jawaban</span>
                  <span>•</span>
                  <span class="text-[#4ade80]">+{{ q.points || 10 }} pts</span>
                </div>
              </td>

              <td class="p-3 text-center">
                <span class="px-1.5 py-0.5 text-[9px] font-pixel border border-[#ca8a04]/80 bg-[#2b2014] text-[#facc15]">
                  {{ q.category || 'Umum' }}
                </span>
              </td>

              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-1.5 py-0.5 text-[8px] font-pixel border',
                    q.difficulty === 'EASY'
                      ? 'border-[#16a34a] text-[#4ade80] bg-[#162518]'
                      : q.difficulty === 'HARD'
                      ? 'border-[#dc2626] text-[#f87171] bg-[#2a1414]'
                      : 'border-[#ca8a04] text-[#facc15] bg-[#2b2014]'
                  ]"
                >
                  {{ q.difficulty || 'MEDIUM' }}
                </span>
              </td>

              <td class="p-3 text-center">
                <span class="px-2 py-0.5 text-[10px] font-pixel border border-[#16a34a] bg-[#162518] text-[#4ade80]">
                  OPSI {{ q.correctOptionIndex !== undefined ? String.fromCharCode(65 + Number(q.correctOptionIndex)) : 'A' }}
                </span>
              </td>

              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:border-[#f59e0b] flex items-center justify-center text-xs"
                    title="Edit Soal"
                    @click="openEditModal(q)"
                  >
                    <Edit class="h-3.5 w-3.5" />
                  </button>
                  <button
                    class="h-7 w-7 border border-[#523e2b] bg-[#271d15] text-[#f87171] hover:border-[#dc2626] flex items-center justify-center text-xs"
                    title="Hapus Soal"
                    @click="confirmDelete(q)"
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
      :total-items="filteredQuestions.length"
      :page-size="pageSize"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event; currentPage = 1"
    />

    <!-- Modal: Buat / Edit Soal -->
    <Dialog :open="showQuestionModal" @update:open="showQuestionModal = $event">
      <DialogContent class="sm:max-w-[500px] pixel-card border-2 border-[#f59e0b] bg-[#1a140f] text-foreground">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm text-[#f59e0b] flex items-center gap-2">
            <HelpCircle class="h-4 w-4" />
            <span>{{ isEditing ? 'EDIT DATA SOAL KUIS' : 'TAMBAH SOAL KUIS BARU' }}</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="submitQuestionForm" class="space-y-3 py-1 font-mono text-xs">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Teks Pertanyaan Soal:</Label>
            <textarea
              v-model="form.questionText"
              rows="2"
              placeholder="Ketik pertanyaan kuis..."
              class="w-full bg-[#15100c] border border-[#523e2b] p-2 text-xs focus:outline-none focus:border-[#f59e0b]"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <Label class="text-xs font-semibold">Kategori:</Label>
              <select
                v-model="form.category"
                class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="Kampus UNU">Wawasan Kampus UNU</option>
                <option value="Sains & AI">Sains & AI</option>
                <option value="Logika">Logika Komputasi</option>
                <option value="Umum">Pengetahuan Umum</option>
              </select>
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-semibold">Tingkat Kesulitan:</Label>
              <select
                v-model="form.difficulty"
                class="w-full h-8 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="EASY">Mudah (Easy)</option>
                <option value="MEDIUM">Sedang (Medium)</option>
                <option value="HARD">Sulit (Hard)</option>
              </select>
            </div>
          </div>

          <!-- Options A, B, C, D -->
          <div class="space-y-1.5 pt-1">
            <Label class="text-xs font-semibold">Pilihan Jawaban (A, B, C, D):</Label>
            <div v-for="(opt, i) in form.options" :key="i" class="flex items-center gap-2">
              <span
                :class="[
                  'h-7 w-7 border flex items-center justify-center font-pixel text-xs shrink-0 cursor-pointer',
                  form.correctOptionIndex === i
                    ? 'border-[#16a34a] bg-[#162518] text-[#4ade80] font-bold'
                    : 'border-[#523e2b] bg-[#271d15] text-muted-foreground'
                ]"
                @click="form.correctOptionIndex = i"
                title="Klik untuk jadikan kunci jawaban benar"
              >
                {{ String.fromCharCode(65 + i) }}
              </span>
              <input
                v-model="form.options[i]"
                :placeholder="`Pilihan Jawaban ${String.fromCharCode(65 + i)}`"
                class="flex-1 h-7 px-2 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b]"
                required
              />
            </div>
            <p class="text-[10px] text-muted-foreground italic">
              *Klik huruf (A/B/C/D) untuk menandai kunci jawaban yang benar (warna hijau).
            </p>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showQuestionModal = false"
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

    <!-- AI Question Generator Dialog (Google Gemini Primary) -->
    <Dialog :open="showAiModal" @update:open="showAiModal = $event">
      <DialogContent class="pixel-panel max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="font-pixel text-sm font-bold text-[#818cf8] flex items-center gap-2">
            <Sparkles class="h-4 w-4" />
            <span>AI QUESTION GENERATOR (GOOGLE GEMINI PRIMARY)</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="generateAiQuestionsHandler" class="space-y-3 font-mono text-xs pt-2">
          <div class="space-y-1">
            <Label class="text-xs font-semibold">Topik / Tema Soal:</Label>
            <input
              v-model="aiForm.topic"
              placeholder="Contoh: Gedung 9 Lantai UNU Yogyakarta, Profil Rektor, Keilmuan AI & Data..."
              class="w-full h-8 px-2.5 bg-[#271d15] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#818cf8]"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <Label class="text-xs font-semibold">Model AI Engine:</Label>
              <select
                v-model="aiForm.preferredModel"
                class="w-full h-8 bg-[#271d15] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#818cf8]"
              >
                <option value="gemini-3.5-flash">✨ GEMINI 3.5 FLASH (Google AI — Utama)</option>
                <option value="gemini-3.6-flash">✨ GEMINI 3.6 FLASH (Google AI — Flagship)</option>
                <option value="gemini-3.5-flash-lite">✨ GEMINI 3.5 LITE (Google AI — Cepat)</option>
                <option value="gpt-5.6-luna">GPT-5.6-LUNA (FreeTokenFaucet)</option>
                <option value="gpt-5.6-terra">GPT-5.6-TERRA (FreeTokenFaucet)</option>
                <option value="mimo-v2.5">MIMO-V2.5 (FreeTokenFaucet)</option>
              </select>
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-semibold">Jumlah Soal:</Label>
              <select
                v-model.number="aiForm.count"
                class="w-full h-8 bg-[#271d15] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#818cf8]"
              >
                <option :value="1">1 Soal</option>
                <option :value="3">3 Soal</option>
                <option :value="5">5 Soal</option>
                <option :value="10">10 Soal</option>
              </select>
            </div>

            <div class="space-y-1">
              <Label class="text-xs font-semibold">Tingkat Kesulitan:</Label>
              <select
                v-model="aiForm.difficulty"
                class="w-full h-8 bg-[#271d15] border border-[#523e2b] px-2 text-foreground focus:outline-none focus:border-[#818cf8]"
              >
                <option value="MIXED">Campuran</option>
                <option value="EASY">Mudah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HARD">Sulit</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="aiAutoSave"
              v-model="aiForm.autoSave"
              class="accent-[#6366f1]"
            />
            <label for="aiAutoSave" class="text-xs cursor-pointer text-gray-300">
              Langsung simpan hasil soal yang dibuat ke Bank Soal
            </label>
          </div>

          <!-- Preview generated questions -->
          <div v-if="aiGeneratedPreview.length > 0" class="space-y-2 pt-2 border-t border-[#523e2b]">
            <div class="text-xs font-bold text-emerald-400">
              Preview Soal Hasil AI (Model: {{ lastModelUsed }}):
            </div>
            <div
              v-for="(gq, idx) in aiGeneratedPreview"
              :key="idx"
              class="p-2.5 bg-black/40 border border-white/10 rounded space-y-1 text-[11px]"
            >
              <div class="font-bold text-white">{{ idx + 1 }}. {{ gq.question }}</div>
              <div class="grid grid-cols-2 gap-1 text-gray-400">
                <span v-for="(opt, oi) in gq.options" :key="oi">{{ opt }}</span>
              </div>
              <div class="text-emerald-400 font-bold">Kunci Jawaban: {{ gq.answer }}</div>
            </div>
          </div>

          <DialogFooter class="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-8 px-3 text-xs border border-[#523e2b] bg-[#271d15] text-muted-foreground hover:text-foreground"
              @click="showAiModal = false"
            >
              Tutup
            </button>
            <button
              type="submit"
              class="pixel-btn h-8 px-4 text-xs font-pixel bg-[#6366f1] text-white border-[#818cf8] font-bold"
              :disabled="generatingAi"
            >
              <RotateCw v-if="generatingAi" class="h-3 w-3 animate-spin mr-1 inline" />
              <span>{{ generatingAi ? 'GENERATING AI...' : 'MULAI GENERATE' }}</span>
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
  HelpCircle,
  Plus,
  RotateCw,
  Search,
  Edit,
  Trash2,
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
import PixelPagination from "@/components/PixelPagination.vue";
import { useApi } from "@/composables/useApi";

const api = useApi();

const loading = ref(false);
const saving = ref(false);
const showAiModal = ref(false);
const generatingAi = ref(false);
const aiGeneratedPreview = ref<any[]>([]);
const lastModelUsed = ref("");

const aiForm = ref({
  topic: "Sejarah UNU Yogyakarta, Gedung Kampus 9 Lantai, dan Teknologi AI Modern",
  preferredModel: "gemini-3.5-flash",
  count: 3,
  difficulty: "MIXED",
  category: "Kampus UNU",
  autoSave: true,
});
const questions = ref<any[]>([]);
const searchQuery = ref("");
const categoryFilter = ref("");
const difficultyFilter = ref("");

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

const showQuestionModal = ref(false);
const isEditing = ref(false);

const form = ref({
  id: "",
  questionText: "",
  category: "Kampus UNU",
  difficulty: "MEDIUM",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  points: 10,
});

const filteredQuestions = computed(() => {
  let list = questions.value;
  if (categoryFilter.value) {
    list = list.filter((q) => q.category === categoryFilter.value);
  }
  if (difficultyFilter.value) {
    list = list.filter((q) => q.difficulty === difficultyFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((item) => item.questionText?.toLowerCase().includes(q));
  }
  return list;
});

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredQuestions.value.slice(start, start + pageSize.value);
});

async function fetchQuestions() {
  loading.value = true;
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/api/questions");
    if (res.success && res.data) {
      questions.value = res.data;
    }
  } catch (err) {
    console.error("Failed to load questions:", err);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = {
    id: "",
    questionText: "",
    category: "Kampus UNU",
    difficulty: "MEDIUM",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    points: 10,
  };
  showQuestionModal.value = true;
}

function openEditModal(q: any) {
  isEditing.value = true;
  form.value = {
    id: q.id,
    questionText: q.questionText,
    category: q.category || "Kampus UNU",
    difficulty: q.difficulty || "MEDIUM",
    options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
    correctOptionIndex: Number(q.correctOptionIndex) || 0,
    points: q.points || 10,
  };
  showQuestionModal.value = true;
}

async function submitQuestionForm() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/api/questions/${form.value.id}`, {
        questionText: form.value.questionText,
        category: form.value.category,
        difficulty: form.value.difficulty,
        options: form.value.options,
        correctOptionIndex: form.value.correctOptionIndex,
        points: form.value.points,
      });
    } else {
      await api.post("/api/questions", {
        questionText: form.value.questionText,
        category: form.value.category,
        difficulty: form.value.difficulty,
        options: form.value.options,
        correctOptionIndex: form.value.correctOptionIndex,
        points: form.value.points,
      });
    }
    showQuestionModal.value = false;
    await fetchQuestions();
  } catch (err: any) {
    alert("Gagal menyimpan soal: " + (err.data?.error?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(q: any) {
  if (confirm(`Hapus soal '${q.questionText.slice(0, 30)}...'?`)) {
    try {
      await api.del(`/api/questions/${q.id}`);
      await fetchQuestions();
    } catch (err: any) {
      alert("Gagal menghapus soal: " + err.message);
    }
  }
}

async function generateAiQuestionsHandler() {
  generatingAi.value = true;
  aiGeneratedPreview.value = [];
  try {
    const res = await api.post<{
      success: boolean;
      data: { questions: any[]; modelUsed: string; savedCount: number };
      message: string;
    }>("/api/ai/generate-questions", {
      topic: aiForm.value.topic,
      count: aiForm.value.count,
      difficulty: aiForm.value.difficulty,
      category: aiForm.value.category,
      preferredModel: aiForm.value.preferredModel,
      autoSave: aiForm.value.autoSave,
    });

    if (res.success && res.data) {
      aiGeneratedPreview.value = res.data.questions;
      lastModelUsed.value = res.data.modelUsed;
      if (aiForm.value.autoSave) {
        await fetchQuestions();
      }
      alert(res.message || "Soal berhasil di-generate!");
    }
  } catch (err: any) {
    alert("Gagal men-generate soal AI: " + (err.data?.error?.message || err.message));
  } finally {
    generatingAi.value = false;
  }
}

onMounted(() => {
  fetchQuestions();
});
</script>
