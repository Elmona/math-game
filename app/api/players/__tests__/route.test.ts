/**
 * @jest-environment node
 */
import { POST } from "../route";

jest.mock("@/lib/db/players", () => ({ createPlayer: jest.fn() }));
jest.mock("@/lib/db/teams", () => ({ findTeamByJoinCode: jest.fn() }));

const { createPlayer } = jest.requireMock("@/lib/db/players");
const { findTeamByJoinCode } = jest.requireMock("@/lib/db/teams");

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/players", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a solo player and returns 201", async () => {
    createPlayer.mockResolvedValue({
      id: "player-uuid",
      name: "Frida",
      team_id: null,
      created_at: "2026-04-02T00:00:00Z",
    });

    const res = await POST(makeRequest({ name: "Frida" }));
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.id).toBe("player-uuid");
    expect(body.name).toBe("Frida");
    expect(body.teamId).toBeNull();
    expect(createPlayer).toHaveBeenCalledWith("Frida", undefined);
  });

  it("joins a team when a valid joinCode is provided", async () => {
    findTeamByJoinCode.mockResolvedValue({
      id: "team-uuid",
      name: "Röda Rävar",
      join_code: "ABC123",
      created_at: "2026-04-02T00:00:00Z",
    });
    createPlayer.mockResolvedValue({
      id: "player-uuid",
      name: "Frida",
      team_id: "team-uuid",
      created_at: "2026-04-02T00:00:00Z",
    });

    const res = await POST(makeRequest({ name: "Frida", joinCode: "ABC123" }));
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.teamId).toBe("team-uuid");
    expect(findTeamByJoinCode).toHaveBeenCalledWith("ABC123");
    expect(createPlayer).toHaveBeenCalledWith("Frida", "team-uuid");
  });

  it("returns 404 when joinCode does not match any team", async () => {
    findTeamByJoinCode.mockResolvedValue(null);

    const res = await POST(makeRequest({ name: "Frida", joinCode: "XXXXXX" }));
    expect(res.status).toBe(404);
    expect(createPlayer).not.toHaveBeenCalled();
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({ joinCode: "ABC123" }));
    expect(res.status).toBe(400);
    expect(createPlayer).not.toHaveBeenCalled();
  });

  it("returns 400 when name is blank", async () => {
    const res = await POST(makeRequest({ name: "   " }));
    expect(res.status).toBe(400);
    expect(createPlayer).not.toHaveBeenCalled();
  });

  it("returns 500 when the DB throws", async () => {
    createPlayer.mockRejectedValue(new Error("DB error"));
    const res = await POST(makeRequest({ name: "Frida" }));
    expect(res.status).toBe(500);
  });
});
