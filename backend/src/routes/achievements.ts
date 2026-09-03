import { Elysia, t } from "elysia";
import { db } from "../db";
import { achievements, participantAchievements, users } from "../db/schema";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { authMiddleware, requireUser, requireAdmin } from "../middleware/auth";
import { AchievementEngine } from "../engine/achievements";

export const achievementRoutes = new Elysia({ prefix: "/api/achievements" })
  .use(authMiddleware)
  .use(requireUser)

  // GET /api/achievements — List all achievements with unlock stats
  .get("/", async ({ user }) => {
    const all = await db.select().from(achievements).where(eq(achievements.status, "ACTIVE"));

    // Check which ones the current user has unlocked
    let myUnlockedIds = new Set<string>();
    if (user?.userId) {
      const myAwards = await db
        .select({ achievementId: participantAchievements.achievementId })
        .from(participantAchievements)
        .where(eq(participantAchievements.participantId, user.userId));
      myUnlockedIds = new Set(myAwards.map((a) => a.achievementId));
    }

    const data = all.map((ach) => ({
      ...ach,
      isUnlocked: myUnlockedIds.has(ach.id),
    }));

    return { success: true, data };
  })

  // GET /api/achievements/my — List only achievements unlocked by logged in user
  .get("/my", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
    }

    const myAchievements = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        title: achievements.title,
        description: achievements.description,
        icon: achievements.icon,
        awardedAt: participantAchievements.awardedAt,
      })
      .from(participantAchievements)
      .innerJoin(achievements, eq(participantAchievements.achievementId, achievements.id))
      .where(eq(participantAchievements.participantId, user.userId))
      .orderBy(desc(participantAchievements.awardedAt));

    return { success: true, data: myAchievements };
  })

  // POST /api/achievements/evaluate — Evaluate achievements for current user
  .post("/evaluate", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
    }

    const newlyUnlocked = await AchievementEngine.evaluateAchievements({
      participantId: user.userId,
    });

    return {
      success: true,
      message: newlyUnlocked.length > 0 ? `Selamat! Anda membuka ${newlyUnlocked.length} gelar baru!` : "Evaluasi selesai.",
      newlyUnlockedTitles: newlyUnlocked,
    };
  })

  // Admin Routes
  .use(requireAdmin)

  // POST /api/achievements — Create new achievement rule
  .post(
    "/",
    async ({ body }) => {
      const [achievement] = await db
        .insert(achievements)
        .values({
          name: body.name.trim(),
          title: body.title.trim(),
          description: body.description?.trim() || null,
          condition: body.condition || {},
          icon: body.icon || "🏆",
          status: "ACTIVE",
        })
        .returning();

      return { success: true, data: achievement };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        title: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        condition: t.Record(t.String(), t.Any()),
        icon: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/achievements/sync-99-titles — Seed/Sync all 99 Codex Titles from types catalog
  .post("/sync-99-titles", async () => {
    const { TITLE_CATALOG } = await import("@genius/types");
    const results: any[] = [];

    for (const item of TITLE_CATALOG) {
      const [existing] = await db
        .select()
        .from(achievements)
        .where(eq(achievements.title, item.title))
        .limit(1);

      const condition = {
        rarity: item.rarity,
        category: item.category,
        unlockType: item.unlockType,
        requiredPoints: item.requiredPoints,
        requiredTier: item.requiredTier,
        associatedClass: item.associatedClass,
      };

      if (existing) {
        const [updated] = await db
          .update(achievements)
          .set({
            name: `${item.icon} ${item.title}`,
            description: item.description,
            condition,
            icon: item.icon,
            status: "ACTIVE",
          })
          .where(eq(achievements.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [inserted] = await db
          .insert(achievements)
          .values({
            name: `${item.icon} ${item.title}`,
            title: item.title,
            description: item.description,
            condition,
            icon: item.icon,
            status: "ACTIVE",
          })
          .returning();
        results.push(inserted);
      }
    }

    return {
      success: true,
      message: `Berhasil menyinkronkan ${results.length} gelar dari 99 Codex Titles ke database!`,
      data: results,
    };
  })

  // POST /api/achievements/award-to-participant — Award achievement and equip active title to user
  .post(
    "/award-to-participant",
    async ({ body, set }) => {
      const [user] = await db.select().from(users).where(eq(users.id, body.participantId)).limit(1);
      if (!user) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Peserta tidak ditemukan" } };
      }

      // 1. Find or create achievement
      let [achievement] = await db
        .select()
        .from(achievements)
        .where(eq(achievements.title, body.title.trim()))
        .limit(1);

      if (!achievement) {
        [achievement] = await db
          .insert(achievements)
          .values({
            name: body.title.trim(),
            title: body.title.trim(),
            description: body.reason?.trim() || "Penganugerahan gelar manual oleh Game Master / Admin",
            condition: { unlockType: "ADMIN", rarity: body.rarity || "RARE" },
            icon: body.icon || "🏆",
            status: "ACTIVE",
          })
          .returning();
      }

      // 2. Link to participant_achievements if not already unlocked
      const [existingAward] = await db
        .select()
        .from(participantAchievements)
        .where(
          sql`${participantAchievements.participantId} = ${user.id} AND ${participantAchievements.achievementId} = ${achievement.id}`
        )
        .limit(1);

      if (!existingAward) {
        await db.insert(participantAchievements).values({
          participantId: user.id,
          achievementId: achievement.id,
          awardedAt: new Date(),
        });
      }

      // 3. Equip as single active characterTitle in user profile
      const [updatedUser] = await db
        .update(users)
        .set({
          characterTitle: achievement.title,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      return {
        success: true,
        message: `Gelar '${achievement.title}' berhasil disematkan kepada ${updatedUser.fullName} (@${updatedUser.username})!`,
        data: {
          user: updatedUser,
          achievement,
        },
      };
    },
    {
      body: t.Object({
        participantId: t.String(),
        title: t.String(),
        rarity: t.Optional(t.String()),
        icon: t.Optional(t.String()),
        reason: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/achievements/:id — Delete achievement
  .delete("/:id", async ({ params, set }) => {
    const [deleted] = await db.delete(achievements).where(eq(achievements.id, params.id)).returning({ id: achievements.id });
    if (!deleted) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Achievement not found" } };
    }
    return { success: true, data: { id: deleted.id } };
  });
