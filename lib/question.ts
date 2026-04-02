import { FACTOR_MAX } from "./config";

export interface Question {
  a: number;
  b: number;
  answer: number;
}

export function generateQuestion(): Question {
  const a = Math.floor(Math.random() * (FACTOR_MAX + 1));
  const b = Math.floor(Math.random() * (FACTOR_MAX + 1));
  return { a, b, answer: a * b };
}

export function generateRound(count: number): Question[] {
  if (count === 0) return [];

  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    let q: Question;
    let attempts = 0;
    do {
      q = generateQuestion();
      attempts++;
      // After 20 attempts give up avoiding the duplicate — extremely unlikely
      // with 66 distinct answers across 121 facts, but prevents infinite loops.
    } while (
      questions.length > 0 &&
      q.answer === questions[questions.length - 1].answer &&
      attempts < 20
    );
    questions.push(q);
  }
  return questions;
}
