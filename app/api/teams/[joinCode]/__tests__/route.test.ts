/**
 * @jest-environment node
 */
import { GET } from "../route";

jest.mock("@/lib/db/teams", () => ({
  findTeamByJoinCode: jest.fn(),
}));

const { findTeamByJoinCode } = jest.requireMock("@/lib/db/teams");

function makeRequest(joinCode: string): Request {
  return new Request(`http://localhost/api/teams/${joinCode}`);
}

function makeParams(joinCode: string): { params: Promise<{ joinCode: string }> } {
  return { params: Promise.resolve({ joinCode }) };
}

describe("GET /api/teams/[joinCode]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the team when found", async () => {
    findTeamByJoinCode.mockResolvedValue({
      id: "team-uuid",
      name: "Röda Rävar",
      join_code: "ABC123",
      created_at: "2026-04-02T00:00:00Z",
    });

    const res = await GET(makeRequest("ABC123"), makeParams("ABC123"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.id).toBe("team-uuid");
    expect(body.name).toBe("Röda Rävar");
    expect(body.joinCode).toBe("ABC123");
    expect(findTeamByJoinCode).toHaveBeenCalledWith("ABC123");
  });

  it("returns 404 when the team is not found", async () => {
    findTeamByJoinCode.mockResolvedValue(null);

    const res = await GET(makeRequest("XXXXXX"), makeParams("XXXXXX"));
    expect(res.status).toBe(404);
  });

  it("returns 500 when the DB throws", async () => {
    findTeamByJoinCode.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeRequest("ABC123"), makeParams("ABC123"));
    expect(res.status).toBe(500);
  });
});
