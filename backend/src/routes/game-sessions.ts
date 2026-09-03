import { Elysia, t } from "elysia";
import { db } from "../db";
import {
  gameSessions,
  games,
  missions,
  teams,
  locations,
  users,
  scoreTransactions,
  teamMembers,
} from "../db/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { authMiddleware, requireUser, requireBuddyOrAdmin } from "../middleware/auth";
import { GameEngine } from "../engine";
import { AchievementEngine } from "../engine/achievements";
import { logAudit } from "../lib/audit";
import {
  broadcastGameSessionEvent,
  broadcastAdminEvent,
  broadcastLeaderboardUpdate,
} from "../realtime";
import {
  getRandomDrawingSentence,
  evaluateDrawingWithAI,
  saveAIDrawingResult,
} from "../engine/aiDrawing";

export const gameSessionRoutes = new Elysia({
  prefix: "/api/game-sessions",
  detail: {
    tags: ["Game Sessions & Play Engine"],
  },
})
  .use(authMiddleware)
  .use(requireUser)

  // GET /api/game-sessions — List all game sessions for Admin & Monitoring
  .get("/", async ({ query }) => {
    const { status, limit = "50" } = query;
    let queryBuilder = db
      .select({
        id: gameSessions.id,
        gameId: gameSessions.gameId,
        gameName: games.name,
        gameType: games.type,
        missionId: gameSessions.missionId,
        missionName: missions.name,
        teamId: gameSessions.teamId,
        teamName: teams.name,
        locationId: gameSessions.locationId,
        locationName: locations.name,
        locationCode: locations.code,
        buddyId: gameSessions.buddyId,
        buddyName: users.fullName,
        status: gameSessions.status,
        serverStartAt: gameSessions.serverStartAt,
        serverEndAt: gameSessions.serverEndAt,
        timeLimit: gameSessions.timeLimit,
        totalScore: gameSessions.totalScore,
        createdAt: gameSessions.createdAt,
      })
      .from(gameSessions)
      .innerJoin(games, eq(gameSessions.gameId, games.id))
      .leftJoin(missions, eq(gameSessions.missionId, missions.id))
      .leftJoin(teams, eq(gameSessions.teamId, teams.id))
      .leftJoin(locations, eq(gameSessions.locationId, locations.id))
      .leftJoin(users, eq(gameSessions.buddyId, users.id))
      .orderBy(desc(gameSessions.createdAt))
      .limit(Number(limit));

    if (status) {
      const data = await queryBuilder.where(eq(gameSessions.status, status as any));
      return { success: true, data };
    }

    const data = await queryBuilder;
    return { success: true, data };
  })

  // GET /api/game-sessions/active — Get currently active session for current user's team
  .get("/active", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
    }

    let teamId = user.teamId;
    if (!teamId) {
      const [membership] = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.userId))
        .limit(1);
      teamId = membership?.teamId;
    }

    if (!teamId) {
      return { success: true, data: null, message: "User is not in any team" };
    }

    const [activeSession] = await db
      .select({
        id: gameSessions.id,
        gameId: gameSessions.gameId,
        gameName: games.name,
        gameType: games.type,
        gameConfig: games.config,
        missionId: gameSessions.missionId,
        missionName: missions.name,
        teamId: gameSessions.teamId,
        locationId: gameSessions.locationId,
        locationName: locations.name,
        locationCode: locations.code,
        status: gameSessions.status,
        serverStartAt: gameSessions.serverStartAt,
        timeLimit: gameSessions.timeLimit,
        metadata: gameSessions.metadata,
      })
      .from(gameSessions)
      .innerJoin(games, eq(gameSessions.gameId, games.id))
      .leftJoin(missions, eq(gameSessions.missionId, missions.id))
      .leftJoin(locations, eq(gameSessions.locationId, locations.id))
      .where(and(eq(gameSessions.teamId, teamId), inArray(gameSessions.status, ["READY", "ACTIVE", "PAUSED"])))
      .orderBy(desc(gameSessions.createdAt))
      .limit(1);

    return { success: true, data: activeSession || null };
  })

  // GET /api/game-sessions/:id — Get session status and details
  .get("/:id", async ({ params, set }) => {
    const [session] = await db
      .select({
        id: gameSessions.id,
        gameId: gameSessions.gameId,
        gameName: games.name,
        gameType: games.type,
        gameConfig: games.config,
        instructions: games.instructions,
        missionId: gameSessions.missionId,
        missionName: missions.name,
        teamId: gameSessions.teamId,
        teamName: teams.name,
        locationId: gameSessions.locationId,
        locationName: locations.name,
        locationCode: locations.code,
        buddyId: gameSessions.buddyId,
        buddyName: users.fullName,
        status: gameSessions.status,
        serverStartAt: gameSessions.serverStartAt,
        serverEndAt: gameSessions.serverEndAt,
        timeLimit: gameSessions.timeLimit,
        participants: gameSessions.participants,
        result: gameSessions.result,
        totalScore: gameSessions.totalScore,
        metadata: gameSessions.metadata,
        createdAt: gameSessions.createdAt,
      })
      .from(gameSessions)
      .innerJoin(games, eq(gameSessions.gameId, games.id))
      .leftJoin(missions, eq(gameSessions.missionId, missions.id))
      .leftJoin(teams, eq(gameSessions.teamId, teams.id))
      .leftJoin(locations, eq(gameSessions.locationId, locations.id))
      .leftJoin(users, eq(gameSessions.buddyId, users.id))
      .where(eq(gameSessions.id, params.id))
      .limit(1);

    if (!session) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Game session not found" } };
    }

    return { success: true, data: session };
  })

  // Buddy / Admin actions
  .use(requireBuddyOrAdmin)

  // POST /api/game-sessions/create — Initialize game session with No Replay enforcement
  .post(
    "/create",
    async ({ body, user, set }) => {
      const { missionId, teamId, allowReplay } = body;

      const [mission] = await db
        .select({
          id: missions.id,
          name: missions.name,
          gameId: missions.gameId,
          locationId: missions.locationId,
          stageId: missions.stageId,
          timeLimit: missions.timeLimit,
        })
        .from(missions)
        .where(eq(missions.id, missionId))
        .limit(1);

      if (!mission || !mission.gameId) {
        set.status = 400;
        return { success: false, error: { code: "INVALID_MISSION", message: "Mission has no associated game template" } };
      }

      // Enforce No Replay Rule: Check if team has already completed this mission
      const [alreadyCompleted] = await db
        .select({ id: gameSessions.id })
        .from(gameSessions)
        .where(and(eq(gameSessions.missionId, missionId), eq(gameSessions.teamId, teamId), eq(gameSessions.status, "COMPLETED")))
        .limit(1);

      if (alreadyCompleted && !allowReplay && user?.role !== "ADMIN") {
        set.status = 409;
        return {
          success: false,
          error: {
            code: "NO_REPLAY_VIOLATION",
            message: "Tim Anda telah menyelesaikan misi di pos ini sebelumnya (Aturan No Replay).",
          },
        };
      }

      const [game] = await db.select().from(games).where(eq(games.id, mission.gameId)).limit(1);
      if (!game) {
        set.status = 404;
        return { success: false, error: { code: "GAME_NOT_FOUND", message: "Game template not found" } };
      }

      // Check Location Occupancy
      const [location] = await db.select().from(locations).where(eq(locations.id, mission.locationId)).limit(1);
      if (location && location.status === "LOCKED") {
        set.status = 423;
        return { success: false, error: { code: "LOCATION_LOCKED", message: "Location is currently locked by Game Master" } };
      }

      // Initialize game payload via Game Engine
      const gamePayload = await GameEngine.initializeGamePayload(
        game.type,
        (game.config as Record<string, any>) || {},
        game.questionBankCategory
      );

      // Fetch team participants
      const members = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          characterClass: users.characterClass,
          characterTier: users.characterTier,
        })
        .from(teamMembers)
        .innerJoin(users, eq(teamMembers.userId, users.id))
        .where(and(eq(teamMembers.teamId, teamId), eq(users.role, "PARTICIPANT")));

      const [session] = await db
        .insert(gameSessions)
        .values({
          gameId: game.id,
          missionId: mission.id,
          teamId,
          locationId: mission.locationId,
          stageId: mission.stageId,
          buddyId: user!.userId,
          status: "READY",
          timeLimit: mission.timeLimit || 300,
          participants: members,
          metadata: { gamePayload, initialStep: 1 },
        })
        .returning();

      // Update location status to OCCUPIED
      await db
        .update(locations)
        .set({ status: "OCCUPIED", updatedAt: new Date() })
        .where(eq(locations.id, mission.locationId));

      await logAudit({
        actorId: user!.userId,
        actorRole: user!.role as any,
        action: "GAME_SESSION_CREATED",
        targetType: "GAME_SESSION",
        targetId: session.id,
        details: { missionId, teamId, gameName: game.name },
      });

      broadcastGameSessionEvent(session.id, "SESSION_CREATED", session);
      broadcastAdminEvent("GAME_SESSION_CREATED", { sessionId: session.id, teamId, gameName: game.name });

      return { success: true, data: session };
    },
    {
      body: t.Object({
        missionId: t.String(),
        teamId: t.String(),
        allowReplay: t.Optional(t.Boolean()),
      }),
    }
  )

  // POST /api/game-sessions/:id/start — Start timer on server (Status: ACTIVE)
  .post("/:id/start", async ({ params, set }) => {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, params.id)).limit(1);
    if (!session) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Session not found" } };
    }

    const now = new Date();
    const [updated] = await db
      .update(gameSessions)
      .set({
        status: "ACTIVE",
        serverStartAt: now,
        updatedAt: now,
      })
      .where(eq(gameSessions.id, params.id))
      .returning();

    broadcastGameSessionEvent(updated.id, "SESSION_STARTED", updated);
    return { success: true, data: updated };
  })

  // POST /api/game-sessions/:id/pause — Pause session
  .post("/:id/pause", async ({ params, set }) => {
    const [updated] = await db
      .update(gameSessions)
      .set({ status: "PAUSED", updatedAt: new Date() })
      .where(eq(gameSessions.id, params.id))
      .returning();

    if (!updated) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Session not found" } };
    }
    broadcastGameSessionEvent(updated.id, "SESSION_PAUSED", updated);
    return { success: true, data: updated };
  })

  // POST /api/game-sessions/:id/complete — Server-Authoritative Evaluation, Point Ledger, and Achievement Trigger
  .post(
    "/:id/complete",
    async ({ params, body, user, set }) => {
      const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, params.id)).limit(1);
      if (!session) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Session not found" } };
      }

      const [game] = await db.select().from(games).where(eq(games.id, session.gameId)).limit(1);
      if (!game) {
        set.status = 404;
        return { success: false, error: { code: "GAME_NOT_FOUND", message: "Game template not found" } };
      }

      const endAt = new Date();
      const startAt = session.serverStartAt || new Date(endAt.getTime() - 60000);

      // Evaluate via Game Engine
      const evalResult = await GameEngine.evaluateGameSession({
        gameType: game.type,
        gameConfig: (game.config as Record<string, any>) || {},
        submissions: body.submissions || [],
        serverStartAt: startAt,
        serverEndAt: endAt,
        timeLimitSec: session.timeLimit || 300,
      });

      // Update Game Session
      const [updatedSession] = await db
        .update(gameSessions)
        .set({
          status: "COMPLETED",
          serverEndAt: endAt,
          result: evalResult,
          totalScore: evalResult.totalTeamScore,
          updatedAt: endAt,
        })
        .where(eq(gameSessions.id, params.id))
        .returning();

      // Write Score Transactions to Point Ledger for each participant
      if (evalResult.participantScores.length > 0) {
        const txInserts = evalResult.participantScores.map((ps) => ({
          participantId: ps.participantId,
          teamId: session.teamId,
          amount: ps.finalScore,
          sourceType: "GAME" as any,
          sourceId: session.id,
          reason: `Penyelesaian Misi Game ${game.name}`,
          stageId: session.stageId,
          gameSessionId: session.id,
          createdBy: user?.userId || null,
        }));
        await db.insert(scoreTransactions).values(txInserts);

        // Trigger Achievement Engine for each participant
        for (const ps of evalResult.participantScores) {
          try {
            await AchievementEngine.evaluateAchievements({
              participantId: ps.participantId,
              gameSessionId: session.id,
              isPerfect: evalResult.isPerfect,
            });
          } catch (achErr) {
            console.error("[Achievement Error]:", achErr);
          }
        }
      }

      // Reset location status back to AVAILABLE
      await db
        .update(locations)
        .set({ status: "AVAILABLE", updatedAt: new Date() })
        .where(eq(locations.id, session.locationId));

      await logAudit({
        actorId: user?.userId,
        actorRole: user?.role as any,
        action: "GAME_SESSION_COMPLETED",
        targetType: "GAME_SESSION",
        targetId: session.id,
        details: { totalScore: evalResult.totalTeamScore, isPerfect: evalResult.isPerfect },
      });

      broadcastGameSessionEvent(updatedSession.id, "SESSION_COMPLETED", {
        session: updatedSession,
        evaluation: evalResult,
      });
      broadcastLeaderboardUpdate({ type: "SCORE_CHANGE", stageId: session.stageId });
      broadcastAdminEvent("GAME_SESSION_COMPLETED", {
        sessionId: session.id,
        teamId: session.teamId,
        totalScore: evalResult.totalTeamScore,
      });

      return {
        success: true,
        data: {
          session: updatedSession,
          evaluation: evalResult,
        },
      };
    },
    {
      body: t.Object({
        submissions: t.Array(
          t.Object({
            participantId: t.String(),
            action: t.String(),
            answer: t.Optional(t.Any()),
            timestampMs: t.Optional(t.Number()),
            statMultiplier: t.Optional(t.Number()),
          })
        ),
      }),
    }
  )

  // POST /api/game-sessions/:id/cancel — Cancel session and free location
  .post("/:id/cancel", async ({ params, user, set }) => {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, params.id)).limit(1);
    if (!session) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Session not found" } };
    }

    const [updated] = await db
      .update(gameSessions)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(eq(gameSessions.id, params.id))
      .returning();

    // Free location
    await db
      .update(locations)
      .set({ status: "AVAILABLE", updatedAt: new Date() })
      .where(eq(locations.id, session.locationId));

    await logAudit({
      actorId: user?.userId,
      actorRole: user?.role as any,
      action: "GAME_SESSION_CANCELLED",
      targetType: "GAME_SESSION",
      targetId: session.id,
    });

    return { success: true, data: updated };
  })

  // POST /api/game-sessions/:id/expire — Handle session timer expiration
  .post("/:id/expire", async ({ params, set }) => {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, params.id)).limit(1);
    if (!session) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Session not found" } };
    }

    const [updated] = await db
      .update(gameSessions)
      .set({ status: "EXPIRED", updatedAt: new Date() })
      .where(eq(gameSessions.id, params.id))
      .returning();

    // Free location
    await db
      .update(locations)
      .set({ status: "AVAILABLE", updatedAt: new Date() })
      .where(eq(locations.id, session.locationId));

    return { success: true, data: updated };
  })

  // GET /api/game-sessions/ai-drawing/prompt — Get a random drawing prompt sentence
  .get("/ai-drawing/prompt", async ({ user }) => {
    const participantIndex = Math.floor(Math.random() * 40);
    const sentence = getRandomDrawingSentence(participantIndex);
    return {
      success: true,
      data: { sentence }
    };
  })

  // POST /api/game-sessions/ai-drawing/evaluate — Evaluate canvas WebP drawing with AI Senior Curator
  .post("/ai-drawing/evaluate", async ({ body, user, set }) => {
    const { promptSentence, imageBase64, teamId, gameSessionId } = body as any;

    if (!promptSentence || !imageBase64) {
      set.status = 400;
      return { success: false, error: { code: "BAD_REQUEST", message: "promptSentence and imageBase64 are required" } };
    }

    const evaluation = await evaluateDrawingWithAI(promptSentence, imageBase64);
    
    // Save accumulation & award titles
    const saved = await saveAIDrawingResult({
      userId: user?.userId || "",
      teamId: teamId || user?.teamId || "00000000-0000-0000-0000-000000000000",
      gameSessionId,
      result: evaluation
    });

    broadcastLeaderboardUpdate({
      type: "GAME_SCORE",
      teamId: teamId || user?.teamId,
      amount: evaluation.score,
      reason: `AI Drawing: ${evaluation.feedback.slice(0, 50)}`
    });

    return {
      success: true,
      data: {
        evaluation,
        newTitles: saved.newTitles,
        unlockedTitles: saved.currentUnlockedTitles
      }
    };
  });
