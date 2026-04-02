"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

function ScoreBadge({ score }: { score: number }) {
  const size =
    score >= 200 ? "text-8xl" : score >= 100 ? "text-7xl" : "text-6xl";
  return (
    <p
      className={`${size} font-black text-yellow-400 tabular-nums leading-none`}
      aria-label={`${score} poäng`}
    >
      {score}
      <span className="text-3xl font-bold text-yellow-300 ml-2">p</span>
    </p>
  );
}

export default function ResultsPage() {
  const t = useTranslations("results");
  const p = useSearchParams();

  const score = Math.max(0, parseInt(p.get("score") ?? "0", 10));
  const correct = Math.max(0, parseInt(p.get("correct") ?? "0", 10));
  const reveals = Math.max(0, parseInt(p.get("reveals") ?? "0", 10));

  const emoji =
    score >= 200 ? "🏆" : score >= 100 ? "⭐" : score >= 50 ? "😊" : "💪";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 bg-indigo-950 text-white text-center">
      {/* Heading */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl" aria-hidden="true">{emoji}</span>
        <h1 className="text-4xl font-black tracking-tight">{t("title")}</h1>
      </div>

      {/* Score */}
      <section aria-label={t("yourScore")}>
        <p className="text-sm font-semibold text-indigo-300 uppercase tracking-widest mb-2">
          {t("yourScore")}
        </p>
        <ScoreBadge score={score} />
      </section>

      {/* Stats */}
      <dl className="flex gap-8 text-center">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {t("correct")}
          </dt>
          <dd className="text-3xl font-black text-white tabular-nums">
            {correct}
          </dd>
        </div>
        <div
          className="w-px bg-indigo-700 self-stretch"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {t("reveals")}
          </dt>
          <dd className="text-3xl font-black text-white tabular-nums">
            {reveals}
          </dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/spela"
          className={`w-full rounded-2xl bg-yellow-400 px-8 py-4 text-xl font-bold text-indigo-950 text-center hover:bg-yellow-300 active:scale-95 transition-all min-h-[56px] flex items-center justify-center ${FOCUS_RING}`}
        >
          {t("playAgain")}
        </Link>
        <Link
          href="/topplista"
          className={`w-full rounded-2xl bg-indigo-700 px-8 py-4 text-xl font-bold text-white text-center hover:bg-indigo-600 active:scale-95 transition-all min-h-[56px] flex items-center justify-center ${FOCUS_RING}`}
        >
          {t("viewLeaderboard")}
        </Link>
        <Link
          href="/"
          className={`text-sm text-indigo-400 hover:text-indigo-200 underline mt-1 ${FOCUS_RING} rounded`}
        >
          ← Startsidan
        </Link>
      </div>
    </main>
  );
}
