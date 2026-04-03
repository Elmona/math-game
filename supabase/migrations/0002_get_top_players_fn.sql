CREATE OR REPLACE FUNCTION get_top_players(limit_count int DEFAULT 10)
RETURNS TABLE(player_id uuid, name text, score bigint)
LANGUAGE sql
AS $$
  SELECT gs.player_id, p.name, MAX(gs.score) AS score
  FROM game_sessions gs
  JOIN players p ON p.id = gs.player_id
  GROUP BY gs.player_id, p.name
  ORDER BY score DESC
  LIMIT limit_count;
$$;
