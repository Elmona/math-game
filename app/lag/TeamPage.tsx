"use client";

import { useActionState, useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  createTeamAction,
  joinTeamAction,
  type CreateTeamState,
  type JoinTeamState,
} from "./actions";
import CopyButton from "./CopyButton";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-indigo-600 bg-indigo-900 px-4 py-3 text-white text-lg placeholder:text-indigo-400 focus:border-yellow-400 focus:outline-none";

const BTN_PRIMARY =
  `w-full rounded-2xl bg-yellow-400 px-6 py-4 text-xl font-bold text-indigo-950 min-h-[44px] hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING}`;

const BTN_SECONDARY =
  `w-full rounded-2xl bg-indigo-700 px-6 py-4 text-xl font-bold text-white min-h-[44px] hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING}`;

type Tab = "create" | "join";

export default function TeamPage() {
  const t = useTranslations("team");

  const [activeTab, setActiveTab] = useState<Tab>("create");
  const createPanelId = useId();
  const joinPanelId = useId();
  const createTabId = useId();
  const joinTabId = useId();

  const [createState, createAction, createPending] = useActionState<
    CreateTeamState,
    FormData
  >(createTeamAction, { status: "idle" });

  const [joinState, joinAction, joinPending] = useActionState<
    JoinTeamState,
    FormData
  >(joinTeamAction, { status: "idle" });

  function handleTabKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    current: Tab
  ) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveTab(current === "create" ? "join" : "create");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 bg-indigo-950 text-white">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-3xl font-black text-center tracking-tight">
          {activeTab === "create" ? t("createTitle") : t("joinTitle")}
        </h1>

        {/* Tab list */}
        <div role="tablist" aria-label="Välj läge" className="flex rounded-2xl bg-indigo-900 p-1 gap-1">
          <button
            role="tab"
            id={createTabId}
            aria-selected={activeTab === "create"}
            aria-controls={createPanelId}
            onClick={() => setActiveTab("create")}
            onKeyDown={(e) => handleTabKeyDown(e, "create")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors min-h-[44px] ${FOCUS_RING} ${
              activeTab === "create"
                ? "bg-yellow-400 text-indigo-950"
                : "text-indigo-300 hover:text-white"
            }`}
          >
            {t("createTitle")}
          </button>
          <button
            role="tab"
            id={joinTabId}
            aria-selected={activeTab === "join"}
            aria-controls={joinPanelId}
            onClick={() => setActiveTab("join")}
            onKeyDown={(e) => handleTabKeyDown(e, "join")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors min-h-[44px] ${FOCUS_RING} ${
              activeTab === "join"
                ? "bg-yellow-400 text-indigo-950"
                : "text-indigo-300 hover:text-white"
            }`}
          >
            {t("joinTitle")}
          </button>
        </div>

        {/* Create team panel */}
        <div
          role="tabpanel"
          id={createPanelId}
          aria-labelledby={createTabId}
          hidden={activeTab !== "create"}
        >
          {createState.status === "success" ? (
            <div className="flex flex-col gap-6 text-center">
              <p className="text-indigo-200">{t("shareCode")}</p>
              <output
                aria-label="Lagets kod"
                className="text-5xl font-mono font-black tracking-widest text-yellow-400"
              >
                {createState.joinCode}
              </output>
              <CopyButton code={createState.joinCode} />

              <div className="border-t border-indigo-700 pt-6">
                <p className="text-indigo-200 mb-4">Vill du spela själv?</p>
                <form action={joinAction} className="flex flex-col gap-4">
                  <input type="hidden" name="joinCode" value={createState.joinCode} />
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="create-success-name" className="text-sm font-semibold text-indigo-200">
                      {t("yourName")}
                    </label>
                    <input
                      id="create-success-name"
                      name="name"
                      type="text"
                      autoComplete="nickname"
                      className={INPUT_CLASS}
                      aria-describedby={joinState.status === "error" ? "join-error" : undefined}
                    />
                  </div>
                  {joinState.status === "error" && (
                    <p id="join-error" role="alert" className="text-red-400 text-sm">
                      {joinState.message}
                    </p>
                  )}
                  <button type="submit" disabled={joinPending} className={BTN_PRIMARY}>
                    {joinPending ? "Går med…" : t("joinButton")}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <form action={createAction} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="team-name" className="text-sm font-semibold text-indigo-200">
                  {t("teamName")}
                </label>
                <input
                  id="team-name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  className={INPUT_CLASS}
                  aria-describedby={createState.status === "error" ? "create-error" : undefined}
                />
              </div>
              {createState.status === "error" && (
                <p id="create-error" role="alert" className="text-red-400 text-sm">
                  {createState.message}
                </p>
              )}
              <button type="submit" disabled={createPending} className={BTN_PRIMARY}>
                {createPending ? "Skapar…" : t("createButton")}
              </button>
            </form>
          )}
        </div>

        {/* Join team panel */}
        <div
          role="tabpanel"
          id={joinPanelId}
          aria-labelledby={joinTabId}
          hidden={activeTab !== "join"}
        >
          <form action={joinAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="player-name" className="text-sm font-semibold text-indigo-200">
                {t("yourName")}
              </label>
              <input
                id="player-name"
                name="name"
                type="text"
                autoComplete="nickname"
                className={INPUT_CLASS}
                aria-describedby={
                  joinState.status === "error" && joinState.field === "name"
                    ? "join-name-error"
                    : undefined
                }
              />
              {joinState.status === "error" && joinState.field === "name" && (
                <p id="join-name-error" role="alert" className="text-red-400 text-sm">
                  {joinState.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="join-code" className="text-sm font-semibold text-indigo-200">
                {t("joinCode")}
              </label>
              <input
                id="join-code"
                name="joinCode"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                maxLength={6}
                className={`${INPUT_CLASS} uppercase tracking-widest`}
                aria-describedby={
                  joinState.status === "error" && joinState.field !== "name"
                    ? "join-code-error"
                    : undefined
                }
              />
              {joinState.status === "error" && joinState.field !== "name" && (
                <p id="join-code-error" role="alert" className="text-red-400 text-sm">
                  {joinState.message}
                </p>
              )}
              {joinState.status === "error" && !joinState.field && (
                <p role="alert" className="text-red-400 text-sm">
                  {joinState.message}
                </p>
              )}
            </div>

            <button type="submit" disabled={joinPending} className={BTN_PRIMARY}>
              {joinPending ? "Går med…" : t("joinButton")}
            </button>
          </form>
        </div>

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
