import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 bg-indigo-950 text-white text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-7xl" role="img" aria-label="multiplikation">
          ✖️
        </span>
        <h1 className="text-5xl font-black tracking-tight">{t("title")}</h1>
        <p className="text-xl text-indigo-200 max-w-sm">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/spela"
          className="flex items-center justify-center rounded-2xl bg-yellow-400 px-8 py-5 text-xl font-bold text-indigo-950 shadow-lg hover:bg-yellow-300 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
        >
          {t("playSolo")}
        </Link>
        <Link
          href="/lag"
          className="flex items-center justify-center rounded-2xl bg-indigo-700 px-8 py-5 text-xl font-bold text-white shadow-lg hover:bg-indigo-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
        >
          {t("joinTeam")}
        </Link>
      </div>
    </main>
  );
}
