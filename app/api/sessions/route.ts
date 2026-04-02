import { calculateScore } from "@/lib/score";
import { QUESTIONS_PER_ROUND, ROUND_TIME_SECONDS } from "@/lib/config";
import { createSession } from "@/lib/db/sessions";

function isNonNegativeInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const playerId = typeof raw.playerId === "string" ? raw.playerId.trim() : "";
  const teamId = typeof raw.teamId === "string" ? raw.teamId.trim() : null;
  const correct = raw.correct;
  const reveals = raw.reveals;
  const durationMs = raw.durationMs;

  if (!playerId) {
    return Response.json({ error: "playerId is required" }, { status: 400 });
  }
  if (!isNonNegativeInt(correct) || correct > QUESTIONS_PER_ROUND) {
    return Response.json({ error: "correct must be 0–" + QUESTIONS_PER_ROUND }, { status: 400 });
  }
  if (!isNonNegativeInt(reveals) || reveals > QUESTIONS_PER_ROUND) {
    return Response.json({ error: "reveals must be 0–" + QUESTIONS_PER_ROUND }, { status: 400 });
  }
  if (correct + reveals > QUESTIONS_PER_ROUND) {
    return Response.json({ error: "correct + reveals cannot exceed QUESTIONS_PER_ROUND" }, { status: 400 });
  }
  if (!isNonNegativeInt(durationMs) || durationMs > ROUND_TIME_SECONDS * 1000) {
    return Response.json({ error: "durationMs out of range" }, { status: 400 });
  }

  const remainingSeconds = Math.max(0, ROUND_TIME_SECONDS - Math.floor(durationMs / 1000));
  const score = calculateScore({ correct, reveals, remainingSeconds });

  const finishedAt = new Date();
  const startedAt = new Date(finishedAt.getTime() - durationMs);

  try {
    const session = await createSession({
      playerId,
      teamId,
      score,
      correctAnswers: correct,
      reveals,
      durationMs,
      startedAt,
      finishedAt,
    });
    return Response.json(
      {
        id: session.id,
        playerId: session.player_id,
        teamId: session.team_id,
        score: session.score,
        correctAnswers: session.correct_answers,
        wrongAnswers: session.wrong_answers,
        durationMs: session.duration_ms,
        createdAt: session.created_at,
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
