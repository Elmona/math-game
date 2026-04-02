"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Placeholder — full results screen built in Step 3.4
export default function ResultsPage() {
  const p = useSearchParams();
  const score = p.get("score") ?? "0";
  const correct = p.get("correct") ?? "0";
  const reveals = p.get("reveals") ?? "0";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 bg-indigo-950 text-white text-center">
      <h1 className="text-4xl font-black">Bra jobbat! 🌟</h1>
      <p className="text-6xl font-black text-yellow-400">{score} p</p>
      <p className="text-indigo-200">
        {correct} rätt · {reveals} ledtrådar
      </p>
      <Link
        href="/spela"
        className="rounded-2xl bg-yellow-400 px-8 py-4 text-xl font-bold text-indigo-950 hover:bg-yellow-300 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
      >
        Spela igen!
      </Link>
      <Link
        href="/"
        className="text-sm text-indigo-400 hover:text-indigo-200 underline"
      >
        Startsidan
      </Link>
    </main>
  );
}
