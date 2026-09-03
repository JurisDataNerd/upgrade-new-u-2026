import { db } from "../db";
import { questions } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

export interface GameEngineInput {
  gameType: "TEAM_QUIZ" | "SPEED_REACTION" | "MEMORY_MATCH" | "PUZZLE_ORDER" | "CUSTOM" | string;
  gameConfig: Record<string, any>;
  submissions: Array<{
    participantId: string;
    action: string;
    answer?: any;
    timestampMs?: number;
    statMultiplier?: number;
  }>;
  serverStartAt: Date;
  serverEndAt: Date;
  timeLimitSec: number;
}

export interface ParticipantScoreResult {
  participantId: string;
  baseScore: number;
  speedBonus: number;
  statBoostBonus: number;
  penalty: number;
  finalScore: number;
  details: Record<string, any>;
}

export interface GameEngineResult {
  success: boolean;
  totalTeamScore: number;
  participantScores: ParticipantScoreResult[];
  completionTimeMs: number;
  isPerfect: boolean;
  summary: string;
}

/**
 * Modular Server-Authoritative Game Engine
 */
export class GameEngine {
  /**
   * Initializes game payload (e.g. fetching questions or initializing grid/puzzle state)
   */
  static async initializeGamePayload(gameType: string, config: Record<string, any>, category?: string | null) {
    switch (gameType) {
      case "TEAM_QUIZ": {
        const count = config.questionCount || 5;
        let q = db.select().from(questions).where(eq(questions.status, "ACTIVE")).$dynamic();
        if (category) {
          q = q.where(eq(questions.category, category));
        }
        const available = await q.limit(50);
        // Shuffle & pick N
        const shuffled = available.sort(() => Math.random() - 0.5).slice(0, count);
        return {
          questions: shuffled.map((sq) => ({
            id: sq.id,
            questionText: sq.questionText,
            type: sq.type,
            options: sq.options,
            baseScore: sq.baseScore,
            category: sq.category,
            // Do NOT include correctAnswer in client payload!
          })),
        };
      }

      case "SPEED_REACTION": {
        const rounds = config.rounds || 3;
        const delayMinMs = config.delayMinMs || 2000;
        const delayMaxMs = config.delayMaxMs || 5000;
        return {
          rounds,
          delays: Array.from({ length: rounds }, () => Math.floor(Math.random() * (delayMaxMs - delayMinMs)) + delayMinMs),
        };
      }

      case "MEMORY_MATCH": {
        const pairCount = config.pairCount || 6;
        const symbols = ["🛡️", "🔮", "🏹", "🧪", "🗡️", "📜", "⚡", "⚙️"];
        const chosen = symbols.slice(0, pairCount);
        const cards = [...chosen, ...chosen].sort(() => Math.random() - 0.5);
        return {
          pairCount,
          cards,
        };
      }

      case "PUZZLE_ORDER": {
        const steps = config.steps || [
          "Inisialisasi Sistem",
          "Koneksi Database LAN",
          "Routing Jaringan Kampus",
          "Verifikasi Kunci Kriptografi",
          "Aktivasi Firewall UNU",
        ];
        return {
          targetLength: steps.length,
          shuffledSteps: [...steps].sort(() => Math.random() - 0.5),
        };
      }

      default:
        return {
          config,
        };
    }
  }

  /**
   * Evaluates participant submissions server-side to calculate final score
   */
  static async evaluateGameSession(input: GameEngineInput): Promise<GameEngineResult> {
    const elapsedMs = Math.max(0, input.serverEndAt.getTime() - input.serverStartAt.getTime());
    const timeLimitMs = (input.timeLimitSec || 300) * 1000;

    let participantScores: ParticipantScoreResult[] = [];
    let totalTeamScore = 0;
    let isPerfect = true;

    switch (input.gameType) {
      case "TEAM_QUIZ": {
        // Collect question IDs
        const questionIds: string[] = [];
        input.submissions.forEach((s) => {
          if (Array.isArray(s.answer)) {
            s.answer.forEach((ans: any) => {
              if (ans.questionId) questionIds.push(ans.questionId);
            });
          }
        });

        const distinctQIds = Array.from(new Set(questionIds));
        let qRecords: any[] = [];
        if (distinctQIds.length > 0) {
          qRecords = await db.select().from(questions).where(inArray(questions.id, distinctQIds));
        }
        const qMap = new Map(qRecords.map((q) => [q.id, q]));

        participantScores = input.submissions.map((sub) => {
          let base = 0;
          let correctCount = 0;
          let totalCount = 0;

          if (Array.isArray(sub.answer)) {
            totalCount = sub.answer.length;
            sub.answer.forEach((ans: any) => {
              const qRecord = qMap.get(ans.questionId);
              if (qRecord && String(ans.selected).trim().toLowerCase() === String(qRecord.correctAnswer).trim().toLowerCase()) {
                base += qRecord.baseScore || 10;
                correctCount++;
              } else {
                isPerfect = false;
              }
            });
          }

          // Speed bonus if completed under half time limit
          const speedBonus = elapsedMs < timeLimitMs / 2 ? Math.round(base * 0.25) : 0;

          // RPG Stat Multiplier Boost (e.g. 1.4x for Tier 2, 2.0x for Tier 3)
          const multiplier = sub.statMultiplier || 1.0;
          const subtotal = base + speedBonus;
          const statBoostBonus = Math.round(subtotal * (multiplier - 1.0));
          const finalScore = subtotal + statBoostBonus;

          return {
            participantId: sub.participantId,
            baseScore: base,
            speedBonus,
            statBoostBonus,
            penalty: 0,
            finalScore,
            details: { correctCount, totalCount, accuracy: totalCount > 0 ? (correctCount / totalCount) * 100 : 0 },
          };
        });
        break;
      }

      case "SPEED_REACTION": {
        participantScores = input.submissions.map((sub) => {
          const reactionTimeMs = Number(sub.timestampMs || 1000);
          let base = 50;
          if (reactionTimeMs < 250) base = 100;
          else if (reactionTimeMs < 350) base = 80;
          else if (reactionTimeMs < 500) base = 65;

          const multiplier = sub.statMultiplier || 1.0;
          const statBoostBonus = Math.round(base * (multiplier - 1.0));
          const finalScore = base + statBoostBonus;

          return {
            participantId: sub.participantId,
            baseScore: base,
            speedBonus: reactionTimeMs < 300 ? 20 : 0,
            statBoostBonus,
            penalty: 0,
            finalScore,
            details: { reactionTimeMs },
          };
        });
        break;
      }

      case "MEMORY_MATCH": {
        const moves = input.submissions[0]?.answer?.moves || 15;
        let base = Math.max(20, 100 - (moves - 6) * 5);
        const speedBonus = elapsedMs < 60000 ? 30 : 10;

        participantScores = input.submissions.map((sub) => {
          const multiplier = sub.statMultiplier || 1.0;
          const subtotal = base + speedBonus;
          const statBoostBonus = Math.round(subtotal * (multiplier - 1.0));
          return {
            participantId: sub.participantId,
            baseScore: base,
            speedBonus,
            statBoostBonus,
            penalty: 0,
            finalScore: subtotal + statBoostBonus,
            details: { moves, elapsedMs },
          };
        });
        break;
      }

      default: {
        // Generic fallback calculation
        const base = input.gameConfig.baseScore || 50;
        participantScores = input.submissions.map((sub) => {
          const multiplier = sub.statMultiplier || 1.0;
          const statBoostBonus = Math.round(base * (multiplier - 1.0));
          return {
            participantId: sub.participantId,
            baseScore: base,
            speedBonus: 0,
            statBoostBonus,
            penalty: 0,
            finalScore: base + statBoostBonus,
            details: {},
          };
        });
        break;
      }
    }

    totalTeamScore = participantScores.reduce((sum, p) => sum + p.finalScore, 0);

    return {
      success: true,
      totalTeamScore,
      participantScores,
      completionTimeMs: elapsedMs,
      isPerfect,
      summary: `Game ${input.gameType} diselesaikan dalam ${(elapsedMs / 1000).toFixed(1)}s dengan total skor tim ${totalTeamScore} pts.`,
    };
  }
}
