import { describe, it, expect } from "bun:test";
import {
  DRAWING_SENTENCES,
  getRandomDrawingSentence,
  evaluateDrawingWithAI,
} from "../src/engine/aiDrawing";

describe("AI Canvas Drawing Game Engine Unit Tests", () => {
  it("contains 40 creative drawing sentences in the bank", () => {
    expect(DRAWING_SENTENCES.length).toBe(40);
    expect(DRAWING_SENTENCES[0]).toBe("Presiden naik kuda melompati pelangi");
    expect(DRAWING_SENTENCES[39]).toBe("Komodo berkemah di tenda sambil bakar jagung");
  });

  it("selects random/rotated drawing sentences from the bank", () => {
    const sentence1 = getRandomDrawingSentence(0);
    const sentence2 = getRandomDrawingSentence(5);

    expect(typeof sentence1).toBe("string");
    expect(sentence1.length).toBeGreaterThan(5);
    expect(typeof sentence2).toBe("string");
    expect(DRAWING_SENTENCES).toContain(sentence1);
    expect(DRAWING_SENTENCES).toContain(sentence2);
  });

  it("evaluates drawing with AI Curator fallback engine when API key is missing or dummy image", async () => {
    const prompt = "Kuda minum es cekek di pinggir lapangan";
    const dummyWebpBase64 = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEEIACwJaQAA3AA/v3AgAA=";

    const result = await evaluateDrawingWithAI(prompt, dummyWebpBase64);

    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(typeof result.feedback).toBe("string");
    expect(result.feedback.length).toBeGreaterThan(10);
    expect(Array.isArray(result.titles)).toBe(true);
    expect(result.titles.length).toBeGreaterThan(0);
  });

  it("handles title accumulation without duplicate entries", () => {
    const existingTitles = ["Novice Adventurer", "Maestro Garis Abstrak"];
    const newlyAwardedTitles = ["Maestro Garis Abstrak", "Pelukis Surealis", "Legenda Canvas"];

    const newUniqueTitles = newlyAwardedTitles.filter((t) => !existingTitles.includes(t));
    const updatedTitles = [...existingTitles, ...newUniqueTitles];

    expect(newUniqueTitles).toEqual(["Pelukis Surealis", "Legenda Canvas"]);
    expect(updatedTitles).toEqual([
      "Novice Adventurer",
      "Maestro Garis Abstrak",
      "Pelukis Surealis",
      "Legenda Canvas"
    ]);
  });
});
