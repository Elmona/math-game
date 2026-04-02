// Step 3.4 — full results screen coming next
import { Suspense } from "react";
import ResultsPage from "./ResultsPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-indigo-950 text-white text-xl">
          Laddar…
        </main>
      }
    >
      <ResultsPage />
    </Suspense>
  );
}
