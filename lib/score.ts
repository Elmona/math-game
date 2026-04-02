const POINTS_PER_CORRECT = 10;
const PENALTY_PER_REVEAL = 3;
const BONUS_PER_SECOND = 2;

interface ScoreParams {
  correct: number;
  reveals: number;
  remainingSeconds: number;
}

export function calculateScore({ correct, reveals, remainingSeconds }: ScoreParams): number {
  const raw =
    correct * POINTS_PER_CORRECT -
    reveals * PENALTY_PER_REVEAL +
    remainingSeconds * BONUS_PER_SECOND;
  return Math.max(0, raw);
}

export function formatScore(score: number): string {
  return String(score);
}
