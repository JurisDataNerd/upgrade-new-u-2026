import { describe, it, expect } from "bun:test";
import { GameEngine } from "../src/engine";

describe("Game Engine Lifecycle & Scoring Plugins", () => {
  it("initializes SPEED_REACTION payload with configured rounds", async () => {
    const payload = await GameEngine.initializeGamePayload("SPEED_REACTION", { rounds: 5, delayMinMs: 1000, delayMaxMs: 3000 });
    expect(payload.rounds).toBe(5);
    expect(payload.delays.length).toBe(5);
    expect(payload.delays[0]).toBeGreaterThanOrEqual(1000);
    expect(payload.delays[0]).toBeLessThanOrEqual(3000);
  });

  it("initializes MEMORY_MATCH payload with matching pairs", async () => {
    const payload = await GameEngine.initializeGamePayload("MEMORY_MATCH", { pairCount: 4 });
    expect(payload.pairCount).toBe(4);
    expect(payload.cards.length).toBe(8);
  });

  it("initializes PUZZLE_ORDER payload", async () => {
    const payload = await GameEngine.initializeGamePayload("PUZZLE_ORDER", {});
    expect(payload.targetLength).toBe(5);
    expect(payload.shuffledSteps.length).toBe(5);
  });

  it("evaluates SPEED_REACTION session server-side", async () => {
    const start = new Date(Date.now() - 10000);
    const end = new Date();
    const result = await GameEngine.evaluateGameSession({
      gameType: "SPEED_REACTION",
      gameConfig: {},
      submissions: [
        { participantId: "part-1", action: "TAP", timestampMs: 250, statMultiplier: 1.0 },
        { participantId: "part-2", action: "TAP", timestampMs: 300, statMultiplier: 1.0 },
      ],
      serverStartAt: start,
      serverEndAt: end,
      timeLimitSec: 60,
    });

    expect(result.success).toBe(true);
    expect(result.participantScores.length).toBe(2);
    expect(result.totalTeamScore).toBeGreaterThan(0);
  });
});
