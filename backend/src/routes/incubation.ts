import { Elysia, t } from "elysia";
import { authMiddleware, requireUser, requireAdmin } from "../middleware/auth";
import {
  INCUBATION_QUESTIONS,
  calculateIncubationTraits,
  evaluateIncubationWithAI,
  saveIncubationResult,
  getIncubationGameStatus,
  setIncubationGameStatus,
  IncubationEvaluationResult
} from "../engine/incubation";
import { broadcastLeaderboardUpdate, broadcastAdminEvent } from "../realtime";

export const incubationRoutes = new Elysia({
  prefix: "/api/incubation",
  detail: {
    tags: ["Day 1 Incubation & Quiz"],
  },
})
  .use(authMiddleware)

  // GET /api/incubation/status — Check if Day 1 Incubation is currently OPEN
  .get("/status", () => {
    return {
      success: true,
      data: {
        status: getIncubationGameStatus(),
      }
    };
  })

  // GET /api/incubation/questions — Fetch all 16 interactive questions
  .get("/questions", () => {
    return {
      success: true,
      data: {
        totalQuestions: INCUBATION_QUESTIONS.length,
        questions: INCUBATION_QUESTIONS.map((q) => ({
          id: q.id,
          category: q.category,
          scenario: q.scenario,
          options: q.options.map((o, idx) => ({
            id: idx,
            text: o.text,
          }))
        }))
      }
    };
  })

  // POST /api/incubation/evaluate — Submit 16 answers & get Senior AI review
  .post("/evaluate", async ({ body, user, set }: any) => {
    const status = getIncubationGameStatus();
    if (status !== "OPEN") {
      set.status = 403;
      return {
        success: false,
        error: {
          code: "LOCKED",
          message: "Game 1 (Incubation) belum dibuka oleh Admin / Game Master."
        }
      };
    }

    const { answers, teamId } = body as { answers: number[]; teamId?: string };

    if (!Array.isArray(answers) || answers.length === 0) {
      set.status = 400;
      return {
        success: false,
        error: { code: "BAD_REQUEST", message: "Array jawaban 'answers' wajib diisi." }
      };
    }

    // 1. Calculate traits & archetypes
    const { traits, primaryArchetype, secondaryArchetype } = calculateIncubationTraits(answers);

    // 2. Evaluate with Gemini AI Senior Mentor
    const aiFeedback = await evaluateIncubationWithAI({
      fullName: user?.fullName || user?.username,
      traits,
      primaryArchetype,
      secondaryArchetype
    });

    const fullResult: IncubationEvaluationResult = {
      traits,
      primaryArchetype,
      secondaryArchetype,
      aiReview: aiFeedback.aiReview,
      fourYearSurvivalTip: aiFeedback.fourYearSurvivalTip,
      titles: aiFeedback.titles
    };

    // 3. Save result & award 100 points
    const saved = await saveIncubationResult({
      userId: user?.userId || "",
      teamId: teamId || user?.teamId || "00000000-0000-0000-0000-000000000000",
      result: fullResult
    });

    // 4. Broadcast leaderboard update
    broadcastLeaderboardUpdate({
      type: "ACHIEVEMENT",
      teamId: teamId || user?.teamId,
      amount: 100,
      reason: `Day 1 Incubation: ${primaryArchetype}`
    });

    return {
      success: true,
      data: {
        evaluation: fullResult,
        newTitles: saved.newTitles,
        unlockedTitles: saved.currentUnlockedTitles,
        earnedPoints: 100
      }
    };
  })

  // POST /api/incubation/admin/toggle-status — Admin switches status to OPEN / LOCKED
  .use(requireAdmin)
  .post("/admin/toggle-status", async ({ body, user }: any) => {
    const { status } = body as { status: "OPEN" | "LOCKED" };
    if (status !== "OPEN" && status !== "LOCKED") {
      return { success: false, error: { message: "Status harus 'OPEN' atau 'LOCKED'." } };
    }

    setIncubationGameStatus(status);

    broadcastAdminEvent("INCUBATION_STATUS_CHANGED", {
      status,
      changedBy: user?.username || "ADMIN",
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Status Game 1 Incubation berhasil diubah menjadi ${status}.`,
      data: { status }
    };
  });
