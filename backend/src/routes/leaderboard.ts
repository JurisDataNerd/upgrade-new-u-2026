import { Elysia, t } from "elysia";
import { db } from "../db";
import { scoreTransactions, users, teams, teamMembers } from "../db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { authMiddleware, requireUser } from "../middleware/auth";
import { broadcastLeaderboardUpdate } from "../realtime";
import { logAudit } from "../lib/audit";

export const leaderboardRoutes = new Elysia({
  prefix: "/api/leaderboard",
  detail: {
    tags: ["Leaderboard & Ranking"],
  },
})
  .use(authMiddleware)
  .use(requireUser)

  // GET /api/leaderboard — Combined team & participant leaderboard + recent ledger
  .get("/", async ({ query }) => {
    const stageId = query.stageId || "";
    const limit = Number(query.limit) || 20;

    const teamJoinCondition = stageId
      ? and(eq(teams.id, scoreTransactions.teamId), eq(scoreTransactions.stageId, stageId))
      : eq(teams.id, scoreTransactions.teamId);

    // 1. Team Leaderboard
    const topTeams = await db
      .select({
        teamId: teams.id,
        teamName: teams.name,
        teamCode: teams.code,
        totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_score"),
        transactionCount: sql<number>`COUNT(${scoreTransactions.id})`.as("transaction_count"),
      })
      .from(teams)
      .leftJoin(scoreTransactions, teamJoinCondition)
      .groupBy(teams.id, teams.name, teams.code)
      .orderBy(desc(sql`total_score`))
      .limit(limit);

    // 2. Participant Leaderboard
    let participantQuery = db
      .select({
        participantId: scoreTransactions.participantId,
        participantName: users.fullName,
        username: users.username,
        gender: users.gender,
        characterClass: users.characterClass,
        characterTitle: users.characterTitle,
        characterTier: users.characterTier,
        teamId: scoreTransactions.teamId,
        teamName: teams.name,
        totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_score"),
        transactionCount: sql<number>`COUNT(${scoreTransactions.id})`.as("transaction_count"),
      })
      .from(scoreTransactions)
      .innerJoin(users, eq(scoreTransactions.participantId, users.id))
      .leftJoin(teams, eq(scoreTransactions.teamId, teams.id))
      .$dynamic();

    if (stageId) {
      participantQuery = participantQuery.where(eq(scoreTransactions.stageId, stageId));
    }

    const topParticipants = await participantQuery
      .groupBy(
        scoreTransactions.participantId,
        users.fullName,
        users.username,
        users.gender,
        users.characterClass,
        users.characterTitle,
        users.characterTier,
        scoreTransactions.teamId,
        teams.name
      )
      .orderBy(desc(sql`total_score`))
      .limit(limit);

    // 3. Recent Transactions
    const recentTransactions = await db
      .select({
        id: scoreTransactions.id,
        teamId: scoreTransactions.teamId,
        teamName: teams.name,
        participantId: scoreTransactions.participantId,
        participantName: users.fullName,
        type: scoreTransactions.sourceType,
        amount: scoreTransactions.amount,
        description: scoreTransactions.reason,
        createdAt: scoreTransactions.createdAt,
      })
      .from(scoreTransactions)
      .leftJoin(teams, eq(scoreTransactions.teamId, teams.id))
      .leftJoin(users, eq(scoreTransactions.participantId, users.id))
      .orderBy(desc(scoreTransactions.createdAt))
      .limit(15);

    return {
      success: true,
      data: {
        teamLeaderboard: topTeams.map((t, index) => ({
          rank: index + 1,
          teamId: t.teamId,
          teamName: t.teamName,
          teamCode: t.teamCode,
          totalScore: Number(t.totalScore),
          transactionCount: Number(t.transactionCount),
        })),
        participantLeaderboard: topParticipants.map((p, index) => ({
          rank: index + 1,
          participantId: p.participantId,
          participantName: p.participantName,
          username: p.username,
          gender: p.gender,
          characterClass: p.characterClass,
          characterTitle: p.characterTitle,
          characterTier: p.characterTier,
          teamId: p.teamId,
          teamName: p.teamName,
          totalScore: Number(p.totalScore),
          transactionCount: Number(p.transactionCount),
        })),
        recentTransactions: recentTransactions.map((tx) => ({
          ...tx,
          balanceAfter: tx.amount,
        })),
      },
    };
  })

  // GET /api/leaderboard/individual — Top participants ranking
  .get("/individual", async ({ query, user }) => {
    const stageId = query.stageId || "";
    const limit = Number(query.limit) || 10;

    let participantQuery = db
      .select({
        participantId: scoreTransactions.participantId,
        participantName: users.fullName,
        username: users.username,
        gender: users.gender,
        characterClass: users.characterClass,
        characterTitle: users.characterTitle,
        characterTier: users.characterTier,
        teamId: scoreTransactions.teamId,
        teamName: teams.name,
        totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_score"),
        transactionCount: sql<number>`COUNT(${scoreTransactions.id})`.as("transaction_count"),
      })
      .from(scoreTransactions)
      .innerJoin(users, eq(scoreTransactions.participantId, users.id))
      .leftJoin(teams, eq(scoreTransactions.teamId, teams.id))
      .$dynamic();

    if (stageId) {
      participantQuery = participantQuery.where(eq(scoreTransactions.stageId, stageId));
    }

    const topParticipants = await participantQuery
      .groupBy(
        scoreTransactions.participantId,
        users.fullName,
        users.username,
        users.gender,
        users.characterClass,
        users.characterTitle,
        users.characterTier,
        scoreTransactions.teamId,
        teams.name
      )
      .orderBy(desc(sql`total_score`))
      .limit(limit);

    // If current user is a participant, get their specific position
    let myPosition = null;
    if (user?.userId) {
      let myRankQuery = db
        .select({
          participantId: scoreTransactions.participantId,
          totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_score"),
        })
        .from(scoreTransactions)
        .$dynamic();

      if (stageId) {
        myRankQuery = myRankQuery.where(eq(scoreTransactions.stageId, stageId));
      }

      const allRanked = await myRankQuery
        .groupBy(scoreTransactions.participantId)
        .orderBy(desc(sql`total_score`));

      const rankIndex = allRanked.findIndex((p) => p.participantId === user.userId);
      if (rankIndex !== -1) {
        myPosition = {
          rank: rankIndex + 1,
          totalScore: Number(allRanked[rankIndex].totalScore),
        };
      }
    }

    return {
      success: true,
      data: {
        leaderboard: topParticipants.map((p, index) => ({
          rank: index + 1,
          participantId: p.participantId,
          participantName: p.participantName,
          username: p.username,
          gender: p.gender,
          characterClass: p.characterClass,
          characterTitle: p.characterTitle,
          characterTier: p.characterTier,
          teamId: p.teamId,
          teamName: p.teamName,
          totalScore: Number(p.totalScore),
          transactionCount: Number(p.transactionCount),
        })),
        myPosition,
      },
    };
  })

  // GET /api/leaderboard/team — Top teams ranking
  .get("/team", async ({ query, user }) => {
    const stageId = query.stageId || "";
    const limit = Number(query.limit) || 10;

    const teamJoinCondition = stageId
      ? and(eq(teams.id, scoreTransactions.teamId), eq(scoreTransactions.stageId, stageId))
      : eq(teams.id, scoreTransactions.teamId);

    // Team rankings query
    const topTeams = await db
      .select({
        teamId: teams.id,
        teamName: teams.name,
        teamCode: teams.code,
        totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_score"),
        transactionCount: sql<number>`COUNT(${scoreTransactions.id})`.as("transaction_count"),
      })
      .from(teams)
      .leftJoin(scoreTransactions, teamJoinCondition)
      .groupBy(teams.id, teams.name, teams.code)
      .orderBy(desc(sql`total_score`))
      .limit(limit);

    // Get my team rank if user is in a team
    let myTeamPosition = null;
    if (user?.userId) {
      const [membership] = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.userId))
        .limit(1);

      if (membership?.teamId) {
        const allTeamsRanked = await db
          .select({
            teamId: teams.id,
            totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_score"),
          })
          .from(teams)
          .leftJoin(scoreTransactions, teamJoinCondition)
          .groupBy(teams.id)
          .orderBy(desc(sql`total_score`));

        const teamIndex = allTeamsRanked.findIndex((t) => t.teamId === membership.teamId);
        if (teamIndex !== -1) {
          myTeamPosition = {
            teamId: membership.teamId,
            rank: teamIndex + 1,
            totalScore: Number(allTeamsRanked[teamIndex].totalScore),
          };
        }
      }
    }

    return {
      success: true,
      data: {
        leaderboard: topTeams.map((t, index) => ({
          rank: index + 1,
          teamId: t.teamId,
          teamName: t.teamName,
          teamCode: t.teamCode,
          totalScore: Number(t.totalScore),
          transactionCount: Number(t.transactionCount),
        })),
        myTeamPosition,
      },
    };
  })

  // POST /api/leaderboard/adjust — Admin score adjustment / correction
  .post(
    "/adjust",
    async ({ body, user, set }) => {
      if (user?.role !== "ADMIN") {
        set.status = 403;
        return { success: false, error: { message: "Hanya role ADMIN yang berhak melakukan penyesuaian skor" } };
      }

      const { teamId, amount, reason, participantId } = body;

      // Find any participant in this team if participantId is not supplied
      let targetParticipantId = participantId;
      if (!targetParticipantId) {
        const [firstMember] = await db
          .select({ userId: teamMembers.userId })
          .from(teamMembers)
          .where(eq(teamMembers.teamId, teamId))
          .limit(1);
        targetParticipantId = firstMember?.userId || user.userId;
      }

      const [transaction] = await db
        .insert(scoreTransactions)
        .values({
          teamId,
          participantId: targetParticipantId,
          sourceType: "CORRECTION",
          amount: Number(amount),
          reason: `Koreksi Admin: ${reason}`,
          createdBy: user.userId,
        })
        .returning();

      await logAudit({
        actorId: user.userId,
        actorRole: "ADMIN",
        action: "SCORE_ADJUSTED",
        targetType: "TEAM",
        targetId: teamId,
        details: { amount, reason },
      });

      broadcastLeaderboardUpdate({ type: "SCORE_CORRECTION", teamId, amount });

      return {
        success: true,
        data: transaction,
        message: "Penyesuaian skor berhasil disimpan dan disiarkan ke realtime leaderboard.",
      };
    },
    {
      body: t.Object({
        teamId: t.String(),
        amount: t.Number(),
        reason: t.String({ minLength: 3 }),
        participantId: t.Optional(t.String()),
      }),
    }
  );
