import { calculateScore, formatScore } from "../score";

describe("calculateScore", () => {
  it("returns correct score for a perfect round", () => {
    // 20 correct, 0 reveals, 30 seconds remaining
    expect(calculateScore({ correct: 20, reveals: 0, remainingSeconds: 30 })).toBe(
      20 * 10 + 30 * 2
    );
  });

  it("deducts points for reveals", () => {
    expect(calculateScore({ correct: 18, reveals: 2, remainingSeconds: 0 })).toBe(
      18 * 10 - 2 * 3
    );
  });

  it("adds time bonus for remaining seconds", () => {
    expect(calculateScore({ correct: 0, reveals: 0, remainingSeconds: 60 })).toBe(
      60 * 2
    );
  });

  it("never returns a negative score", () => {
    expect(calculateScore({ correct: 0, reveals: 20, remainingSeconds: 0 })).toBe(0);
  });

  it("combines all factors correctly", () => {
    // 18 correct, 2 reveals, 45s left → 180 - 6 + 90 = 264
    expect(calculateScore({ correct: 18, reveals: 2, remainingSeconds: 45 })).toBe(264);
  });
});

describe("formatScore", () => {
  it("formats a score as a string", () => {
    expect(formatScore(264)).toBe("264");
  });

  it("formats zero", () => {
    expect(formatScore(0)).toBe("0");
  });
});
