# Implementation Plan

Each step is small and independently shippable. Tests are written before or alongside code. Docs are updated with each step.

---

## Phase 0 — Foundation

### Step 0.1 — Documentation (current step)
- Create all docs files
- Define scope, decisions, and plan
- No code

### Step 0.2 — Project scaffold
- `create-next-app` with TypeScript, Tailwind, App Router
- Install Jest + React Testing Library
- Install `next-intl` and configure for Swedish (`sv`) as default locale
- Create `messages/sv.json` with skeleton keys (a few examples to establish structure)
- Create `messages/en.json` and `messages/fi.json` as empty stubs (keys only, values TBD)
- Add `jest.config.ts` and a trivial smoke test (`formatScore` utility)
- Confirm `npm test` passes

---

## Phase 1 — Database & API foundation

### Step 1.1 — Supabase schema
- Create `teams`, `players`, `game_sessions` tables (SQL migration file)
- Document schema in `docs/`
- No API routes yet

**Schema:**
```sql
teams:         id, name, join_code, created_at
players:       id, team_id (nullable), name, created_at
game_sessions: id, player_id, team_id (nullable), score, correct_answers,
               wrong_answers, duration_ms, started_at, finished_at, created_at
```

### Step 1.2 — Team API routes
- `POST /api/teams` — create a team, return join code
- `GET /api/teams/[joinCode]` — look up a team by join code
- Unit tests for route handlers

### Step 1.3 — Player API routes
- `POST /api/players` — create a player (name + optional join code)
- Unit tests

---

## Phase 2 — Game logic

### Step 2.1 — Question generator
- Pure function: `generateQuestion()` → `{ a, b, answer }` (multiplication only, factors 0–10)
- Pure function: `generateRound(count)` → array of N questions (shuffled, no adjacent duplicates)
- Game config constants: `QUESTIONS_PER_ROUND`, `ROUND_TIME_SECONDS`, `MAX_WRONG_ATTEMPTS`, score multipliers
- Unit tested thoroughly

### Step 2.2 — Score calculator
- Pure function: `calculateScore({ correct, reveals, remainingSeconds })` → number
- Formula: `(correct × 10) - (reveals × 3) + (remainingSeconds × 2)`
- All multipliers come from config constants so they're easy to tune
- Unit tested with edge cases (all correct, all reveals, time = 0, etc.)

### Step 2.3 — Score submission API
- `POST /api/sessions` — submit a completed game session
- Client sends: `{ playerId, teamId, correct, reveals, durationMs }`
- Server recomputes score from raw values (never trusts client score)
- Server validates: values are plausible given `QUESTIONS_PER_ROUND` and `ROUND_TIME_SECONDS`
- Unit tests for validation and score recomputation logic

---

## Phase 3 — Frontend

### Step 3.1 — Home page
- Choose: play solo or join a team
- Basic Tailwind layout, game-like feel

### Step 3.2 — Team creation / join flow
- Create team form → show join code
- Join team form → name + join code

### Step 3.3 — Game screen
- Countdown timer (fixed time limit)
- Question display: `A × B = ?`
- Answer input (number keyboard friendly)
- Wrong attempt counter per question (shows after each wrong answer)
- Auto-reveal correct answer after 3 wrong attempts, then advances
- Live score or progress indicator

### Step 3.4 — Results screen
- Final score
- Link to leaderboard

### Step 3.5 — Leaderboard
- Individual top scores
- Team leaderboard

---

## Phase 4 — Polish & deployment

### Step 4.1 — Responsive design check
### Step 4.2 — Vercel deployment setup
### Step 4.3 — Supabase production environment
### Step 4.4 — Basic e2e test (Playwright)
