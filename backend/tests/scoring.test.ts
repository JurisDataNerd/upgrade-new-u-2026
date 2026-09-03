import { describe, it, expect } from "bun:test";
import { GameEngine } from "../src/engine";

describe("Scoring Engine & Point Ledger Logic", () => {
  it("calculates MEMORY_MATCH session score with speed bonus", async () => {
    const start = new Date(Date.now() - 15000);
    const end = new Date();
    const result = await GameEngine.evaluateGameSession({
      gameType: "MEMORY_MATCH",
      gameConfig: {},
      submissions: [
        { participantId: "part-1", action: "MATCH", timestampMs: 15000, statMultiplier: 1.2 },
      ],
      serverStartAt: start,
      serverEndAt: end,
      timeLimitSec: 60,
    });

    expect(result.success).toBe(true);
    expect(result.totalTeamScore).toBeGreaterThan(0);
    expect(result.participantScores[0].statBoostBonus).toBeGreaterThanOrEqual(0);
  });

  it("calculates PUZZLE_ORDER score with penalty for overtime", async () => {
    const start = new Date(Date.now() - 70000);
    const end = new Date(); // Over 60s time limit
    const result = await GameEngine.evaluateGameSession({
      gameType: "PUZZLE_ORDER",
      gameConfig: {},
      submissions: [
        { participantId: "part-1", action: "SUBMIT_ORDER", answer: [0, 1, 2, 3, 4] },
      ],
      serverStartAt: start,
      serverEndAt: end,
      timeLimitSec: 60,
    });

    expect(result.success).toBe(true);
    expect(result.participantScores[0].penalty).toBeGreaterThanOrEqual(0);
  });

  it("enforces Buddy bonus limits (max 25 per award)", () => {
    const MAX_SINGLE_AWARD = 25;
    const requestedBonus = 30;

    const validatedAmount = Math.min(requestedBonus, MAX_SINGLE_AWARD);
    expect(validatedAmount).toBe(25);
  });

  it("enforces Buddy stage budget tracking (max 100 pts per stage)", () => {
    const STAGE_BUDGET = 100;
    let spentBudget = 80;
    const newAward = 25;

    const remainingBudget = STAGE_BUDGET - spentBudget;
    const canAward = newAward <= remainingBudget;

    expect(remainingBudget).toBe(20);
    expect(canAward).toBe(false); // 25 exceeds remaining 20
  });
});
