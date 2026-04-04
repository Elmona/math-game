CREATE OR REPLACE FUNCTION get_team_leaderboard(team_id_param uuid, limit_count int DEFAULT 20)
RETURNS TABLE(player_id uuid, name text, score bigint)
LANGUAGE sql
AS $$
  SELECT gs.player_id, p.name, MAX(gs.score) AS score
  FROM game_sessions gs
  JOIN players p ON p.id = gs.player_id
  WHERE gs.team_id = team_id_param
  GROUP BY gs.player_id, p.name
  ORDER BY score DESC
  LIMIT limit_count;
$$;
