import { generateQuestion, generateRound } from "../question";
import { FACTOR_MAX, QUESTIONS_PER_ROUND } from "../config";

describe("generateQuestion", () => {
  it("returns an object with a, b, and answer", () => {
    const q = generateQuestion();
    expect(q).toHaveProperty("a");
    expect(q).toHaveProperty("b");
    expect(q).toHaveProperty("answer");
  });

  it("always has factors in range 0–FACTOR_MAX", () => {
    for (let i = 0; i < 200; i++) {
      const { a, b } = generateQuestion();
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(FACTOR_MAX);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(FACTOR_MAX);
    }
  });

  it("answer always equals a × b", () => {
    for (let i = 0; i < 200; i++) {
      const { a, b, answer } = generateQuestion();
      expect(answer).toBe(a * b);
    }
  });
});

describe("generateRound", () => {
  it("returns the requested number of questions", () => {
    expect(generateRound(QUESTIONS_PER_ROUND)).toHaveLength(QUESTIONS_PER_ROUND);
    expect(generateRound(5)).toHaveLength(5);
  });

  it("all questions have valid factors and correct answers", () => {
    const questions = generateRound(QUESTIONS_PER_ROUND);
    for (const { a, b, answer } of questions) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(FACTOR_MAX);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(FACTOR_MAX);
      expect(answer).toBe(a * b);
    }
  });

  it("has no adjacent questions with the same answer", () => {
    for (let run = 0; run < 50; run++) {
      const questions = generateRound(QUESTIONS_PER_ROUND);
      for (let i = 1; i < questions.length; i++) {
        expect(questions[i].answer).not.toBe(questions[i - 1].answer);
      }
    }
  });

  it("returns an empty array for count 0", () => {
    expect(generateRound(0)).toEqual([]);
  });
});
