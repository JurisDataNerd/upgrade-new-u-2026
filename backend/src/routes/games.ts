import { Elysia, t } from "elysia";
import { db } from "../db";
import { games, missions } from "../db/schema";
import { eq, sql, desc, or, ilike, inArray } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

export const gameRoutes = new Elysia({
  prefix: "/api/games",
  detail: {
    tags: ["Mini Games & Quests"],
  },
})
  .use(requireAdmin)

  // GET /api/games — List all game definitions with mission usage counts
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    const type = query.type || "";
    const status = query.status || "";
    const search = query.search?.trim();

    let q = db.select().from(games).$dynamic();

    if (type) {
      q = q.where(eq(games.type, type as any));
    }
    if (status) {
      q = q.where(eq(games.status, status as any));
    }
    if (search) {
      q = q.where(or(ilike(games.name, `%${search}%`), ilike(games.description, `%${search}%`)));
    }

    const allGames = await q.orderBy(desc(games.createdAt)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(games);

    if (allGames.length === 0) {
      return {
        success: true,
        data: [],
        meta: { page, pageSize, total: Number(count) },
      };
    }

    const gameIds = allGames.map((g) => g.id);

    // Aggregate mission usage
    const missionCounts = await db
      .select({
        gameId: missions.gameId,
        count: sql<number>`count(*)`,
      })
      .from(missions)
      .where(inArray(missions.gameId, gameIds))
      .groupBy(missions.gameId);

    const usageMap = new Map(missionCounts.map((m) => [m.gameId, Number(m.count)]));

    const data = allGames.map((g) => ({
      ...g,
      missionUsageCount: usageMap.get(g.id) || 0,
    }));

    return {
      success: true,
      data,
      meta: { page, pageSize, total: Number(count) },
    };
  })

  // GET /api/games/:id — Get single game definition
  .get("/:id", async ({ params, set }) => {
    const [game] = await db.select().from(games).where(eq(games.id, params.id)).limit(1);
    if (!game) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Game definition not found" } };
    }
    return { success: true, data: game };
  })

  // POST /api/games — Create new game definition
  .post(
    "/",
    async ({ body }) => {
      const [game] = await db
        .insert(games)
        .values({
          name: body.name.trim(),
          description: body.description?.trim() || null,
          instructions: body.instructions?.trim() || null,
          type: body.type as any,
          config: body.config || {},
          questionBankCategory: body.questionBankCategory?.trim() || null,
          minPlayers: body.minPlayers ?? 1,
          maxPlayers: body.maxPlayers ?? 12,
          status: (body.status as any) || "ACTIVE",
        })
        .returning();

      return { success: true, data: game };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        instructions: t.Optional(t.String()),
        type: t.String(),
        config: t.Optional(t.Record(t.String(), t.Any())),
        questionBankCategory: t.Optional(t.String()),
        minPlayers: t.Optional(t.Number()),
        maxPlayers: t.Optional(t.Number()),
        status: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/games/:id — Update game definition
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name) updates.name = body.name.trim();
      if (body.description !== undefined) updates.description = body.description?.trim() || null;
      if (body.instructions !== undefined) updates.instructions = body.instructions?.trim() || null;
      if (body.type) updates.type = body.type;
      if (body.config !== undefined) updates.config = body.config;
      if (body.questionBankCategory !== undefined) updates.questionBankCategory = body.questionBankCategory?.trim() || null;
      if (body.minPlayers !== undefined) updates.minPlayers = body.minPlayers;
      if (body.maxPlayers !== undefined) updates.maxPlayers = body.maxPlayers;
      if (body.status) updates.status = body.status;

      const [game] = await db
        .update(games)
        .set(updates)
        .where(eq(games.id, params.id))
        .returning();

      if (!game) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Game definition not found" } };
      }

      return { success: true, data: game };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.Nullable(t.String())),
        instructions: t.Optional(t.Nullable(t.String())),
        type: t.Optional(t.String()),
        config: t.Optional(t.Record(t.String(), t.Any())),
        questionBankCategory: t.Optional(t.Nullable(t.String())),
        minPlayers: t.Optional(t.Number()),
        maxPlayers: t.Optional(t.Number()),
        status: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/games/sync-defaults — Seed or Sync all 7 Core Game Engines
  .post("/sync-defaults", async () => {
    const defaultGames = [
      {
        name: "Team Quiz Hub — Wawasan Kampus & AI",
        type: "QUIZ" as const,
        description: "Kuis multipemain interaktif wawasan sejarah UNU Yogyakarta, Aswaja An-Nahdliyah, Sains Modern, dan Etika AI.",
        instructions: "Jawab setiap soal sebelum waktu habis. Dapatkan streak combo untuk menggandakan skor regu!",
        config: { questionsCount: 5, timeLimitPerQuestion: 15, streakMultiplier: 1.5, baseScorePerQuestion: 20, allowSkip: false, shuffleOptions: true },
        questionBankCategory: "Kampus UNU",
        minPlayers: 1,
        maxPlayers: 10,
        status: "ACTIVE" as const,
      },
      {
        name: "Speed Reaction — Cyber Reflex Tap",
        type: "REACTION" as const,
        description: "Arena uji kecepatan refleks sensorik. Tap target cyber neon yang muncul secepat kilat untuk mengumpulkan poin.",
        instructions: "Ketuk target hijau/emas segera saat muncul. Hindari jebakan target merah yang memotong poin!",
        config: { targetCount: 15, spawnIntervalMs: 1200, timeLimitSeconds: 45, maxScore: 100, missPenaltyScore: 5 },
        questionBankCategory: "Refleks",
        minPlayers: 1,
        maxPlayers: 5,
        status: "ACTIVE" as const,
      },
      {
        name: "Memory Match — Matrix Card Recall",
        type: "MEMORY" as const,
        description: "Permainan mengingat dan mencocokkan pasangan kartu simbol sains, fakultas UNU, dan artefak AI.",
        instructions: "Balik 2 kartu secara berurutan. Cocokkan semua pasangan sebelum batas giliran dan waktu berakhir!",
        config: { gridSize: "4x4", totalPairs: 8, timeLimitSeconds: 60, maxScore: 100, maxFlipsAllowed: 24 },
        questionBankCategory: "Memori",
        minPlayers: 1,
        maxPlayers: 5,
        status: "ACTIVE" as const,
      },
      {
        name: "AI Canvas Drawing — Kurator Seni Senior",
        type: "IMAGE_GUESS" as const,
        description: "Tantangan menggambar di kanvas digital realtime berdasarkan prompt acak, dinilai langsung oleh AI Senior Art Curator.",
        instructions: "Lukis objek/situasi sesuai kalimat prompt dalam batas waktu. AI akan mengulas karya senimu dan menghadiahkan gelar unik!",
        config: { drawingTimeSeconds: 60, aiModel: "gemini-2.0-flash", maxScore: 100, allowColorPalette: true, persona: "SARCASTIC_EDUCATIONAL" },
        questionBankCategory: "Kreativitas",
        minPlayers: 1,
        maxPlayers: 10,
        status: "ACTIVE" as const,
      },
      {
        name: "Cyber Decoder — Logic Cipher Solver",
        type: "PUZZLE" as const,
        description: "Teka-teki pemecahan sandi logika, urutan deret angka biner, dan kode enkripsi server gedung kampus.",
        instructions: "Analisis pola angka/simbol, masukkan digit kunci jawaban pada terminal keypad sebelum server terkunci!",
        config: { cipherDifficulty: "MEDIUM", maxAttempts: 4, timeLimitSeconds: 60, maxScore: 100, showHintAfterSeconds: 20 },
        questionBankCategory: "Logika",
        minPlayers: 1,
        maxPlayers: 5,
        status: "ACTIVE" as const,
      },
      {
        name: "Day 1 Incubation — Profiling Karakter & Visi 4 Tahun",
        type: "EXPLORATION" as const,
        description: "16 Skenario interaktif kepemimpinan, riset, dan dinamika tim untuk memetakan Archetype petualang serta ulasan mentor AI.",
        instructions: "Pilih respon keputusan yang paling mencerminkan dirimu. Dapatkan peta radar 5 Traits dan gelar inisiat!",
        config: { totalScenarios: 16, completionRewardPoints: 100, isGameMasterLocked: false, aiModel: "gemini-2.0-flash" },
        questionBankCategory: "Psikologi",
        minPlayers: 1,
        maxPlayers: 50,
        status: "ACTIVE" as const,
      },
      {
        name: "Boss Showdown — Raid Pertarungan Lantai 9",
        type: "TEAM_CHALLENGE" as const,
        description: "Pertarungan kooperatif pamungkas di Sky Garden Lantai 9 menghadapi Guardian AI untuk penentuan juara angkatan.",
        instructions: "Kombinasikan skill kelas RPG regu kalian, selesaikan Quick-Time Event bersama, dan kalahkan Boss sebelum waktu habis!",
        config: { bossMaxHp: 5000, timeLimitSeconds: 180, qteIntervalSeconds: 8, teamDamageMultiplier: 1.25, maxScore: 250 },
        questionBankCategory: "Boss Raid",
        minPlayers: 3,
        maxPlayers: 20,
        status: "ACTIVE" as const,
      },
    ];

    const results: any[] = [];
    for (const def of defaultGames) {
      const [existing] = await db.select().from(games).where(eq(games.type, def.type)).limit(1);
      if (existing) {
        const [updated] = await db
          .update(games)
          .set({
            name: def.name,
            description: def.description,
            instructions: def.instructions,
            config: def.config,
            questionBankCategory: def.questionBankCategory,
            minPlayers: def.minPlayers,
            maxPlayers: def.maxPlayers,
            status: "ACTIVE",
            updatedAt: new Date(),
          })
          .where(eq(games.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [inserted] = await db.insert(games).values(def).returning();
        results.push(inserted);
      }
    }

    return {
      success: true,
      message: `Berhasil menyinkronkan ${results.length} engine game default ke database!`,
      data: results,
    };
  })

  // PUT /api/games/:id/toggle-status — Quick toggle between ACTIVE and INACTIVE
  .put("/:id/toggle-status", async ({ params, set }) => {
    const [game] = await db.select().from(games).where(eq(games.id, params.id)).limit(1);
    if (!game) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Game not found" } };
    }

    const nextStatus = game.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const [updated] = await db
      .update(games)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(games.id, params.id))
      .returning();

    return {
      success: true,
      message: `Status game '${updated.name}' diubah menjadi ${nextStatus}.`,
      data: updated,
    };
  })

  // DELETE /api/games/:id — Delete game definition
  .delete("/:id", async ({ params, set }) => {
    const [game] = await db
      .delete(games)
      .where(eq(games.id, params.id))
      .returning({ id: games.id });

    if (!game) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Game definition not found" } };
    }

    return { success: true, data: { id: game.id } };
  });
