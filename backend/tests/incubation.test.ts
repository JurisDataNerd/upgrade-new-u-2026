import { describe, it, expect } from "bun:test";
import {
  INCUBATION_QUESTIONS,
  calculateIncubationTraits,
  evaluateIncubationWithAI,
  getIncubationGameStatus,
  setIncubationGameStatus,
} from "../src/engine/incubation";

describe("Day 1: Incubation Game Engine Unit Tests", () => {
  it("contains 16 complete situational questions across 4 categories", () => {
    expect(INCUBATION_QUESTIONS.length).toBe(16);

    const categories = INCUBATION_QUESTIONS.map((q) => q.category);
    expect(categories.filter((c) => c === "PSYCHOLOGY").length).toBe(4);
    expect(categories.filter((c) => c === "LOGIC").length).toBe(4);
    expect(categories.filter((c) => c === "ROADMAP").length).toBe(4);
    expect(categories.filter((c) => c === "TEAM_DYNAMICS").length).toBe(4);
  });

  it("calculates traits and identifies 'THE STRATEGIST' archetype for logic-heavy answers", () => {
    const answers = new Array(16).fill(0);
    const { traits, primaryArchetype, secondaryArchetype } = calculateIncubationTraits(answers);

    expect(traits.logicalReasoning).toBeGreaterThanOrEqual(70);
    expect(primaryArchetype).toBe("STRATEGIST");
    expect(typeof secondaryArchetype).toBe("string");
  });

  it("calculates traits and identifies 'THE INNOVATOR' archetype for creative choices", () => {
    const answers = [1, 3, 1, 3, 0, 1, 1, 2, 2, 3, 2, 1, 1, 0, 1, 1];
    const { traits, primaryArchetype } = calculateIncubationTraits(answers);

    expect(traits.creativeInnovation).toBeGreaterThanOrEqual(70);
    expect(primaryArchetype).toBe("INNOVATOR");
  });

  it("evaluates incubation profiling and produces structured AI Senior Mentor review", async () => {
    const traits = {
      logicalReasoning: 90,
      creativeInnovation: 85,
      leadershipInfluence: 75,
      socialEmpathy: 70,
      gritAdaptability: 80,
    };

    const feedback = await evaluateIncubationWithAI({
      fullName: "Budi Pratama",
      traits,
      primaryArchetype: "STRATEGIST",
      secondaryArchetype: "INNOVATOR",
    });

    expect(feedback).toBeDefined();
    expect(typeof feedback.aiReview).toBe("string");
    expect(feedback.aiReview.length).toBeGreaterThan(20);
    expect(typeof feedback.fourYearSurvivalTip).toBe("string");
    expect(feedback.fourYearSurvivalTip.length).toBeGreaterThan(10);
    expect(Array.isArray(feedback.titles)).toBe(true);
    expect(feedback.titles.length).toBeGreaterThan(0);
  });

  it("controls Admin status toggle for Incubation (OPEN / LOCKED)", () => {
    setIncubationGameStatus("OPEN");
    expect(getIncubationGameStatus()).toBe("OPEN");

    setIncubationGameStatus("LOCKED");
    expect(getIncubationGameStatus()).toBe("LOCKED");

    setIncubationGameStatus("OPEN");
    expect(getIncubationGameStatus()).toBe("OPEN");
  });
});
