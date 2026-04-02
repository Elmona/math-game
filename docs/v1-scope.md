# V1 Scope

## Language

- **V1 language**: Swedish only
- **i18n structure**: in place from day one (`next-intl`, messages in `messages/sv.json`)
- **Future languages**: English (`en.json`) and Finnish (`fi.json`) can be added without code changes
- **Copy standard**: all Swedish text must be written for children — short, playful, encouraging, never academic

## In scope

### Teams
- Create a team (name → receive join code)
- Join a team with a name + join code

### Players
- Enter a name to play (no account or password)
- Optionally join a team before playing

### Gameplay
- Multiplication only (factors 0–10) — one operation to keep v1 focused
- Fixed number of questions per round (~20, to be tuned after playtesting)
- Fixed time limit per round (duration TBD, to be tuned after playtesting)
- After 3 wrong attempts on one question: correct answer is revealed, player proceeds
- Questions generated on the client (v1: acceptable, no sensitive data)

### Scoring
- Formula: `score = (correct × 10) - (reveals × 3) + (remaining_seconds × 2)`
  - A "reveal" = a question that required showing the correct answer
  - All multipliers are tunable constants, not hardcoded magic numbers
- Round must have a fixed time limit (required for remaining_seconds to be meaningful)

### Score submission
- Score submitted to the server at the end of a session
- Server validates: score is plausible given question count, reveals, and time elapsed
- Client sends raw data (correct count, reveal count, duration); server recomputes score

### Leaderboards
- Individual leaderboard: best score per player (all time)
- Team leaderboard: sum of top N scores per team member

## Out of scope (v1)

- User accounts / login / authentication
- Password protection for teams
- Admin panel
- Multiple game modes or difficulty settings (v1 uses one mode)
- Achievements or badges
- Sound effects (may add later)
- Mobile app (web-first, but mobile-responsive)
- Email or social sharing
- Real-time multiplayer (players compete live)
- Paid tiers or subscriptions
- Analytics dashboard
- Moderation tools
- English and Finnish language support (structure is prepared, translation is out of scope for v1)
