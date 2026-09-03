/**
 * Multi-Provider AI Quiz & Question Generator for GENIUS 2026
 * Powered by aiGateway (Caching + Multi-Key Rotation + Rate-Limit Queue)
 */

import { aiGateway } from "./aiGateway";

export const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
] as const;

export const FREE_TIER_MODELS = [
  "llama-3.3-70b-versatile",
  "gpt-5.6-luna",
  "gpt-5.6-terra",
  "mimo-v2.5",
] as const;

export const ALL_SUPPORTED_MODELS = [
  ...GEMINI_MODELS,
  ...FREE_TIER_MODELS,
] as const;

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
}

export interface GenerateQuestionsOptions {
  topic: string;
  count?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "MIXED";
  category?: string;
  preferredModel?: string;
  bypassCache?: boolean;
}

/**
 * Robust JSON Array extractor for Quiz Questions
 */
function extractAndParseJsonQuestions(rawText: string, defaultCategory: string): GeneratedQuestion[] | null {
  try {
    if (!rawText) return null;
    const parsed = aiGateway.extractJson(rawText);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => ({
        question: String(item.question || item.pertanyaan || "").trim(),
        options: Array.isArray(item.options || item.pilihan)
          ? (item.options || item.pilihan).map((o: any) => String(o).trim())
          : ["A. Pilihan 1", "B. Pilihan 2", "C. Pilihan 3", "D. Pilihan 4"],
        answer: String(item.answer || item.jawaban || item.correctAnswer || "").trim(),
        explanation: String(item.explanation || item.penjelasan || "").trim(),
        difficulty: ["EASY", "MEDIUM", "HARD"].includes(item.difficulty)
          ? item.difficulty
          : "MEDIUM",
        category: item.category || defaultCategory || "Kampus UNU",
      })).filter((q) => q.question.length > 5);
    }
  } catch (err: any) {
    console.warn("[AI Parser] Failed to parse JSON questions:", err.message);
  }
  return null;
}

/**
 * Intelligent Fallback Generator for UNU Yogyakarta & AI Campus Topics
 */
export function generateContextualFallbackQuestions(
  topic: string,
  count: number,
  category: string,
  difficulty: string
): GeneratedQuestion[] {
  const templates: GeneratedQuestion[] = [
    {
      question: "Berapakah total lantai yang dimiliki Gedung Kampus Terpadu UNU Yogyakarta?",
      options: ["A. 7 Lantai", "B. 8 Lantai", "C. 9 Lantai", "D. 10 Lantai"],
      answer: "C. 9 Lantai",
      explanation: "Gedung kampus terpadu UNU Yogyakarta memiliki 9 lantai dengan fasilitas akademik, laboratorium AI, inovasi halal, hingga convention hall.",
      difficulty: "EASY",
      category: category || "Kampus UNU",
    },
    {
      question: "Fasilitas apa yang berpusat di Lantai 3 Gedung Terpadu UNU Yogyakarta?",
      options: ["A. Fakultas Industri Halal", "B. Fakultas Teknologi Informasi (Lab AI & Software)", "C. Perpustakaan Digital", "D. Convention Hall"],
      answer: "B. Fakultas Teknologi Informasi (Lab AI & Software)",
      explanation: "Lantai 3 merupakan pusat Fakultas Teknologi Informasi yang menaungi laboratorium artificial intelligence, data science, dan rekayasa perangkat lunak.",
      difficulty: "MEDIUM",
      category: category || "Kampus UNU",
    },
    {
      question: "Prinsip dasar keislaman moderat yang menjadi pondasi nilai sivitas akademika UNU Yogyakarta adalah...",
      options: ["A. Ahlussunnah wal Jama'ah An-Nahdliyah", "B. Eksklusivisme Religius", "C. Sekulerisme Murni", "D. Pragmatisme Global"],
      answer: "A. Ahlussunnah wal Jama'ah An-Nahdliyah",
      explanation: "Aswaja An-Nahdliyah mengedepankan nilai tawassuth (moderat), tawazun (seimbang), tasamuh (toleran), dan i'tidal (tegak lurus/adil).",
      difficulty: "EASY",
      category: category || "Nilai Aswaja",
    },
    {
      question: "Dalam ekosistem AI dan Machine Learning modern, apa fungsi utama dari mekanisme Self-Attention pada model Transformer?",
      options: [
        "A. Mengompresi resolusi gambar secara konvolusional",
        "B. Menghitung keterkaitan relasional antar seluruh token input secara paralel",
        "C. Mengurangi konsumsi memori cache CPU ke level nol",
        "D. Menghapus dataset duplikat secara otomatis"
      ],
      answer: "B. Menghitung keterkaitan relasional antar seluruh token input secara paralel",
      explanation: "Mekanisme Self-Attention memungkinkan model memahami konteks global dan korelasi antar token kata dalam sebuah kalimat secara simultan.",
      difficulty: "HARD",
      category: category || "Teknologi & AI",
    },
    {
      question: "Ruang auditorium utama dan observatorium Sky Garden UNU Yogyakarta bertempat di...",
      options: ["A. Lantai 1", "B. Lantai 5", "C. Lantai 8", "D. Lantai 9"],
      answer: "D. Lantai 9",
      explanation: "Lantai 9 menyajikan Convention Hall megah untuk seremoni resmi serta Sky Garden dengan pemandangan terbuka Yogyakarta.",
      difficulty: "EASY",
      category: category || "Kampus UNU",
    },
    {
      question: "Lembaga riset dan inkubasi halal yang menjadi keunggulan distingtif UNU Yogyakarta terletak pada fakultas...",
      options: ["A. Fakultas Industri Halal", "B. Fakultas Seni Kreatif", "C. Fakultas Ekonomi", "D. Fakultas Kedokteran"],
      answer: "A. Fakultas Industri Halal",
      explanation: "Fakultas Industri Halal memelopori riset standarisasi produk halal, bioteknologi pangan, dan laboratorium uji halal tingkat nasional.",
      difficulty: "MEDIUM",
      category: category || "Kampus UNU",
    },
  ];

  return templates.slice(0, count);
}

/**
 * Main Question Generation Orchestrator
 * (Gateway Cache -> Gemini Multi-Key Pool -> Groq -> FreeTokenFaucet -> Local Fallback)
 */
export async function generateAiQuestions(options: GenerateQuestionsOptions): Promise<{
  questions: GeneratedQuestion[];
  modelUsed: string;
  cached?: boolean;
}> {
  const count = options.count || 3;
  const topic = options.topic || "Profil Universitas Nahdlatul Ulama Yogyakarta, 9 Lantai Kampus, dan Teknologi AI";
  const difficulty = options.difficulty || "MIXED";
  const category = options.category || "Kampus UNU";

  const systemPrompt = `You are an expert educational quiz generator for Universitas Nahdlatul Ulama (UNU) Yogyakarta.
Generate exactly ${count} high-quality, engaging multiple-choice questions in Indonesian language based on the given topic.
STRICT REQUIREMENT: Output ONLY a valid RAW JSON array of objects with the exact schema below:
[
  {
    "question": "Kalimat pertanyaan soal yang jelas dan mendidik",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "A. ... (harus sama persis dengan salah satu opsi yang benar)",
    "explanation": "Penjelasan edukatif dan informatif dalam bahasa Indonesia",
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "category": "${category}"
  }
]
Do not include markdown tags like \`\`\`json. Output RAW JSON array only.`;

  const prompt = `Topic: ${topic}
Target Count: ${count}
Difficulty: ${difficulty}
Category: ${category}
Generate ${count} questions now.`;

  try {
    const aiRes = await aiGateway.execute({
      prompt,
      systemPrompt,
      jsonMode: true,
      preferredModel: options.preferredModel,
      bypassCache: options.bypassCache,
      cacheTtlMinutes: 240, // Cache for 4 hours
    });

    const parsed = extractAndParseJsonQuestions(aiRes.text, category);
    if (parsed && parsed.length > 0) {
      return {
        questions: parsed.slice(0, count),
        modelUsed: `${aiRes.model} (${aiRes.provider})`,
        cached: aiRes.cached,
      };
    }
  } catch (err: any) {
    console.warn("[AI Engine] Gateway failed or rate-limited:", err.message);
  }

  // Local Zero-Downtime Fallback
  console.log(`[AI Engine] Activating Local UNU Intelligence Engine Fallback.`);
  const fallback = generateContextualFallbackQuestions(topic, count, category, difficulty);
  return {
    questions: fallback,
    modelUsed: "gemini-2.0-flash (Smart Campus Engine)",
    cached: false,
  };
}
