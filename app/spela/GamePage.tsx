"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { generateRound, type Question } from "@/lib/question";
import {
  ROUND_TIME_SECONDS,
  QUESTIONS_PER_ROUND,
  MAX_WRONG_ATTEMPTS,
} from "@/lib/config";

type Phase = "name-entry" | "playing" | "submitting";
type Feedback = "idle" | "correct" | "wrong" | "reveal";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

const BTN_PRIMARY =
  `w-full rounded-2xl bg-yellow-400 px-6 py-4 text-xl font-bold text-indigo-950 min-h-[44px] hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING}`;

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-indigo-600 bg-indigo-900 px-4 py-3 text-white text-lg placeholder:text-indigo-400 focus:border-yellow-400 focus:outline-none";

export default function GamePage() {
  const t = useTranslations("game");
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPlayerId = searchParams.get("playerId");
  const teamId = searchParams.get("teamId");

  const [phase, setPhase] = useState<Phase>(
    initialPlayerId ? "playing" : "name-entry"
  );
  const [playerId, setPlayerId] = useState<string | null>(initialPlayerId);
  const [questions] = useState<Question[]>(() =>
    generateRound(QUESTIONS_PER_ROUND)
  );
  const [current, setCurrent] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [reveals, setReveals] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [answer, setAnswer] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [timerAnnounce, setTimerAnnounce] = useState("");

  // Refs to read current values inside async callbacks and effects
  const submittedRef = useRef(false);
  const correctRef = useRef(0);
  correctRef.current = correct;
  const revealsRef = useRef(0);
  revealsRef.current = reveals;
  const timeLeftRef = useRef(ROUND_TIME_SECONDS);
  timeLeftRef.current = timeLeft;
  const playerIdRef = useRef<string | null>(initialPlayerId);
  playerIdRef.current = playerId;

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(
      () => setTimeLeft((prev) => Math.max(0, prev - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [phase]);

  // Announce timer at milestones only (not every second)
  useEffect(() => {
    if ([30, 10, 5, 3, 2, 1].includes(timeLeft)) {
      setTimerAnnounce(`${timeLeft} sekunder kvar`);
    }
  }, [timeLeft]);

  // ── Game-over detection ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const done =
      timeLeft <= 0 ||
      (questions.length > 0 && current >= questions.length);
    if (!done || submittedRef.current) return;
    submittedRef.current = true;
    submitSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, current, phase]);

  // ── Feedback auto-advance ──────────────────────────────────────────────
  useEffect(() => {
    if (feedback === "correct" || feedback === "reveal") {
      const id = setTimeout(() => {
        setCurrent((prev) => prev + 1);
        setWrongAttempts(0);
        setFeedback("idle");
        setAnswer("");
      }, 1200);
      return () => clearTimeout(id);
    }
    if (feedback === "wrong") {
      const id = setTimeout(() => setFeedback("idle"), 700);
      return () => clearTimeout(id);
    }
  }, [feedback]);

  // ── Auto-focus input ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "playing" && feedback === "idle") {
      inputRef.current?.focus();
    }
  }, [current, feedback, phase]);

  // ── Handlers ───────────────────────────────────────────────────────────
  async function submitSession() {
    setPhase("submitting");
    const durationMs = Math.max(
      0,
      (ROUND_TIME_SECONDS - timeLeftRef.current) * 1000
    );
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: playerIdRef.current,
          teamId: teamId ?? null,
          correct: correctRef.current,
          reveals: revealsRef.current,
          durationMs,
        }),
      });
      const session = await res.json();
      router.push(
        `/spela/resultat?score=${session.score}&correct=${correctRef.current}&reveals=${revealsRef.current}`
      );
    } catch {
      router.push(
        `/spela/resultat?score=0&correct=${correctRef.current}&reveals=${revealsRef.current}`
      );
    }
  }

  async function handleSoloStart(e: React.FormEvent) {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) {
      setNameError("Du måste ange ett namn för att spela.");
      return;
    }
    setNameError("");
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const player = await res.json();
      setPlayerId(player.id);
      setPhase("playing");
    } catch {
      setNameError("Något gick fel. Försök igen!");
    }
  }

  function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (feedback !== "idle") return;
    const guess = parseInt(answer.trim(), 10);
    if (isNaN(guess)) return;

    const q = questions[current];
    if (guess === q.answer) {
      setCorrect((c) => c + 1);
      setFeedback("correct");
    } else {
      const next = wrongAttempts + 1;
      if (next >= MAX_WRONG_ATTEMPTS) {
        setReveals((r) => r + 1);
        setWrongAttempts(0);
        setFeedback("reveal");
      } else {
        setWrongAttempts(next);
        setFeedback("wrong");
      }
    }
    setAnswer("");
  }

  // ── Name entry screen (solo) ───────────────────────────────────────────
  if (phase === "name-entry") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 bg-indigo-950 text-white">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <h1 className="text-3xl font-black text-center tracking-tight">
            Vad heter du?
          </h1>
          <form onSubmit={handleSoloStart} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="solo-name"
                className="text-sm font-semibold text-indigo-200"
              >
                Ditt namn
              </label>
              <input
                id="solo-name"
                type="text"
                autoComplete="nickname"
                autoFocus
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className={INPUT_CLASS}
                aria-describedby={nameError ? "name-error" : undefined}
              />
              {nameError && (
                <p id="name-error" role="alert" className="text-red-400 text-sm">
                  {nameError}
                </p>
              )}
            </div>
            <button type="submit" className={BTN_PRIMARY}>
              Spela! 🚀
            </button>
          </form>
          <a
            href="/"
            className={`text-center text-sm text-indigo-400 hover:text-indigo-200 underline ${FOCUS_RING} rounded`}
          >
            ← Tillbaka
          </a>
        </div>
      </main>
    );
  }

  // ── Submitting ─────────────────────────────────────────────────────────
  if (phase === "submitting" || current >= questions.length) {
    return (
      <main
        className="flex flex-1 items-center justify-center bg-indigo-950 text-white text-xl"
        aria-live="polite"
      >
        Sparar resultat…
      </main>
    );
  }

  // ── Game screen ────────────────────────────────────────────────────────
  const q = questions[current];
  const isUrgent = timeLeft <= 10;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6 bg-indigo-950 text-white gap-6">
      {/* Screen-reader timer milestone announcements */}
      <span aria-live="assertive" className="sr-only">
        {timerAnnounce}
      </span>

      {/* Timer + progress row */}
      <div className="w-full max-w-sm flex items-center justify-between gap-4">
        <span
          aria-hidden="true"
          className={`text-2xl font-bold tabular-nums transition-colors ${
            isUrgent ? "text-red-400" : "text-indigo-200"
          }`}
        >
          {timeLeft}s
        </span>
        <progress
          value={current}
          max={QUESTIONS_PER_ROUND}
          aria-label={`Fråga ${current + 1} av ${QUESTIONS_PER_ROUND}`}
          className="flex-1 h-3 rounded-full overflow-hidden accent-yellow-400"
        />
        <span aria-hidden="true" className="text-sm text-indigo-300 tabular-nums">
          {current + 1}/{QUESTIONS_PER_ROUND}
        </span>
      </div>

      {/* Question */}
      <div
        key={current}
        className="question-enter flex flex-col items-center gap-2 text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-5xl font-black tracking-tight">
          {t("question", { a: q.a, b: q.b })}
        </p>
      </div>

      {/* Wrong-attempt dots */}
      <div
        aria-label={`${MAX_WRONG_ATTEMPTS - wrongAttempts} försök kvar`}
        className="flex gap-2"
      >
        {Array.from({ length: MAX_WRONG_ATTEMPTS }).map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < wrongAttempts ? "bg-red-400" : "bg-indigo-600"
            }`}
          />
        ))}
      </div>

      {/* Answer form */}
      <form
        onSubmit={handleAnswer}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <label htmlFor="answer" className="sr-only">
          Ditt svar
        </label>
        <input
          id="answer"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={feedback !== "idle"}
          className={`${INPUT_CLASS} text-3xl text-center tracking-widest`}
          aria-describedby="feedback-msg"
        />
        <button
          type="submit"
          disabled={feedback !== "idle" || !answer.trim()}
          className={BTN_PRIMARY}
        >
          OK
        </button>
      </form>

      {/* Feedback */}
      <div
        id="feedback-msg"
        role="alert"
        aria-atomic="true"
        aria-live="assertive"
        className={`text-center text-2xl font-bold min-h-[2rem] transition-opacity ${
          feedback === "idle" ? "opacity-0" : "opacity-100"
        }`}
      >
        {feedback === "correct" && (
          <span className="text-green-400">{t("correct")}</span>
        )}
        {feedback === "wrong" && (
          <span className="text-yellow-300">{t("wrong")}</span>
        )}
        {feedback === "reveal" && (
          <span className="text-indigo-300">
            {t("reveal", { answer: q.answer })}
          </span>
        )}
      </div>
    </main>
  );
}
