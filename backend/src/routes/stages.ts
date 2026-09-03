import { Elysia, t } from "elysia";
import { db } from "../db";
import { stages } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

export const stageRoutes = new Elysia({ prefix: "/api/stages" })
  .use(requireAdmin)

  .get("/", async () => {
    const data = await db.select().from(stages).orderBy(asc(stages.order));
    return { success: true, data };
  })

  .get("/:id", async ({ params, set }) => {
    const [stage] = await db.select().from(stages).where(eq(stages.id, params.id)).limit(1);
    if (!stage) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Stage not found" } };
    }
    return { success: true, data: stage };
  })

  .post(
    "/",
    async ({ body }) => {
      const [stage] = await db.insert(stages).values({
        name: body.name,
        description: body.description,
        order: body.order,
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
      }).returning();
      return { success: true, data: stage };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        order: t.Number(),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
      }),
    }
  )

  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.order !== undefined) updates.order = body.order;
      if (body.status) updates.status = body.status;
      if (body.startTime) updates.startTime = new Date(body.startTime);
      if (body.endTime) updates.endTime = new Date(body.endTime);

      const [stage] = await db.update(stages).set(updates).where(eq(stages.id, params.id)).returning();
      if (!stage) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Stage not found" } };
      }
      return { success: true, data: stage };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        order: t.Optional(t.Number()),
        status: t.Optional(t.String()),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/stages/sync-roadmap — Seed/Sync Official 3-Day Event Roadmap
  .post("/sync-roadmap", async () => {
    const officialStages = [
      {
        order: 1,
        name: "DAY 1: THE INCUBATION — Fondasi Karakter & Visi 4 Tahun",
        description: "Orientasi mahasiswa baru, aktivasi profil RPG, penyelesaian 16 skenario karakter, pemetaan radar 5 traits, dan ulasan kepribadian AI Senior Mentor.",
        status: "ACTIVE" as const,
      },
      {
        order: 2,
        name: "DAY 2: 9-FLOOR EXPLORATION & MULTI-GAME ARENA",
        description: "Eksplorasi tim di seluruh 9 lantai kampus UNU Yogyakarta. Scan QR pos ruangan untuk membuka 6 mini-game arena: Team Quiz, Speed Reflex, Memory Match, AI Canvas Drawing, Logic Cipher, dan Floor 9 Boss Raid.",
        status: "UPCOMING" as const,
      },
      {
        order: 3,
        name: "DAY 3: GRAND FINALE & CORONATION (Coming Soon ⏳)",
        description: "Rekapitulasi akumulasi poin akhir, penobatan Juara Umum GENIUS 2026, penganugerahan 99 Gelar Codex Tertinggi, dan inisiasi resmi sivitas akademika.",
        status: "UPCOMING" as const,
      },
    ];

    const results: any[] = [];
    for (const def of officialStages) {
      const [existing] = await db.select().from(stages).where(eq(stages.order, def.order)).limit(1);
      if (existing) {
        const [updated] = await db
          .update(stages)
          .set({
            name: def.name,
            description: def.description,
            status: existing.status || def.status,
            updatedAt: new Date(),
          })
          .where(eq(stages.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [inserted] = await db.insert(stages).values(def).returning();
        results.push(inserted);
      }
    }

    return {
      success: true,
      message: "Berhasil menyinkronkan 3-Day Event Roadmap resmi GENIUS 2026!",
      data: results,
    };
  })

  // PUT /api/stages/:id/activate — Activate a stage and adjust other stages
  .put("/:id/activate", async ({ params, set }) => {
    const [targetStage] = await db.select().from(stages).where(eq(stages.id, params.id)).limit(1);
    if (!targetStage) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Stage not found" } };
    }

    const allStages = await db.select().from(stages).orderBy(asc(stages.order));
    for (const s of allStages) {
      let nextStatus: "UPCOMING" | "ACTIVE" | "COMPLETED" = "UPCOMING";
      if (s.order < targetStage.order) {
        nextStatus = "COMPLETED";
      } else if (s.order === targetStage.order) {
        nextStatus = "ACTIVE";
      } else {
        nextStatus = "UPCOMING";
      }

      await db.update(stages).set({ status: nextStatus, updatedAt: new Date() }).where(eq(stages.id, s.id));
    }

    const updatedStages = await db.select().from(stages).orderBy(asc(stages.order));
    return {
      success: true,
      message: `Stage '${targetStage.name}' sekarang aktif sebagai babak utama!`,
      data: updatedStages,
    };
  })

  .delete("/:id", async ({ params, set }) => {
    const [stage] = await db.delete(stages).where(eq(stages.id, params.id)).returning({ id: stages.id });
    if (!stage) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Stage not found" } };
    }
    return { success: true, data: { id: stage.id } };
  });
