import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getTopPlayers, getTopTeams, getTeamLeaderboard, type PlayerRankEntry } from "@/lib/db/leaderboard";
import { findTeamByJoinCode } from "@/lib/db/teams";
import LeaderboardTabs from "./LeaderboardTabs";

export const metadata: Metadata = {
  title: "Topplistan — Mattespelet",
};

// Revalidate every 60 seconds so results are reasonably fresh
export const revalidate = 60;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const t = await getTranslations("leaderboard");
  const tCommon = await getTranslations("common");
  const { team: teamJoinCode } = await searchParams;

  let players: Awaited<ReturnType<typeof getTopPlayers>> = [];
  let teams: Awaited<ReturnType<typeof getTopTeams>> = [];
  try {
    [players, teams] = await Promise.all([getTopPlayers(), getTopTeams()]);
  } catch {
    // Supabase not available in dev without env vars — show empty state
  }

  let myTeam: { id: string; name: string; entries: PlayerRankEntry[] } | null = null;
  if (teamJoinCode) {
    try {
      const team = await findTeamByJoinCode(teamJoinCode.toUpperCase());
      if (team) {
        const entries = await getTeamLeaderboard(team.id);
        myTeam = { id: team.id, name: team.name, entries };
      }
    } catch {
      // Team not found or DB unavailable — skip team tab
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 bg-indigo-950 text-white gap-8">
      <h1 className="text-4xl font-black tracking-tight text-center">
        {t("title")}
      </h1>

      <LeaderboardTabs players={players} teams={teams} myTeam={myTeam} />

      <div className="flex flex-col items-center gap-3 w-full max-w-sm mt-auto">
        <Link
          href="/spela"
          className={`w-full rounded-2xl bg-yellow-400 px-8 py-4 text-xl font-bold text-indigo-950 text-center hover:bg-yellow-300 active:scale-95 transition-all min-h-[56px] flex items-center justify-center ${FOCUS_RING}`}
        >
          {tCommon("play")}
        </Link>
        <Link
          href="/"
          className={`text-sm text-indigo-400 hover:text-indigo-200 underline ${FOCUS_RING} rounded`}
        >
          {tCommon("homeLink")}
        </Link>
      </div>
    </main>
  );
}
