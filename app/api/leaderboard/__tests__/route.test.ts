/**
 * @jest-environment node
 */
import { GET } from "../route";

jest.mock("@/lib/db/leaderboard", () => ({
  getTopPlayers: jest.fn(),
  getTopTeams: jest.fn(),
}));

const { getTopPlayers, getTopTeams } = jest.requireMock("@/lib/db/leaderboard");

describe("GET /api/leaderboard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with players and teams", async () => {
    const players = [{ id: "p1", name: "Erik", score: 100 }];
    const teams = [{ id: "t1", name: "Röda Rävar", total_score: 200 }];
    getTopPlayers.mockResolvedValue(players);
    getTopTeams.mockResolvedValue(teams);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.players).toEqual(players);
    expect(body.teams).toEqual(teams);
  });

  it("returns 500 when getTopPlayers throws", async () => {
    getTopPlayers.mockRejectedValue(new Error("DB error"));
    getTopTeams.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(500);
  });

  it("returns 500 when getTopTeams throws", async () => {
    getTopPlayers.mockResolvedValue([]);
    getTopTeams.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
