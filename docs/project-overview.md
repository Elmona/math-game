# Project Overview

## What is this?

Math Game is a browser-based math drill game for children aged 7–14. Players answer timed arithmetic questions and earn a score. They can play solo or as part of a named team (a family, school class, or friend group). High scores are tracked server-side and shown on leaderboards.

## Target audience

- **Primary**: Children aged 7–14
- **Secondary**: Parents and teachers who create or manage teams

## Core gameplay concept

1. Player enters their name (and optionally a team join code)
2. A timed round begins — a fixed set of multiplication questions (0–10) appears one by one
3. Player types their answer for each question
4. If a player answers a question wrong **3 times**, the correct answer is shown and they move on
5. The round ends when all questions are answered (or time runs out — TBD)
6. Score is calculated and submitted to the server
7. Player sees where they rank on the individual and team leaderboards

## Game rules (v1)

- **Operation**: Multiplication only (factors 0–10)
- **Questions per round**: ~20 (to be tuned after playtesting)
- **Time limit**: Fixed per round (duration TBD — to be tuned)
- **Wrong answer handling**: After 3 wrong attempts on one question, the correct answer is revealed and the player proceeds automatically
- **Scoring formula**: `score = (correct × 10) - (reveals × 3) + (remaining_seconds × 2)`
  - A "reveal" = a question where the correct answer had to be shown (3 wrong attempts)
  - Rewards both accuracy and speed
  - All multipliers are tunable — flagged as knobs to adjust after playtesting

## Design direction

- Playful, energetic, friendly, and modern
- Feels like a game — not a school worksheet
- Bright accents, rounded shapes, clear visual hierarchy
- Strong feedback on correct/wrong answers
- Accessible and easy to read for children

## Tone principle — fun first, never stressful

The game should feel like a fun challenge, not a test. Kids naturally enjoy competing — the pressure of a timer or a leaderboard is exciting, not scary, as long as the environment is encouraging and never punishing.

Practical implications for UI and copy:
- Wrong answers: encouraging, not harsh ("Not quite! Try again" not "Wrong!")
- Reveal mechanic: framed as a hint/learning moment, not a failure
- Timer: exciting countdown, not an anxiety trigger — consider calm styling unless nearly expired
- Leaderboard: celebratory for everyone, not just the winner
- No red X's, no alarming sounds, no score penalties shown as big red numbers
- Keep the energy high and positive throughout

## Core entities

| Entity | Description |
|---|---|
| Team | A group (family, class). Has a name and a join code. |
| Player | A named participant belonging to a team (or playing solo). |
| Game session | One completed round: score, correct/wrong answers, duration. |
