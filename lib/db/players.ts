import { supabase } from "../supabase";

export interface Player {
  id: string;
  team_id: string | null;
  name: string;
  created_at: string;
}

export async function createPlayer(name: string, teamId?: string): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert({ name, team_id: teamId ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Player;
}
