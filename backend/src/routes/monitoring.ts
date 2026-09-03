import { Elysia } from "elysia";
import { db } from "../db";
import {
  teams,
  locations,
  gameSessions,
  scoreTransactions,
  users,
  stages,
} from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import { broadcastToTopic, broadcastAdminEvent, broadcastAnnouncement } from "../realtime";

export const monitoringRoutes = new Elysia({ prefix: "/api/monitoring" })
  .use(requireAdmin)

  // GET /api/monitoring/stats — Overall live event health and summary counters
  .get("/stats", async () => {
    // 1. Total & Active Teams
    const [{ totalTeams }] = await db
      .select({ totalTeams: sql<number>`count(*)` })
      .from(teams);

    const [{ activeTeams }] = await db
      .select({ activeTeams: sql<number>`count(*)` })
      .from(teams)
      .where(eq(teams.status, "ACTIVE"));

    // 2. Total Participants
    const [{ totalParticipants }] = await db
      .select({ totalParticipants: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "PARTICIPANT"));

    // 3. Location Occupancy
    const [{ totalLocations }] = await db
      .select({ totalLocations: sql<number>`count(*)` })
      .from(locations);

    const [{ occupiedLocations }] = await db
      .select({ occupiedLocations: sql<number>`count(*)` })
      .from(locations)
      .where(eq(locations.status, "OCCUPIED"));

    // 4. Game Sessions
    const [{ activeSessions }] = await db
      .select({ activeSessions: sql<number>`count(*)` })
      .from(gameSessions)
      .where(eq(gameSessions.status, "ACTIVE"));

    const [{ completedSessions }] = await db
      .select({ completedSessions: sql<number>`count(*)` })
      .from(gameSessions)
      .where(eq(gameSessions.status, "COMPLETED"));

    // 5. Total Score Distributed
    const [{ totalScore }] = await db
      .select({ totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)` })
      .from(scoreTransactions);

    // 6. Active Stage
    const [activeStage] = await db
      .select()
      .from(stages)
      .where(eq(stages.status, "ACTIVE"))
      .limit(1);

    // 7. Recent Activity Feed (Latest 10 score events)
    const recentActivity = await db
      .select({
        id: scoreTransactions.id,
        amount: scoreTransactions.amount,
        sourceType: scoreTransactions.sourceType,
        reason: scoreTransactions.reason,
        participantName: users.fullName,
        teamName: teams.name,
        createdAt: scoreTransactions.createdAt,
      })
      .from(scoreTransactions)
      .innerJoin(users, eq(scoreTransactions.participantId, users.id))
      .innerJoin(teams, eq(scoreTransactions.teamId, teams.id))
      .orderBy(desc(scoreTransactions.createdAt))
      .limit(10);

    return {
      success: true,
      data: {
        counters: {
          totalTeams: Number(totalTeams),
          activeTeams: Number(activeTeams),
          totalParticipants: Number(totalParticipants),
          totalLocations: Number(totalLocations),
          occupiedLocations: Number(occupiedLocations),
          activeSessions: Number(activeSessions),
          completedSessions: Number(completedSessions),
          totalScoreDistributed: Number(totalScore),
        },
        activeStage: activeStage || null,
        recentActivity,
      },
    };
  })

  // POST /api/monitoring/broadcast — Broadcast live announcement to all participants and buddies
  .post("/broadcast", async ({ body, user }: any) => {
    const { message, severity = "INFO", title = "PENGUMUMAN GAME MASTER" } = body as any;
    broadcastAnnouncement({
      title,
      message,
      severity,
      broadcastBy: user?.username || "ADMIN",
    });
    broadcastAdminEvent("GLOBAL_ANNOUNCEMENT_SENT", { title, message, severity });

    return {
      success: true,
      message: "Pengumuman berhasil disiarkan ke seluruh perangkat peserta dan buddy!",
    };
  })

  // POST /api/monitoring/emergency-freeze — Lockdown / Freeze all active sessions
  .post("/emergency-freeze", async ({ user }: any) => {
    // 1. Pause all active game sessions
    await db
      .update(gameSessions)
      .set({ status: "PAUSED", updatedAt: new Date() })
      .where(eq(gameSessions.status, "ACTIVE"));

    // 2. Broadcast emergency alert
    broadcastToTopic("leaderboard:global", "EMERGENCY_LOCKDOWN", {
      message: "PERHATIAN: Seluruh aktivitas event sedang dijeda sementara oleh Game Master Pusat.",
      frozenAt: new Date().toISOString(),
    });
    broadcastAdminEvent("EMERGENCY_LOCKDOWN_TRIGGERED", { by: user?.username });

    return {
      success: true,
      message: "Protokol darurat aktif! Seluruh sesi permainan di 9 lantai kampus berhasil dijeda.",
    };
  });

