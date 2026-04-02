"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// ── Numpad ─────────────────────────────────────────────────────────────────
const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"] as const;

function Numpad({
  onDigit,
  onDelete,
  onConfirm,
  disabled,
  hasAnswer,
}: {
  onDigit: (d: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  disabled: boolean;
  hasAnswer: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Sifferknappar"
      className="grid grid-cols-3 gap-2 w-full max-w-sm"
    >
      {NUMPAD_KEYS.map((key) => {
        const isConfirm = key === "✓";
        const isDelete = key === "⌫";
        const isDisabled = disabled || (isConfirm && !hasAnswer);

        return (
          <button
            key={key}
            type="button"
            aria-label={
              isConfirm ? "Svara" : isDelete ? "Radera" : `Siffra ${key}`
            }
            disabled={isDisabled}
            onClick={() => {
              if (isDelete) onDelete();
              else if (isConfirm) onConfirm();
              else onDigit(key);
            }}
            className={[
              "rounded-2xl text-3xl font-bold min-h-[72px] transition-all active:scale-95",
              FOCUS_RING,
              isConfirm
                ? "bg-yellow-400 text-indigo-950 hover:bg-yellow-300"
                : isDelete
                ? "bg-indigo-700 text-white hover:bg-indigo-600"
                : "bg-indigo-800 text-white hover:bg-indigo-700",
              isDisabled ? "opacity-40 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
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

  // Refs to read current values inside async callbacks
  const submittedRef = useRef(false);
  const correctRef = useRef(0);
  correctRef.current = correct;
  const revealsRef = useRef(0);
  revealsRef.current = reveals;
  const timeLeftRef = useRef(ROUND_TIME_SECONDS);
  timeLeftRef.current = timeLeft;
  const playerIdRef = useRef<string | null>(initialPlayerId);
  playerIdRef.current = playerId;

  // ── Answer evaluation (shared by numpad ✓ and keyboard Enter) ────────────
  const evaluateAnswer = useCallback(
    (raw: string) => {
      if (feedback !== "idle") return;
      const guess = parseInt(raw.trim(), 10);
      if (isNaN(guess) || raw.trim() === "") return;

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
    },
    [feedback, questions, current, wrongAttempts]
  );

  // ── Keyboard input (desktop + external keyboards) ────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;

    function onKeyDown(e: KeyboardEvent) {
      if (feedback !== "idle") return;
      // Ignore modifier combos
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setAnswer((prev) => (prev.length < 3 ? prev + e.key : prev));
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setAnswer((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        setAnswer((prev) => {
          evaluateAnswer(prev);
          return prev; // evaluateAnswer clears via its own setAnswer("") call
        });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, feedback, evaluateAnswer]);

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(
      () => setTimeLeft((prev) => Math.max(0, prev - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [phase]);

  // Announce timer at milestones only
  useEffect(() => {
    if ([30, 10, 5, 3, 2, 1].includes(timeLeft)) {
      setTimerAnnounce(`${timeLeft} sekunder kvar`);
    }
  }, [timeLeft]);

  // ── Game-over detection ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const done =
      timeLeft <= 0 || (questions.length > 0 && current >= questions.length);
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

  // ── Submit session ─────────────────────────────────────────────────────
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

  // ── Solo name entry ────────────────────────────────────────────────────
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

  // ── Name entry screen ─────────────────────────────────────────────────
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

  // ── Game board ─────────────────────────────────────────────────────────
  const q = questions[current];
  const isUrgent = timeLeft <= 10;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-4 bg-indigo-950 text-white gap-4">
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

      {/* Answer display — updated by both numpad and keyboard */}
      <div
        aria-live="polite"
        aria-label={answer ? `Ditt svar: ${answer}` : "Inget svar ännu"}
        className={[
          "w-full max-w-sm rounded-2xl border-2 px-6 py-4 text-center text-4xl font-black tabular-nums tracking-widest transition-colors",
          feedback === "correct"
            ? "border-green-400 text-green-400"
            : feedback === "wrong"
            ? "border-red-400 text-red-400"
            : "border-indigo-600 text-white",
          answer ? "" : "text-indigo-600",
        ].join(" ")}
      >
        {answer || "—"}
      </div>

      {/* Wrong-attempt dots */}
      <div
        aria-label={`${MAX_WRONG_ATTEMPTS - wrongAttempts} försök kvar`}
        className="flex gap-2"
      >
        {Array.from({ length: MAX_WRONG_ATTEMPTS }).map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < wrongAttempts ? "bg-red-400" : "bg-indigo-600"
            }`}
          />
        ))}
      </div>

      {/* Feedback */}
      <div
        role="alert"
        aria-atomic="true"
        aria-live="assertive"
        className={`text-center text-xl font-bold min-h-[1.75rem] transition-opacity ${
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

      {/* Numpad — always visible, works alongside keyboard input */}
      <Numpad
        onDigit={(d) =>
          setAnswer((prev) => (prev.length < 3 ? prev + d : prev))
        }
        onDelete={() => setAnswer((prev) => prev.slice(0, -1))}
        onConfirm={() => evaluateAnswer(answer)}
        disabled={feedback !== "idle"}
        hasAnswer={answer.length > 0}
      />
    </main>
  );
}
