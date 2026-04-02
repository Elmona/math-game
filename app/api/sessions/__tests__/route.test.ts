/**
 * @jest-environment node
 */
import { POST } from "../route";

jest.mock("@/lib/db/sessions", () => ({ createSession: jest.fn() }));

const { createSession } = jest.requireMock("@/lib/db/sessions");

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  playerId: "player-uuid",
  teamId: null,
  correct: 15,
  reveals: 2,
  durationMs: 45000,
};

describe("POST /api/sessions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a session and returns 201 with server-computed score", async () => {
    createSession.mockResolvedValue({
      id: "session-uuid",
      player_id: "player-uuid",
      team_id: null,
      score: 186, // (15×10) - (2×3) + (15×2) = 150 - 6 + 30 = 174 … let mock decide
      correct_answers: 15,
      wrong_answers: 2,
      duration_ms: 45000,
      started_at: "2026-04-02T00:00:00Z",
      finished_at: "2026-04-02T00:00:45Z",
      created_at: "2026-04-02T00:00:45Z",
    });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.id).toBe("session-uuid");
    // Score must be computed server-side — verify createSession was called
    // with a numeric score (not whatever the client might have sent)
    expect(typeof createSession.mock.calls[0][0].score).toBe("number");
  });

  it("computes score from raw values, ignoring any client score field", async () => {
    createSession.mockResolvedValue({
      id: "s", player_id: "p", team_id: null,
      score: 0, correct_answers: 10, wrong_answers: 0,
      duration_ms: 30000, started_at: "x", finished_at: "x", created_at: "x",
    });

    // correct=10, reveals=0, durationMs=90000 → remainingSeconds=30 (120-90)
    // score = (10×10) - (0×3) + (30×2) = 160
    await POST(makeRequest({ ...validBody, correct: 10, reveals: 0, durationMs: 90000, score: 9999 }));
    expect(createSession.mock.calls[0][0].score).toBe(160);
  });

  it("accepts a session with teamId", async () => {
    createSession.mockResolvedValue({
      id: "s", player_id: "player-uuid", team_id: "team-uuid",
      score: 100, correct_answers: 10, wrong_answers: 0,
      duration_ms: 30000, started_at: "x", finished_at: "x", created_at: "x",
    });

    const res = await POST(makeRequest({ ...validBody, teamId: "team-uuid" }));
    expect(res.status).toBe(201);
    expect(createSession.mock.calls[0][0].teamId).toBe("team-uuid");
  });

  it("returns 400 when playerId is missing", async () => {
    const { playerId: _, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("returns 400 when correct is negative", async () => {
    const res = await POST(makeRequest({ ...validBody, correct: -1 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when correct exceeds QUESTIONS_PER_ROUND", async () => {
    const res = await POST(makeRequest({ ...validBody, correct: 21 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when correct + reveals exceeds QUESTIONS_PER_ROUND", async () => {
    const res = await POST(makeRequest({ ...validBody, correct: 18, reveals: 5 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when durationMs is negative", async () => {
    const res = await POST(makeRequest({ ...validBody, durationMs: -1 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when durationMs exceeds round time", async () => {
    const res = await POST(makeRequest({ ...validBody, durationMs: 999999 }));
    expect(res.status).toBe(400);
  });

  it("returns 500 when the DB throws", async () => {
    createSession.mockRejectedValue(new Error("DB error"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });
});
