/**
 * @jest-environment node
 */
import { POST } from "../route";

jest.mock("@/lib/db/teams", () => ({
  createTeam: jest.fn(),
}));
jest.mock("@/lib/join-code", () => ({
  generateJoinCode: jest.fn(() => "ABC123"),
}));

const { createTeam } = jest.requireMock("@/lib/db/teams");

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/teams", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a team and returns 201 with the team data", async () => {
    createTeam.mockResolvedValue({
      id: "team-uuid",
      name: "Röda Rävar",
      join_code: "ABC123",
      created_at: "2026-04-02T00:00:00Z",
    });

    const res = await POST(makeRequest({ name: "Röda Rävar" }));
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.id).toBe("team-uuid");
    expect(body.name).toBe("Röda Rävar");
    expect(body.joinCode).toBe("ABC123");
    expect(createTeam).toHaveBeenCalledWith("Röda Rävar", "ABC123");
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(createTeam).not.toHaveBeenCalled();
  });

  it("returns 400 when name is blank", async () => {
    const res = await POST(makeRequest({ name: "   " }));
    expect(res.status).toBe(400);
    expect(createTeam).not.toHaveBeenCalled();
  });

  it("returns 500 when the DB throws", async () => {
    createTeam.mockRejectedValue(new Error("connection refused"));
    const res = await POST(makeRequest({ name: "Team B" }));
    expect(res.status).toBe(500);
  });
});
