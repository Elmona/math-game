import { getSupabase } from "../supabase";

export interface Team {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
}

export async function createTeam(name: string, joinCode: string): Promise<Team> {
  const { data, error } = await getSupabase()
    .from("teams")
    .insert({ name, join_code: joinCode })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Team;
}

export async function findTeamByJoinCode(joinCode: string): Promise<Team | null> {
  const { data, error } = await getSupabase()
    .from("teams")
    .select()
    .eq("join_code", joinCode)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    throw new Error(error.message);
  }
  return data as Team;
}
