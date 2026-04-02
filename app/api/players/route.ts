import { createPlayer } from "@/lib/db/players";
import { findTeamByJoinCode } from "@/lib/db/teams";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const joinCode = typeof raw.joinCode === "string" ? raw.joinCode.trim() : undefined;

  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  let teamId: string | undefined;
  if (joinCode) {
    try {
      const team = await findTeamByJoinCode(joinCode);
      if (!team) {
        return Response.json({ error: "Team not found" }, { status: 404 });
      }
      teamId = team.id;
    } catch {
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  try {
    const player = await createPlayer(name, teamId);
    return Response.json(
      { id: player.id, name: player.name, teamId: player.team_id, createdAt: player.created_at },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
