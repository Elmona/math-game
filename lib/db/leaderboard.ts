import { getSupabase } from "../supabase";

export interface PlayerRankEntry {
  rank: number;
  name: string;
  score: number;
}

export interface TeamRankEntry {
  rank: number;
  name: string;
  score: number;
}

export async function getTopPlayers(limit = 10): Promise<PlayerRankEntry[]> {
  const { data, error } = await getSupabase()
    .from("game_sessions")
    .select("score, players(name)")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row, i) => ({
    rank: i + 1,
    name: (row.players as unknown as { name: string } | null)?.name ?? "Okänd",
    score: row.score,
  }));
}

export async function getTopTeams(limit = 10): Promise<TeamRankEntry[]> {
  const { data, error } = await getSupabase()
    .from("game_sessions")
    .select("team_id, score, teams(name)")
    .not("team_id", "is", null);

  if (error) throw new Error(error.message);

  // Sum all session scores per team
  const teamMap = new Map<string, { name: string; score: number }>();
  for (const row of data ?? []) {
    if (!row.team_id) continue;
    const name = (row.teams as unknown as { name: string } | null)?.name ?? "Okänt lag";
    const existing = teamMap.get(row.team_id);
    if (existing) {
      existing.score += row.score;
    } else {
      teamMap.set(row.team_id, { name, score: row.score });
    }
  }

  return [...teamMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((t, i) => ({ rank: i + 1, ...t }));
}
