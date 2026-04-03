@AGENTS.md

# Mattespelet — Project Context

Browser-based multiplication drill for children 7–14. Swedish-only UI (v1), mobile-first, WCAG 2.1 AA. Deployed on Vercel + Supabase (Postgres).

## Stack

- **Next.js 16.2** (App Router, React 19) — has breaking changes, read `node_modules/next/dist/docs/` before touching framework APIs
- **TypeScript**, **Tailwind CSS v4**, **next-intl v4** (Swedish default locale)
- **Supabase JS v2** (Postgres), **Jest** + React Testing Library

## Commands

```
npm run dev          # local dev server
npm run build        # production build — run before every commit
npm test             # jest (40 tests)
npm run db:start     # start local Supabase
npm run db:reset     # reset schema from migrations/
```

## Environment variables

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Local: `.env.local`. Production: Vercel dashboard.

## Architecture rules

- Server Components are the default. Add `"use client"` only when needed.
- `useSearchParams()` always requires a `<Suspense>` wrapper in the parent page (see `app/spela/page.tsx` for the pattern).
- `Math.random()` / `Date.now()` in `useState` initializers causes SSR hydration mismatch — defer to `useEffect` instead.
- `localStorage` reads must be inside `useEffect` for the same reason.
- Score is always recomputed server-side in `app/api/sessions/route.ts`. Never trust the client value.
- `revalidatePath("/topplista")` must be called after every session save or the leaderboard stays stale.

## Shared style constants

Copy these — don't reinvent them. They're redeclared per file (not in a shared module).

```ts
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
const BTN_PRIMARY = `w-full rounded-2xl bg-yellow-400 px-6 py-4 text-xl font-bold text-indigo-950 min-h-[44px] hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING}`
const BTN_SECONDARY = `w-full rounded-2xl bg-indigo-700 px-6 py-4 text-xl font-bold text-white min-h-[44px] hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING}`
const INPUT_CLASS = "w-full rounded-xl border-2 border-indigo-600 bg-indigo-900 px-4 py-3 text-white text-lg placeholder:text-indigo-400 focus:border-yellow-400 focus:outline-none"
```

All interactive touch targets must have `min-h-[44px]`.

## Game config (`lib/config.ts`)

```
FACTOR_MAX = 10            multiplication facts 0–10
QUESTIONS_PER_ROUND = 20
ROUND_TIME_SECONDS = 120   2-minute rounds
MAX_WRONG_ATTEMPTS = 3     show answer on 3rd wrong guess

Score = (correct × 10) - (reveals × 3) + (remainingSeconds × 2), min 0
```

## Player persistence (`lib/hooks/useLocalPlayer.ts`)

- localStorage key: `"mathgame_player"`
- Shape: `{ playerId, playerName, teamId?, teamName?, joinCode? }`
- `player` initialises as `null`; populated in `useEffect` after mount to avoid SSR mismatch

## Route map

```
/                   Home (Server Component)
/spela              Game (Server wrapper → GamePage "use client")
/spela/resultat     Results page
/lag                Team create/join (Server wrapper → TeamPage "use client")
/topplista          Leaderboard

POST /api/players           create player
POST /api/sessions          submit score (recomputes + revalidates leaderboard)
POST /api/teams             create team
GET  /api/teams/[joinCode]  look up team
GET  /api/leaderboard       top players + teams
```

## Copy tone

Swedish, child-friendly (ages 7–14), playful and encouraging. Never cold or technical.
