import { getSupabase } from "../supabase";

export interface Player {
  id: string;
  team_id: string | null;
  name: string;
  created_at: string;
}

export async function createPlayer(name: string, teamId?: string): Promise<Player> {
  const { data, error } = await getSupabase()
    .from("players")
    .insert({ name, team_id: teamId ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Player;
}

export async function findPlayerByNameAndTeam(
  name: string,
  teamId: string
): Promise<Player | null> {
  const { data, error } = await getSupabase()
    .from("players")
    .select()
    .eq("team_id", teamId)
    .ilike("name", name)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Player | null;
}
