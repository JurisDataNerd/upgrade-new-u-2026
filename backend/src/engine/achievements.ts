import { db } from "../db";
import {
  achievements,
  participantAchievements,
  users,
  scoreTransactions,
  gameSessions,
  missions,
  floors,
  locations,
} from "../db/schema";
import { eq, sql, inArray, and } from "drizzle-orm";
import { logAudit } from "../lib/audit";

export interface EvaluationContext {
  participantId: string;
  gameSessionId?: string;
  isPerfect?: boolean;
}

/**
 * Rule-Based Achievement Engine
 */
export class AchievementEngine {
  /**
   * Evaluates all active achievements for a participant and unlocks any newly earned achievements and titles.
   */
  static async evaluateAchievements(context: EvaluationContext): Promise<string[]> {
    const { participantId, isPerfect } = context;

    // 1. Fetch user data
    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        characterTier: users.characterTier,
        unlockedTitles: users.unlockedTitles,
      })
      .from(users)
      .where(eq(users.id, participantId))
      .limit(1);

    if (!user) return [];

    // 2. Fetch user's total score
    const [scoreRow] = await db
      .select({ totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)` })
      .from(scoreTransactions)
      .where(eq(scoreTransactions.participantId, participantId));

    const totalScore = Number(scoreRow?.totalScore || 0);

    // 3. Fetch completed game count
    const [sessionRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(scoreTransactions)
      .where(and(eq(scoreTransactions.participantId, participantId), eq(scoreTransactions.sourceType, "GAME")));

    const completedGames = Number(sessionRow?.count || 0);

    // 4. Fetch all active achievements
    const allAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.status, "ACTIVE"));

    // 5. Fetch already awarded achievements
    const alreadyAwarded = await db
      .select({ achievementId: participantAchievements.achievementId })
      .from(participantAchievements)
      .where(eq(participantAchievements.participantId, participantId));

    const awardedSet = new Set(alreadyAwarded.map((a) => a.achievementId));

    const newlyUnlockedTitles: string[] = [];
    const currentTitles = new Set(user.unlockedTitles || ["Novice Adventurer"]);

    for (const ach of allAchievements) {
      if (awardedSet.has(ach.id)) continue;

      const condition = (ach.condition as Record<string, any>) || {};
      let qualifies = false;

      switch (condition.type) {
        case "POINTS_THRESHOLD":
          if (totalScore >= Number(condition.points || 0)) {
            qualifies = true;
          }
          break;

        case "TIER_REACHED":
          if ((user.characterTier ?? 1) >= Number(condition.tier || 1)) {
            qualifies = true;
          }
          break;

        case "GAMES_COMPLETED":
          if (completedGames >= Number(condition.count || 1)) {
            qualifies = true;
          }
          break;

        case "PERFECT_SCORE":
          if (isPerfect) {
            qualifies = true;
          }
          break;

        case "FLOOR_CONQUEROR":
          // Check if user has played on target floor
          if (condition.floorNumber) {
            const [floorHit] = await db
              .select({ id: scoreTransactions.id })
              .from(scoreTransactions)
              .innerJoin(gameSessions, eq(scoreTransactions.gameSessionId, gameSessions.id))
              .innerJoin(locations, eq(gameSessions.locationId, locations.id))
              .innerJoin(floors, eq(locations.floorId, floors.id))
              .where(
                and(
                  eq(scoreTransactions.participantId, participantId),
                  eq(floors.number, Number(condition.floorNumber))
                )
              )
              .limit(1);

            if (floorHit) qualifies = true;
          }
          break;

        default:
          break;
      }

      if (qualifies) {
        // Award achievement
        await db.insert(participantAchievements).values({
          participantId,
          achievementId: ach.id,
        });

        if (ach.title && !currentTitles.has(ach.title)) {
          currentTitles.add(ach.title);
          newlyUnlockedTitles.push(ach.title);
        }

        await logAudit({
          actorId: participantId,
          actorRole: "PARTICIPANT",
          action: "ACHIEVEMENT_UNLOCKED",
          targetType: "ACHIEVEMENT",
          targetId: ach.id,
          details: { achievementName: ach.name, awardedTitle: ach.title },
        });
      }
    }

    // Update user's unlockedTitles if new titles were unlocked
    if (newlyUnlockedTitles.length > 0) {
      await db
        .update(users)
        .set({
          unlockedTitles: Array.from(currentTitles),
          updatedAt: new Date(),
        })
        .where(eq(users.id, participantId));
    }

    return newlyUnlockedTitles;
  }
}
