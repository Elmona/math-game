import type { Metadata } from "next";
import { Suspense } from "react";
import TeamPage from "./TeamPage";

export const metadata: Metadata = {
  title: "Lag — Mattespelet",
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
      <TeamPage />
    </Suspense>
  );
}
