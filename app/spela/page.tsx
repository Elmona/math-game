import type { Metadata } from "next";
import { Suspense } from "react";
import GamePage from "./GamePage";

export const metadata: Metadata = {
  title: "Spela — Mattespelet",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-indigo-950 text-white text-xl">
          Laddar…
        </main>
      }
    >
      <GamePage />
    </Suspense>
  );
}
