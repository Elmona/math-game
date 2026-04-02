# Math Game

A playful, modern math game for children aged 7–14. Play solo or as part of a team (family, class, or group). Compete on leaderboards — no login required.

## Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgres)
- **Deployment**: Vercel
- **Testing**: Jest + React Testing Library

## How we work

- We iterate step by step — never the whole app at once
- TDD: tests are written before or alongside implementation
- Docs are updated before or with each code change
- `docs/progress.md` is our living checklist
- `docs/implementation-plan.md` defines the phased roadmap
- Git: commit early and often — every logical unit of work is its own commit
  - Conventional commits: `feat:`, `test:`, `docs:`, `fix:`, `chore:`
  - Never batch unrelated changes, never commit broken code

## Getting started

### Prerequisites

- Node 22 LTS — install via [nvm](https://github.com/nvm-sh/nvm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — required for the local database
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase`

### First-time setup

```bash
nvm use                          # switch to Node 22 (see .nvmrc)
npm install                      # install dependencies
npm run db:start                 # start local Supabase (runs migrations automatically)
```

After `db:start`, copy the credentials it prints:

```bash
cp .env.local.example .env.local
# then open .env.local and fill in:
#   SUPABASE_URL        → API URL printed by db:start  (e.g. http://127.0.0.1:54321)
#   SUPABASE_SERVICE_ROLE_KEY → SERVICE_ROLE_KEY printed by db:start
#
# Or run:  npm run db:status   to see credentials again at any time
```

```bash
npm run dev      # start the Next.js dev server at http://localhost:3000
npm test         # run tests
```

### Daily workflow

```bash
npm run db:start   # start the database (Docker must be running)
npm run dev        # start the app
```

### Database commands

| Command | What it does |
|---|---|
| `npm run db:start` | Start local Supabase stack |
| `npm run db:stop` | Stop local Supabase stack |
| `npm run db:status` | Show URLs and credentials |
| `npm run db:reset` | Wipe DB and re-run all migrations (useful after schema changes) |

The local Supabase Studio (table browser, SQL editor) runs at **http://127.0.0.1:54323** while the stack is up.

## Docs

- [Project overview](docs/project-overview.md)
- [V1 scope](docs/v1-scope.md)
- [Architecture decisions](docs/architecture-decisions.md)
- [Implementation plan](docs/implementation-plan.md)
- [Progress tracker](docs/progress.md)
