import { findTeamByJoinCode } from "@/lib/db/teams";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ joinCode: string }> }
): Promise<Response> {
  const { joinCode } = await params;

  try {
    const team = await findTeamByJoinCode(joinCode);
    if (!team) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }
    return Response.json({
      id: team.id,
      name: team.name,
      joinCode: team.join_code,
      createdAt: team.created_at,
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
