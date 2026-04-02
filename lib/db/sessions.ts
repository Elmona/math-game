import { supabase } from "../supabase";

export interface Session {
  id: string;
  player_id: string;
  team_id: string | null;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  duration_ms: number;
  started_at: string;
  finished_at: string;
  created_at: string;
}

interface CreateSessionParams {
  playerId: string;
  teamId: string | null;
  score: number;
  correctAnswers: number;
  reveals: number;
  durationMs: number;
  startedAt: Date;
  finishedAt: Date;
}

export async function createSession(params: CreateSessionParams): Promise<Session> {
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      player_id: params.playerId,
      team_id: params.teamId,
      score: params.score,
      correct_answers: params.correctAnswers,
      wrong_answers: params.reveals,
      duration_ms: params.durationMs,
      started_at: params.startedAt.toISOString(),
      finished_at: params.finishedAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Session;
}
