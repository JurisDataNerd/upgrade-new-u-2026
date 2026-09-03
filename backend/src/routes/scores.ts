import { Elysia, t } from "elysia";
import { db } from "../db";
import { scoreTransactions, users, teams, stages, teamMembers } from "../db/schema";
import { eq, sql, desc, and, inArray } from "drizzle-orm";
import { authMiddleware, requireBuddyOrAdmin, requireAdmin } from "../middleware/auth";
import { logAudit } from "../lib/audit";
import { broadcastLeaderboardUpdate, broadcastAdminEvent } from "../realtime";

const BUDDY_STAGE_BUDGET_LIMIT = 100; // Total 100 pts budget per stage for Buddy
const BUDDY_SINGLE_BONUS_MAX = 25; // Max 25 pts per single bonus award

export const scoreRoutes = new Elysia({
  prefix: "/api/scores",
  detail: {
    tags: ["Scores & XP Ledger"],
  },
})
  .use(authMiddleware)
  .use(requireBuddyOrAdmin)

  // GET /api/scores/transactions — Audit trail of score ledger
  .get("/transactions", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 25;
    const offset = (page - 1) * pageSize;

    const participantId = query.participantId || "";
    const teamId = query.teamId || "";
    const stageId = query.stageId || "";
    const sourceType = query.sourceType || "";

    let q = db
      .select({
        id: scoreTransactions.id,
        participantId: scoreTransactions.participantId,
        participantName: users.fullName,
        participantUsername: users.username,
        teamId: scoreTransactions.teamId,
        teamName: teams.name,
        amount: scoreTransactions.amount,
        sourceType: scoreTransactions.sourceType,
        sourceId: scoreTransactions.sourceId,
        reason: scoreTransactions.reason,
        stageId: scoreTransactions.stageId,
        stageName: stages.name,
        gameSessionId: scoreTransactions.gameSessionId,
        createdAt: scoreTransactions.createdAt,
      })
      .from(scoreTransactions)
      .innerJoin(users, eq(scoreTransactions.participantId, users.id))
      .innerJoin(teams, eq(scoreTransactions.teamId, teams.id))
      .leftJoin(stages, eq(scoreTransactions.stageId, stages.id))
      .$dynamic();

    const conditions = [];
    if (participantId) conditions.push(eq(scoreTransactions.participantId, participantId));
    if (teamId) conditions.push(eq(scoreTransactions.teamId, teamId));
    if (stageId) conditions.push(eq(scoreTransactions.stageId, stageId));
    if (sourceType) conditions.push(eq(scoreTransactions.sourceType, sourceType as any));

    if (conditions.length > 0) {
      q = q.where(and(...conditions));
    }

    const data = await q.orderBy(desc(scoreTransactions.createdAt)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(scoreTransactions);

    return {
      success: true,
      data,
      meta: { page, pageSize, total: Number(count) },
    };
  })

  // GET /api/scores/buddy-budget — Get remaining bonus budget for current Buddy
  .get("/buddy-budget", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
    }

    const stageId = query.stageId;
    let whereClause = and(
      eq(scoreTransactions.createdBy, user.userId),
      eq(scoreTransactions.sourceType, "BONUS")
    );

    if (stageId) {
      whereClause = and(whereClause, eq(scoreTransactions.stageId, stageId));
    }

    const [usedRow] = await db
      .select({ used: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)` })
      .from(scoreTransactions)
      .where(whereClause);

    const usedBudget = Number(usedRow?.used || 0);
    const remainingBudget = Math.max(0, BUDDY_STAGE_BUDGET_LIMIT - usedBudget);

    return {
      success: true,
      data: {
        totalBudget: BUDDY_STAGE_BUDGET_LIMIT,
        usedBudget,
        remainingBudget,
        maxPerBonus: BUDDY_SINGLE_BONUS_MAX,
      },
    };
  })

  // POST /api/scores/buddy-bonus — Award buddy bonus within budget
  .post(
    "/buddy-bonus",
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
      }

      const { participantId, teamId, amount, reason, stageId } = body;

      if (amount > BUDDY_SINGLE_BONUS_MAX) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "EXCEEDS_SINGLE_LIMIT",
            message: `Maksimum bonus per pemberian adalah ${BUDDY_SINGLE_BONUS_MAX} poin.`,
          },
        };
      }

      // Check Buddy remaining budget for this stage
      let budgetCheck = and(
        eq(scoreTransactions.createdBy, user.userId),
        eq(scoreTransactions.sourceType, "BONUS")
      );
      if (stageId) {
        budgetCheck = and(budgetCheck, eq(scoreTransactions.stageId, stageId));
      }

      const [usedRow] = await db
        .select({ used: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)` })
        .from(scoreTransactions)
        .where(budgetCheck);

      const currentUsed = Number(usedRow?.used || 0);
      if (currentUsed + amount > BUDDY_STAGE_BUDGET_LIMIT && user.role !== "ADMIN") {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "BUDGET_EXCEEDED",
            message: `Sisa budget bonus Anda (${BUDDY_STAGE_BUDGET_LIMIT - currentUsed} pts) tidak mencukupi untuk memberikan ${amount} pts.`,
          },
        };
      }

      // Insert Score Transaction
      const [tx] = await db
        .insert(scoreTransactions)
        .values({
          participantId,
          teamId,
          amount,
          sourceType: "BONUS",
          reason: reason.trim(),
          stageId: stageId || null,
          createdBy: user.userId,
        })
        .returning();

      // Log Audit
      await logAudit({
        actorId: user.userId,
        actorRole: user.role as any,
        action: "BUDDY_BONUS_AWARDED",
        targetType: "PARTICIPANT",
        targetId: participantId,
        details: { amount, reason, teamId, stageId },
      });

      broadcastLeaderboardUpdate({ type: "BONUS_AWARDED", teamId, participantId, amount });
      broadcastAdminEvent("BUDDY_BONUS_AWARDED", { amount, reason, teamId, participantId });

      return {
        success: true,
        message: `Bonus sebesar +${amount} poin berhasil diberikan!`,
        data: tx,
      };
    },
    {
      body: t.Object({
        participantId: t.String(),
        teamId: t.String(),
        amount: t.Number({ minimum: 1 }),
        reason: t.String({ minLength: 5 }),
        stageId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/scores/bonus — Generic bonus endpoint
  .post(
    "/bonus",
    async ({ body, user }) => {
      const [tx] = await db
        .insert(scoreTransactions)
        .values({
          participantId: body.participantId,
          teamId: body.teamId,
          amount: body.amount,
          sourceType: "BONUS",
          reason: body.reason.trim(),
          stageId: body.stageId || null,
          createdBy: user?.userId || null,
        })
        .returning();

      broadcastLeaderboardUpdate({ type: "BONUS_AWARDED", teamId: body.teamId, amount: body.amount });

      return { success: true, data: tx };
    },
    {
      body: t.Object({
        participantId: t.String(),
        teamId: t.String(),
        amount: t.Number({ minimum: 1, maximum: 100 }),
        reason: t.String({ minLength: 3 }),
        stageId: t.Optional(t.String()),
      }),
    }
  )

  // Admin-Only Score Corrections
  .use(requireAdmin)

  // POST /api/scores/correction — Admin manual score adjustment (preserves ledger integrity)
  .post(
    "/correction",
    async ({ body, user }) => {
      const [tx] = await db
        .insert(scoreTransactions)
        .values({
          participantId: body.participantId,
          teamId: body.teamId,
          amount: body.amount,
          sourceType: "CORRECTION",
          reason: `[KOREKSI ADMIN] ${body.reason.trim()}`,
          stageId: body.stageId || null,
          createdBy: user?.userId || null,
        })
        .returning();

      await logAudit({
        actorId: user?.userId,
        actorRole: "ADMIN",
        action: "SCORE_CORRECTION",
        targetType: "PARTICIPANT",
        targetId: body.participantId,
        details: { amount: body.amount, reason: body.reason, teamId: body.teamId },
      });

      broadcastLeaderboardUpdate({ type: "SCORE_CORRECTION", teamId: body.teamId, amount: body.amount });
      broadcastAdminEvent("SCORE_CORRECTION", { amount: body.amount, reason: body.reason, teamId: body.teamId });

      return { success: true, data: tx, message: "Koreksi skor berhasil dicatat di Point Ledger." };
    },
    {
      body: t.Object({
        participantId: t.String(),
        teamId: t.String(),
        amount: t.Number(), // positive or negative
        reason: t.String({ minLength: 3 }),
        stageId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/scores/bulk-correction — Admin mass adjustment for multiple participants
  .post(
    "/bulk-correction",
    async ({ body, user }) => {
      const { participantIds, teamId, amount, reason, stageId } = body;

      const inserts = participantIds.map((pId) => ({
        participantId: pId,
        teamId,
        amount,
        sourceType: "CORRECTION" as any,
        reason: `[MASS KOREKSI] ${reason.trim()}`,
        stageId: stageId || null,
        createdBy: user?.userId || null,
      }));

      const created = await db.insert(scoreTransactions).values(inserts).returning({ id: scoreTransactions.id });

      await logAudit({
        actorId: user?.userId,
        actorRole: "ADMIN",
        action: "BULK_SCORE_CORRECTION",
        targetType: "TEAM",
        targetId: teamId,
        details: { participantCount: participantIds.length, amount, reason },
      });

      return {
        success: true,
        count: created.length,
        message: `Berhasil menyesuaikan skor ${created.length} peserta.`,
      };
    },
    {
      body: t.Object({
        participantIds: t.Array(t.String()),
        teamId: t.String(),
        amount: t.Number(),
        reason: t.String({ minLength: 3 }),
        stageId: t.Optional(t.String()),
      }),
    }
  );
