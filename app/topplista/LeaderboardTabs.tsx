"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { PlayerRankEntry, TeamRankEntry } from "@/lib/db/leaderboard";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function RankTable({
  rows,
  emptyMsg,
}: {
  rows: { rank: number; name: string; score: number }[];
  emptyMsg: string;
}) {
  const t = useTranslations("leaderboard");

  if (rows.length === 0) {
    return (
      <p className="text-center text-indigo-400 py-10">{emptyMsg}</p>
    );
  }

  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">{t("title")}</caption>
      <thead>
        <tr className="border-b border-indigo-700">
          <th scope="col" className="py-2 pr-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider w-12">
            {t("rank")}
          </th>
          <th scope="col" className="py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {t("name")}
          </th>
          <th scope="col" className="py-2 pl-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider text-right">
            {t("score")}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={`${row.rank}-${row.name}`}
            className={`border-b border-indigo-800/50 ${row.rank === 1 ? "bg-yellow-400/5" : ""}`}
          >
            <td className="py-3 pr-4 text-lg font-bold tabular-nums">
              {MEDAL[row.rank] ?? (
                <span className="text-indigo-400">{row.rank}</span>
              )}
            </td>
            <td className="py-3 font-semibold text-white max-w-[140px] truncate">{row.name}</td>
            <td className="py-3 pl-4 text-right font-black tabular-nums text-yellow-400">
              {row.score}
              <span className="text-xs text-yellow-600 ml-1">p</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function LeaderboardTabs({
  players,
  teams,
}: {
  players: PlayerRankEntry[];
  teams: TeamRankEntry[];
}) {
  const t = useTranslations("leaderboard");
  const [activeTab, setActiveTab] = useState<"individual" | "teams">("individual");

  const tabs = [
    { id: "individual" as const, label: t("individual") },
    { id: "teams" as const, label: t("teams") },
  ] as const;

  return (
    <div className="w-full max-w-sm">
      {/* Tab list */}
      <div
        role="tablist"
        aria-label={t("title")}
        className="flex rounded-2xl bg-indigo-900 p-1 mb-6"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setActiveTab("teams");
          if (e.key === "ArrowLeft") setActiveTab("individual");
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "flex-1 rounded-xl py-2 text-sm font-bold transition-all",
              FOCUS_RING,
              activeTab === tab.id
                ? "bg-yellow-400 text-indigo-950"
                : "text-indigo-300 hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div
        role="tabpanel"
        id="panel-individual"
        aria-labelledby="tab-individual"
        hidden={activeTab !== "individual"}
      >
        <RankTable rows={players} emptyMsg={t("empty")} />
      </div>
      <div
        role="tabpanel"
        id="panel-teams"
        aria-labelledby="tab-teams"
        hidden={activeTab !== "teams"}
      >
        <RankTable rows={teams} emptyMsg={t("empty")} />
      </div>
    </div>
  );
}
