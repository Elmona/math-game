# Database Schema

Migration file: `supabase/migrations/0001_initial_schema.sql`

---

## teams

| Column      | Type        | Notes                        |
|-------------|-------------|------------------------------|
| id          | UUID        | PK, auto-generated           |
| name        | TEXT        | Team display name            |
| join_code   | TEXT        | Unique; used by players to join |
| created_at  | TIMESTAMPTZ | Set on insert                |

## players

| Column      | Type        | Notes                              |
|-------------|-------------|------------------------------------|
| id          | UUID        | PK, auto-generated                 |
| team_id     | UUID        | FK → teams.id, nullable (solo OK)  |
| name        | TEXT        | Player display name                |
| created_at  | TIMESTAMPTZ | Set on insert                      |

## game_sessions

| Column          | Type        | Notes                                              |
|-----------------|-------------|----------------------------------------------------|
| id              | UUID        | PK, auto-generated                                 |
| player_id       | UUID        | FK → players.id, CASCADE on delete                 |
| team_id         | UUID        | FK → teams.id, nullable; denormalised for leaderboards |
| score           | INTEGER     | Server-computed (ADR-011)                          |
| correct_answers | INTEGER     | Raw value submitted by client                      |
| wrong_answers   | INTEGER     | Raw value submitted by client                      |
| duration_ms     | INTEGER     | Milliseconds from start to finish                  |
| started_at      | TIMESTAMPTZ | When the round began                               |
| finished_at     | TIMESTAMPTZ | When the round ended                               |
| created_at      | TIMESTAMPTZ | Set on insert                                      |

---

## Notes

- `join_code` has a UNIQUE constraint, so look-ups by join code use an implicit index.
- `team_id` on `game_sessions` is denormalised from the player row. This keeps leaderboard queries simple without joins through `players`.
- Score is stored but always recomputed server-side from raw values on submission — the stored value is for read performance only.
