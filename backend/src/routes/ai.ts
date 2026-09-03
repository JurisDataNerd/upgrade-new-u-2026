import { Elysia, t } from "elysia";
import { db } from "../db";
import { questions } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requireAdmin } from "../middleware/auth";
import { generateAiQuestions, GEMINI_MODELS, FREE_TIER_MODELS } from "../lib/ai";
import { aiGateway } from "../lib/aiGateway";
import { logAudit } from "../lib/audit";

export const aiRoutes = new Elysia({
  prefix: "/api/ai",
  detail: {
    tags: ["AI Tools & Generation"],
  },
})
  .use(authMiddleware)
  .use(requireAdmin)

  // GET /api/ai/models — List supported AI models
  .get("/models", () => {
    return {
      success: true,
      primaryProvider: "Google Gemini",
      secondaryProvider: "FreeTokenFaucet",
      models: [
        ...GEMINI_MODELS.map((id) => ({
          id,
          provider: "Google Gemini",
          isPrimary: true,
          label: `${id} (Google Gemini — Utama)`,
        })),
        ...FREE_TIER_MODELS.map((id) => ({
          id,
          provider: "FreeTokenFaucet",
          isPrimary: false,
          label: `${id} (FreeTokenFaucet)`,
        })),
      ],
    };
  })

  // POST /api/ai/generate-questions — AI Question Generation with auto-save option
  .post(
    "/generate-questions",
    async ({ body, user, set }) => {
      try {
        const result = await generateAiQuestions({
          topic: body.topic,
          count: body.count || 3,
          difficulty: body.difficulty as any,
          category: body.category || "CAMPUS_QUEST",
          preferredModel: body.preferredModel,
        });

        let savedQuestions: any[] = [];

        // If autoSave is true, insert generated questions directly into the database
        if (body.autoSave) {
          const inserts = result.questions.map((q) => ({
            questionText: q.question,
            options: q.options,
            correctAnswer: q.answer,
            explanation: q.explanation || null,
            difficulty: q.difficulty || "MEDIUM",
            category: q.category || body.category || "CAMPUS_QUEST",
            type: "MULTIPLE_CHOICE" as const,
            baseScore: 10,
          }));

          savedQuestions = await db.insert(questions).values(inserts).returning();

          await logAudit({
            actorId: user?.userId,
            actorRole: "ADMIN",
            action: "AI_QUESTIONS_GENERATED_AND_SAVED",
            targetType: "QUESTION_BANK",
            details: { count: savedQuestions.length, modelUsed: result.modelUsed, topic: body.topic },
          });
        }

        return {
          success: true,
          data: {
            questions: result.questions,
            modelUsed: result.modelUsed,
            savedCount: savedQuestions.length,
            savedRecords: savedQuestions,
          },
          message: `Berhasil men-generate ${result.questions.length} soal AI menggunakan model ${result.modelUsed}!`,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          error: {
            code: "AI_GENERATION_FAILED",
            message: err.message || "Gagal menghasilkan soal AI",
          },
        };
      }
    },
    {
      body: t.Object({
        topic: t.String({ minLength: 3 }),
        count: t.Optional(t.Number({ minimum: 1, maximum: 10 })),
        difficulty: t.Optional(t.String()),
        category: t.Optional(t.String()),
        preferredModel: t.Optional(t.String()),
        autoSave: t.Optional(t.Boolean()),
      }),
    }
  )

  // POST /api/ai/generate-variations — Create variations of an existing question
  .post(
    "/generate-variations",
    async ({ body, user, set }) => {
      const [original] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, body.questionId))
        .limit(1);

      if (!original) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Original question not found" } };
      }

      try {
        const prompt = `Buatkan ${body.count || 2} variasi soal baru berdasarkan soal referensi berikut:
Soal: "${original.questionText}"
Pilihan: ${JSON.stringify(original.options)}
Jawaban: "${original.correctAnswer}"
Penjelasan: "${original.explanation || ''}"
Kategori: "${original.category || 'KAMPUS_UNU'}"

Buatkan variasi dengan sudut pandang berbeda, perumusan kalimat baru, atau distractor (pilihan salah) yang baru namun menguji pemahaman konsep yang sama.`;

        const result = await generateAiQuestions({
          topic: prompt,
          count: body.count || 2,
          difficulty: original.difficulty as any,
          category: original.category || "KAMPUS_UNU",
          preferredModel: body.preferredModel,
        });

        let savedQuestions: any[] = [];
        if (body.autoSave) {
          const inserts = result.questions.map((q) => ({
            questionText: q.question,
            options: q.options,
            correctAnswer: q.answer,
            explanation: q.explanation || null,
            difficulty: q.difficulty || original.difficulty,
            category: original.category,
            type: "MULTIPLE_CHOICE" as const,
            baseScore: original.baseScore || 10,
          }));

          savedQuestions = await db.insert(questions).values(inserts).returning();

          await logAudit({
            actorId: user?.userId,
            actorRole: "ADMIN",
            action: "AI_QUESTION_VARIATIONS_SAVED",
            targetType: "QUESTION_BANK",
            details: { originalId: original.id, count: savedQuestions.length },
          });
        }

        return {
          success: true,
          data: {
            original,
            variations: result.questions,
            modelUsed: result.modelUsed,
            savedCount: savedQuestions.length,
          },
          message: `Berhasil membuat ${result.questions.length} variasi soal baru!`,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          error: { code: "AI_VARIATION_FAILED", message: err.message },
        };
      }
    },
    {
      body: t.Object({
        questionId: t.String(),
        count: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
        preferredModel: t.Optional(t.String()),
        autoSave: t.Optional(t.Boolean()),
      }),
    }
  )

  // GET /api/ai/cache-stats — Cache hit ratio, queue workers, and key health
  .get("/cache-stats", () => {
    return {
      success: true,
      data: aiGateway.getStats(),
    };
  })

  // POST /api/ai/clear-cache — Purge all cached prompt responses
  .post("/clear-cache", () => {
    const result = aiGateway.clearCache();
    return {
      success: true,
      message: `Cache AI berhasil dibersihkan (${result.clearedItems} entri dihapus).`,
      data: result,
    };
  })

  // POST /api/ai/generate-hint — Generate contextual hints for games/missions
  .post(
    "/generate-hint",
    async ({ body, set }) => {
      try {
        const { questionText, context } = body;
        const prompt = `Berikan 1 petunjuk cerdas (hint/clue) untuk membantu mahasiswa menjawab pertanyaan berikut tanpa membocorkan jawabannya secara langsung:
Soal: "${questionText}"
Konteks Tambahan: "${context || 'Kuis Kampus UNU Yogyakarta'}"

Jawab dalam 1-2 kalimat bahasa Indonesia yang memotivasi dan memberi arahan logis.`;

        const aiRes = await aiGateway.execute({
          prompt,
          systemPrompt: "You are an encouraging educational game assistant providing clever hints in Indonesian.",
          maxTokens: 250,
          cacheTtlMinutes: 1440, // 24 hours
        });

        return {
          success: true,
          data: {
            hint: aiRes.text.trim(),
            modelUsed: `${aiRes.model} (${aiRes.provider})`,
            cached: aiRes.cached,
          },
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          error: { code: "HINT_GENERATION_FAILED", message: err.message },
        };
      }
    },
    {
      body: t.Object({
        questionText: t.String({ minLength: 5 }),
        context: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/ai/generate-narrative — Generate immersive RPG quest narratives for missions
  .post(
    "/generate-narrative",
    async ({ body, set }) => {
      try {
        const { locationName, floorNumber, gameType } = body;
        const prompt = `Buatkan 1 teks narasi pengantar misi RPG yang seru dan imersif untuk petualang mahasiswa baru:
Lokasi: ${locationName} (Lantai ${floorNumber || 1})
Tantangan Game: ${gameType || 'Teka-Teki Logika'}
Suasana: Cyberpunk Fantasy Akademik Kampus UNU Yogyakarta.

Buatkan dalam 2-3 paragraf pendek dengan nada epik, menyebutkan misi yang harus diselesaikan untuk menjaga keseimbangan energi pengetahuan kampus!`;

        const aiRes = await aiGateway.execute({
          prompt,
          systemPrompt: "You are a master RPG narrative writer for educational campus adventures.",
          maxTokens: 500,
          cacheTtlMinutes: 1440, // 24 hours
        });

        return {
          success: true,
          data: {
            narrative: aiRes.text.trim(),
            modelUsed: `${aiRes.model} (${aiRes.provider})`,
            cached: aiRes.cached,
          },
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          error: { code: "NARRATIVE_GENERATION_FAILED", message: err.message },
        };
      }
    },
    {
      body: t.Object({
        locationName: t.String({ minLength: 2 }),
        floorNumber: t.Optional(t.Number()),
        gameType: t.Optional(t.String()),
      }),
    }
  );
