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
import { calculateScore } from "@/lib/score";
import { useLocalPlayer } from "@/lib/hooks/useLocalPlayer";

type Phase = "name-entry" | "playing" | "submitting";
type Feedback = "idle" | "correct" | "wrong" | "reveal";

type RoundState = {
  questions: Question[] | null;
  questionIndex: number;
  wrongAttempts: number;
  correct: number;
  reveals: number;
  timeLeft: number;
  feedback: Feedback;
  answer: string;
};

const INITIAL_ROUND: RoundState = {
  questions: null,
  questionIndex: 0,
  wrongAttempts: 0,
  correct: 0,
  reveals: 0,
  timeLeft: ROUND_TIME_SECONDS,
  feedback: "idle",
  answer: "",
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

const BTN_PRIMARY =
  `w-full rounded-2xl bg-yellow-400 px-6 py-4 text-xl font-bold text-indigo-950 min-h-[44px] hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING}`;

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-indigo-600 bg-indigo-900 px-4 py-3 text-white text-lg placeholder:text-indigo-400 focus:border-yellow-400 focus:outline-none";

// ── Numpad ─────────────────────────────────────────────────────────────────
// onMouseDown e.preventDefault() prevents buttons from stealing focus from
// the hidden capture input, so the keyboard listener keeps working after
// a tap on mobile or a click on desktop.

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
  const t = useTranslations("game");
  return (
    <div role="group" aria-label={t("numpad")} className="grid grid-cols-3 gap-2 w-full max-w-sm">
      {NUMPAD_KEYS.map((key) => {
        const isConfirm = key === "✓";
        const isDelete = key === "⌫";
        const isDisabled = disabled || (isConfirm && !hasAnswer);

        return (
          <button
            key={key}
            type="button"
            aria-label={isConfirm ? t("numpadConfirm") : isDelete ? t("numpadDelete") : t("numpadDigit", { digit: key })}
            disabled={isDisabled}
            // Prevent focus from leaving the capture input on every tap/click
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (isDelete) onDelete();
              else if (isConfirm) onConfirm();
              else onDigit(key);
            }}
            className={[
              "rounded-2xl text-2xl sm:text-3xl font-bold min-h-[56px] sm:min-h-[72px] transition-all active:scale-95",
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
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { player: storedPlayer, savePlayer, clearPlayer } = useLocalPlayer();

  const initialPlayerId = searchParams.get("playerId");
  const teamId = searchParams.get("teamId");

  const [phase, setPhase] = useState<Phase>(
    initialPlayerId ? "playing" : "name-entry"
  );
  const [playerId, setPlayerId] = useState<string | null>(initialPlayerId);
  const [round, setRound] = useState<RoundState>(INITIAL_ROUND);
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [timerAnnounce, setTimerAnnounce] = useState("");

  // Refs for values needed in async/submit callbacks
  const submittedRef = useRef(false);
  const correctRef = useRef(0);
  correctRef.current = round.correct;
  const revealsRef = useRef(0);
  revealsRef.current = round.reveals;
  const timeLeftRef = useRef(ROUND_TIME_SECONDS);
  timeLeftRef.current = round.timeLeft;
  const playerIdRef = useRef<string | null>(initialPlayerId);
  playerIdRef.current = playerId;

  // The hidden capture input — focused aggressively so keyboard always works
  const captureRef = useRef<HTMLInputElement>(null);

  // ── Generate questions client-side only (Math.random() causes SSR mismatch) ──
  useEffect(() => {
    setRound((r) => ({ ...r, questions: generateRound(QUESTIONS_PER_ROUND) }));
  }, []);

  // ── Auto-skip name entry if localStorage has a stored player ───────────
  useEffect(() => {
    if (storedPlayer && !initialPlayerId && phase === "name-entry") {
      setPlayerId(storedPlayer.playerId);
      setPhase("playing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedPlayer]);

  // ── Answer evaluation ──────────────────────────────────────────────────
  function evaluate(raw: string) {
    // Block during wrong flash and reveal (child needs to read the answer)
    if (round.feedback === "wrong" || round.feedback === "reveal") return;
    if (!round.questions) return;
    const guess = parseInt(raw.trim(), 10);
    if (isNaN(guess) || !raw.trim()) return;

    const q = round.questions[round.questionIndex];
    if (guess === q.answer) {
      setRound((r) => ({
        ...r,
        correct: r.correct + 1,
        questionIndex: r.questionIndex + 1,
        wrongAttempts: 0,
        feedback: "correct",
        answer: "",
      }));
    } else {
      const next = round.wrongAttempts + 1;
      if (next >= MAX_WRONG_ATTEMPTS) {
        setRound((r) => ({
          ...r,
          reveals: r.reveals + 1,
          wrongAttempts: 0,
          feedback: "reveal",
          answer: "",
        }));
      } else {
        setRound((r) => ({ ...r, wrongAttempts: next, feedback: "wrong", answer: "" }));
      }
    }
  }

  // ── Aggressive focus — keep keyboard capture input focused during play ──
  useEffect(() => {
    if (phase === "playing" && round.feedback === "idle") {
      captureRef.current?.focus();
    }
  }, [phase, round.feedback, round.questionIndex]);

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(
      () => setRound((r) => ({ ...r, timeLeft: Math.max(0, r.timeLeft - 1) })),
      1000
    );
    return () => clearInterval(id);
  }, [phase]);

  // Announce timer at milestones only (not every second)
  useEffect(() => {
    if ([30, 10, 5, 3, 2, 1].includes(round.timeLeft)) {
      setTimerAnnounce(t("timeLeft", { seconds: round.timeLeft }));
    }
  }, [round.timeLeft]);

  // ── Game-over detection ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || !round.questions) return;
    const done = round.timeLeft <= 0 || round.questionIndex >= round.questions.length;
    if (!done || submittedRef.current) return;
    submittedRef.current = true;
    submitSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.timeLeft, round.questionIndex, phase]);

  // ── Feedback flash — clear after a short delay ─────────────────────────
  useEffect(() => {
    if (round.feedback === "idle") return;
    if (round.feedback === "wrong") {
      const id = setTimeout(() => setRound((r) => ({ ...r, feedback: "idle" })), 700);
      return () => clearTimeout(id);
    }
    if (round.feedback === "correct") {
      const id = setTimeout(() => setRound((r) => ({ ...r, feedback: "idle" })), 500);
      return () => clearTimeout(id);
    }
    if (round.feedback === "reveal") {
      // Keep the correct answer visible long enough for the child to read it,
      // then advance to the next question
      const id = setTimeout(() => {
        setRound((r) => ({ ...r, questionIndex: r.questionIndex + 1, feedback: "idle" }));
      }, 2500);
      return () => clearTimeout(id);
    }
  }, [round.feedback]);

  // ── Submit session ─────────────────────────────────────────────────────
  async function submitSession() {
    setPhase("submitting");
    const remainingSeconds = timeLeftRef.current;
    const durationMs = Math.max(0, (ROUND_TIME_SECONDS - remainingSeconds) * 1000);
    // Compute score client-side as fallback in case the API is unavailable
    const fallbackScore = calculateScore({
      correct: correctRef.current,
      reveals: revealsRef.current,
      remainingSeconds,
    });

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
      const score = typeof session.score === "number" ? session.score : fallbackScore;
      router.push(
        `/spela/resultat?score=${score}&correct=${correctRef.current}&reveals=${revealsRef.current}`
      );
    } catch {
      router.push(
        `/spela/resultat?score=${fallbackScore}&correct=${correctRef.current}&reveals=${revealsRef.current}`
      );
    }
  }

  // ── Restart ────────────────────────────────────────────────────────────
  function handleRestart() {
    submittedRef.current = false;
    setRound({ ...INITIAL_ROUND, questions: generateRound(QUESTIONS_PER_ROUND) });
  }

  // ── Solo name entry ────────────────────────────────────────────────────
  async function handleSoloStart(e: React.FormEvent) {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) { setNameError(tErrors("nameRequired")); return; }
    setNameError("");
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const player = await res.json();
      setPlayerId(player.id);
      savePlayer({ playerId: player.id, playerName: name });
      setPhase("playing");
    } catch {
      setNameError(tErrors("generic"));
    }
  }

  // ── Name entry screen ──────────────────────────────────────────────────
  if (phase === "name-entry") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 bg-indigo-950 text-white">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <h1 className="text-3xl font-black text-center tracking-tight">{t("nameHeading")}</h1>
          {storedPlayer && (
            <div className="flex items-center justify-between rounded-xl bg-indigo-900 px-4 py-3 text-sm">
              <span className="text-indigo-200">
                {tNav("playingAs")} <span className="font-bold text-white">{storedPlayer.playerName}</span>
              </span>
              <button
                type="button"
                onClick={clearPlayer}
                className={`text-yellow-400 underline hover:text-yellow-300 ${FOCUS_RING} rounded`}
              >
                {tNav("change")}
              </button>
            </div>
          )}
          <form onSubmit={handleSoloStart} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="solo-name" className="text-sm font-semibold text-indigo-200">
                {t("nameLabel")}
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
                <p id="name-error" role="alert" className="text-red-400 text-sm">{nameError}</p>
              )}
            </div>
            <button type="submit" className={BTN_PRIMARY}>{t("startButton")}</button>
          </form>
          <a href="/" className={`text-center text-sm text-indigo-400 hover:text-indigo-200 underline ${FOCUS_RING} rounded`}>
            {tCommon("backLink")}
          </a>
        </div>
      </main>
    );
  }

  // ── Submitting ─────────────────────────────────────────────────────────
  if (phase === "submitting" || (round.questions !== null && round.questionIndex >= round.questions.length)) {
    return (
      <main className="flex flex-1 items-center justify-center bg-indigo-950 text-white text-xl" aria-live="polite">
        {t("saving")}
      </main>
    );
  }

  // ── Game board ─────────────────────────────────────────────────────────
  if (!round.questions) {
    return (
      <main className="flex flex-1 items-center justify-center bg-indigo-950 text-white text-xl">
        {tCommon("loading")}
      </main>
    );
  }

  const q = round.questions[round.questionIndex];
  const isUrgent = round.timeLeft <= 10;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-2 sm:py-4 bg-indigo-950 text-white gap-3 sm:gap-4">
      {/* Screen-reader timer milestone announcements */}
      <span aria-live="assertive" className="sr-only">{timerAnnounce}</span>

      {/* Timer + progress row */}
      <div className="w-full max-w-sm flex items-center justify-between gap-4">
        <span
          aria-hidden="true"
          className={`text-2xl font-bold tabular-nums transition-colors ${isUrgent ? "text-red-400" : "text-indigo-200"}`}
        >
          {round.timeLeft}s
        </span>
        <progress
          value={round.questionIndex}
          max={QUESTIONS_PER_ROUND}
          aria-label={t("questionProgress", { current: round.questionIndex + 1, total: QUESTIONS_PER_ROUND })}
          className="flex-1 h-3 rounded-full overflow-hidden accent-yellow-400"
        />
        <span aria-hidden="true" className="text-sm text-indigo-300 tabular-nums">
          {round.questionIndex + 1}/{QUESTIONS_PER_ROUND}
        </span>
      </div>

      {/* Question */}
      <div key={round.questionIndex} className="question-enter flex flex-col items-center gap-2 text-center" aria-live="polite" aria-atomic="true">
        <p className="text-4xl sm:text-5xl font-black tracking-tight">{t("question", { a: q.a, b: q.b })}</p>
      </div>

      {/* Wrong-attempt dots */}
      <div aria-label={t("attemptsLeft", { attempts: MAX_WRONG_ATTEMPTS - round.wrongAttempts })} className="flex gap-2">
        {Array.from({ length: MAX_WRONG_ATTEMPTS }).map((_, i) => (
          <span key={i} className={`w-3 h-3 rounded-full transition-colors ${i < round.wrongAttempts ? "bg-red-400" : "bg-indigo-600"}`} />
        ))}
      </div>

      {/* Answer display + hidden capture input
          inputMode="none" → no OS keyboard on mobile, but physical keyboards
          still fire onChange because inputMode only controls the virtual keyboard.
          Aggressive focus (via useEffect above) keeps keyboard input working
          even after the numpad buttons are tapped. */}
      <div className="w-full max-w-sm flex flex-col items-center gap-1">
        <label htmlFor="capture-input" className="sr-only">{t("yourAnswer")}</label>

        {/* Visual display */}
        <div
          aria-hidden="true"
          className={[
            "w-full rounded-2xl border-2 px-6 py-3 sm:py-4 text-center text-3xl sm:text-4xl font-black tabular-nums tracking-widest transition-colors pointer-events-none",
            round.feedback === "correct" ? "border-green-400 text-green-400"
              : round.feedback === "wrong" ? "border-red-400 text-red-400"
              : "border-indigo-600 text-white",
            round.answer ? "" : "text-indigo-600",
          ].join(" ")}
        >
          {round.answer || "—"}
        </div>

        {/* Actual focused input — visually hidden, captures keyboard */}
        <input
          id="capture-input"
          ref={captureRef}
          type="text"
          inputMode="none"
          autoComplete="off"
          value={round.answer}
          disabled={round.feedback === "wrong" || round.feedback === "reveal"}
          onChange={(e) => {
            // Strip non-digits, max 3 chars (10×10=100 is the max answer)
            const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
            setRound((r) => ({ ...r, answer: digits }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              evaluate(round.answer);
            }
          }}
          className="sr-only"
          aria-describedby="feedback-msg"
        />
      </div>

      {/* Feedback */}
      <div
        id="feedback-msg"
        role="alert"
        aria-atomic="true"
        aria-live="assertive"
        className={`text-center text-xl font-bold min-h-[1.75rem] transition-opacity ${round.feedback === "idle" ? "opacity-0" : "opacity-100"}`}
      >
        {round.feedback === "correct" && <span className="text-green-400">{t("correct")}</span>}
        {round.feedback === "wrong" && <span className="text-yellow-300">{t("wrong")}</span>}
        {round.feedback === "reveal" && <span className="text-indigo-300">{t("reveal", { answer: q.answer })}</span>}
      </div>

      {/* Wrapper prevents mobile touch from stealing focus from the capture input.
          touchstart fires before mousedown, so we must preventDefault here;
          touchend restores focus as belt-and-suspenders. */}
      <div
        className="w-full max-w-sm"
        onTouchStart={(e) => e.preventDefault()}
        onTouchEnd={() => captureRef.current?.focus()}
      >
        <Numpad
          onDigit={(d) => setRound((r) => ({ ...r, answer: r.answer.length < 3 ? r.answer + d : r.answer }))}
          onDelete={() => setRound((r) => ({ ...r, answer: r.answer.slice(0, -1) }))}
          onConfirm={() => evaluate(round.answer)}
          disabled={round.feedback === "wrong" || round.feedback === "reveal"}
          hasAnswer={round.answer.length > 0}
        />
      </div>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleRestart}
        className={`mt-6 text-sm text-indigo-400 hover:text-indigo-200 underline min-h-[44px] px-4 ${FOCUS_RING} rounded`}
      >
        {t("restart")}
      </button>
    </main>
  );
}
