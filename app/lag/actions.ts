"use server";

import { createTeam, findTeamByJoinCode } from "@/lib/db/teams";
import { createPlayer } from "@/lib/db/players";
import { generateJoinCode } from "@/lib/join-code";
import { redirect } from "next/navigation";

export type CreateTeamState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; teamId: string; joinCode: string; teamName: string };

export type JoinTeamState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: "name" | "joinCode" };

export async function createTeamAction(
  _prevState: CreateTeamState,
  formData: FormData
): Promise<CreateTeamState> {
  const name = ((formData.get("name") as string | null) ?? "").trim();

  if (!name) {
    return { status: "error", message: "Du måste ange ett namn för laget." };
  }

  try {
    const team = await createTeam(name, generateJoinCode());
    return {
      status: "success",
      teamId: team.id,
      joinCode: team.join_code,
      teamName: team.name,
    };
  } catch {
    return { status: "error", message: "Något gick fel. Försök igen!" };
  }
}

export async function joinTeamAction(
  _prevState: JoinTeamState,
  formData: FormData
): Promise<JoinTeamState> {
  const name = ((formData.get("name") as string | null) ?? "").trim();
  const joinCode = ((formData.get("joinCode") as string | null) ?? "")
    .trim()
    .toUpperCase();

  if (!name) {
    return { status: "error", message: "Du måste ange ett namn.", field: "name" };
  }
  if (!joinCode) {
    return {
      status: "error",
      message: "Du måste ange lagets kod.",
      field: "joinCode",
    };
  }

  let teamId: string;
  try {
    const team = await findTeamByJoinCode(joinCode);
    if (!team) {
      return {
        status: "error",
        message: "Den koden finns inte. Kolla med den som skapade laget!",
        field: "joinCode",
      };
    }
    teamId = team.id;
  } catch {
    return { status: "error", message: "Något gick fel. Försök igen!" };
  }

  let playerId: string;
  try {
    const player = await createPlayer(name, teamId);
    playerId = player.id;
  } catch {
    return { status: "error", message: "Något gick fel. Försök igen!" };
  }

  redirect(`/spela?playerId=${playerId}&teamId=${teamId}`);
}
