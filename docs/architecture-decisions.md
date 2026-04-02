# Architecture Decisions

## ADR-001 — Next.js App Router
- **Decision**: Use Next.js App Router (not Pages Router)
- **Reason**: Modern standard, better support for server components and layouts, better DX going forward
- **Status**: Accepted

## ADR-002 — Tailwind CSS
- **Decision**: Use Tailwind CSS for styling
- **Reason**: Fast iteration, great for game-like custom UIs, no context-switching between files
- **Status**: Accepted

## ADR-003 — Supabase (Postgres)
- **Decision**: Use Supabase as the database provider
- **Reason**: Hosted Postgres, cheap/free tier, works well with tools like DBeaver, no extra infrastructure
- **Status**: Accepted

## ADR-004 — No always-on backend server
- **Decision**: Use Next.js API route handlers instead of a separate backend
- **Reason**: Simpler architecture, cheaper, sufficient for v1 traffic
- **Status**: Accepted

## ADR-005 — No login for v1
- **Decision**: Players identify themselves by name only; no accounts or passwords
- **Reason**: Removes friction, especially for children. Teams are joined by code.
- **Trade-off**: Anyone can submit under any name. Acceptable for v1.
- **Status**: Accepted

## ADR-006 — Server-side score storage
- **Decision**: Scores are submitted to and validated by the server; not trusted from the client alone
- **Reason**: Reduces obvious cheating; client sends raw answers and timing, server computes or validates score
- **Status**: Accepted (basic validation in v1, can tighten later)

## ADR-007 — Jest + React Testing Library
- **Decision**: Use Jest with RTL for unit and integration tests; Playwright for e2e (later)
- **Reason**: Standard, well-supported stack for Next.js projects
- **Status**: Accepted

## ADR-008 — Database schema tool compatibility
- **Decision**: Keep schema simple, standard SQL — no ORM for v1
- **Reason**: Must work well with DBeaver and direct SQL queries; Prisma or similar adds complexity without clear benefit yet
- **Status**: Accepted

## ADR-009 — V1 game mode: multiplication only
- **Decision**: V1 is multiplication facts (0–10) only
- **Reason**: Focused scope, easier to balance difficulty, clearer for the target age group. Other operations can be added later.
- **Status**: Accepted

## ADR-010 — Scoring formula with time bonus
- **Decision**: `score = (correct × 10) - (reveals × 3) + (remaining_seconds × 2)`
  - A "reveal" = question where the player used all 3 wrong attempts and was shown the answer
- **Reason**: Rewards both accuracy and speed. All multipliers are named constants so they can be tuned after playtesting without code changes.
- **Trade-off**: Formula needs playtesting to feel balanced. Multipliers are intentionally exposed as config.
- **Status**: Accepted — multipliers subject to tuning

## ADR-011 — Server recomputes score, never trusts client
- **Decision**: Client submits raw values (`correct`, `reveals`, `durationMs`); server recomputes the score
- **Reason**: Prevents trivial score manipulation by editing the request payload
- **Status**: Accepted

## ADR-012 — Internationalisation with `next-intl`, Swedish first
- **Decision**: Use `next-intl` for all user-facing copy. No hardcoded strings in components.
  - v1 ships in **Swedish only**
  - Structure supports adding **English** and **Finnish** in future iterations without code changes
  - All copy lives in `messages/sv.json` (and later `en.json`, `fi.json`)
- **Reason**: Retrofitting i18n later is expensive. Setting up `next-intl` at scaffold time costs little and keeps all copy in one place — easy to review, translate, and tune for tone.
- **Trade-off**: Slight extra setup in Step 0.2. Worth it.
- **Status**: Accepted

## ADR-014 — Git workflow: commit early and often
- **Decision**: Commit frequently — every logical unit of work gets its own commit
  - One commit per file created, per test added, per feature wired up
  - Never batch unrelated changes into one commit
  - Commit messages follow conventional commits style: `feat:`, `test:`, `docs:`, `fix:`, `chore:`
  - Examples: `docs: add v1 scope`, `feat: add generateQuestion utility`, `test: add score calculator edge cases`
  - Never commit broken or non-compiling code to main
  - Write commit messages that explain *why*, not just *what*
- **Reason**: Small commits are easier to review, revert, and understand. A good git log is part of the documentation.
- **Status**: Accepted — applies to every step

## ADR-013 — Copy tone: young, playful, Swedish for children
- **Decision**: All Swedish copy must be written for children aged 7–14
  - Short sentences, simple words, encouraging tone
  - No formal or academic language
  - Exclamation marks and energy are welcome
  - Wrong answers: "Nästan! Försök igen 💪" not "Fel svar"
  - Reveals: "Rätt svar är X — nu kör vi vidare!" not "Du svarade fel tre gånger"
  - Results: celebratory regardless of score
- **Reason**: The target audience is children. Copy that feels cold, formal, or punishing breaks the fun-first principle.
- **Status**: Accepted — all copy must be reviewed against this standard before shipping
