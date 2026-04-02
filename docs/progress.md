# Progress Tracker

Updated after each completed step.

---

## Phase 0 — Foundation

- [x] Step 0.1 — Documentation files created
- [x] Step 0.2 — Project scaffold (Next.js + Jest + next-intl)

## Phase 1 — Database & API foundation

- [x] Step 1.1 — Supabase schema
- [x] Step 1.2 — Team API routes
- [x] Step 1.3 — Player API routes

## Phase 2 — Game logic

- [x] Step 2.1 — Question generator
- [x] Step 2.2 — Score submission API

## Phase 3 — Frontend

- [x] Step 3.1 — Home page
- [x] Step 3.2 — Team creation / join flow
- [ ] Step 3.3 — Game screen
- [ ] Step 3.4 — Results screen
- [ ] Step 3.5 — Leaderboard

## Phase 4 — Polish & deployment

- [ ] Step 4.1 — Responsive design check
- [ ] Step 4.2 — Vercel deployment setup
- [ ] Step 4.3 — Supabase production environment
- [ ] Step 4.4 — Basic e2e test (Playwright)

---

## Log

### 2026-04-02
- Created all documentation files (README.md, docs/*.md)
- Defined v1 scope, architecture decisions, and phased implementation plan
- Added game design decisions: multiplication 0–10, ~20 questions, fixed time limit, 3-wrong-reveal mechanic
- Finalised scoring formula: `(correct × 10) - (reveals × 3) + (remaining_seconds × 2)`
- Added ADR-009, ADR-010, ADR-011
- Added language decisions: Swedish v1, `next-intl` from day one, English/Finnish stubs prepared
- Added copy tone standard: young, playful, encouraging — written for children 7–14
- Added ADR-012 (i18n) and ADR-013 (copy tone)
- **Next**: Step 3.3 — Game screen

### Step 3.2 — Team creation / join flow (2026-04-02)
- `/lag`: tabbed UI (create/join), keyboard-accessible (arrow key nav, role=tablist)
- Server Actions: createTeamAction, joinTeamAction
- WCAG: labels, role=alert errors, aria-live copy confirm, min-h-[44px] targets, focus rings
- Bonus: home page focus rings retrofitted; NextIntlClientProvider added to layout

### Step 3.1 — Home page (2026-04-02)
- `app/page.tsx`: indigo layout, two buttons (Spela själv → /spela, Gå med i ett lag → /lag)
- Uses next-intl getTranslations server component API
- Fixed Supabase client to be lazy (getSupabase()) so build works without env vars

### Step 2.2 — Score submission API (2026-04-02)
- `POST /api/sessions`: validates correct/reveals/durationMs, recomputes score server-side, persists session
- TDD: 10 new tests, 40 total passing

### Step 2.1 — Question generator (2026-04-02)
- `lib/config.ts`: FACTOR_MAX, QUESTIONS_PER_ROUND, ROUND_TIME_SECONDS, MAX_WRONG_ATTEMPTS
- `lib/question.ts`: generateQuestion, generateRound (no adjacent same answer)
- TDD: 7 new tests, 30 total passing

### Step 1.3 — Player API routes (2026-04-02)
- `POST /api/players` — validates name, optional joinCode lookup, inserts player, returns 201
- TDD: 6 new tests, 23 total passing

### Step 1.2 — Team API routes (2026-04-02)
- `POST /api/teams` — validates name, generates join code, inserts team, returns 201
- `GET /api/teams/[joinCode]` — looks up team, returns 200 or 404
- TDD: 7 new tests, 17 total passing
- Fixed Jest `@/` path alias and added `@jest-environment node` for route tests

### Step 1.1 — Supabase schema (2026-04-02)
- Created `supabase/migrations/0001_initial_schema.sql` with `teams`, `players`, `game_sessions`
- Added `docs/schema.md` as schema reference
- Plain SQL, no ORM (ADR-008); solo-player support via nullable `team_id`

### Step 0.2 — Project scaffold (2026-04-02)
- Scaffolded Next.js 16 with TypeScript, Tailwind, App Router
- Added Jest + React Testing Library + ts-node
- TDD: wrote failing score tests first, then implemented `calculateScore` / `formatScore`
- Added next-intl: Swedish default, en/fi stubs ready
- Written `messages/sv.json` with full child-friendly Swedish copy
- 5 commits, all passing
