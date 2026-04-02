# Progress Tracker

Updated after each completed step.

---

## Phase 0 — Foundation

- [x] Step 0.1 — Documentation files created
- [ ] Step 0.2 — Project scaffold (Next.js + Jest)

## Phase 1 — Database & API foundation

- [ ] Step 1.1 — Supabase schema
- [ ] Step 1.2 — Team API routes
- [ ] Step 1.3 — Player API routes

## Phase 2 — Game logic

- [ ] Step 2.1 — Question generator
- [ ] Step 2.2 — Score submission API

## Phase 3 — Frontend

- [ ] Step 3.1 — Home page
- [ ] Step 3.2 — Team creation / join flow
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
- **Next**: Step 0.2 — scaffold Next.js project with Jest + next-intl
