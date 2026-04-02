import { createTeam } from "@/lib/db/teams";
import { generateJoinCode } from "@/lib/join-code";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name =
    body && typeof body === "object" && "name" in body
      ? String((body as { name: unknown }).name ?? "").trim()
      : "";

  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const team = await createTeam(name, generateJoinCode());
    return Response.json(
      { id: team.id, name: team.name, joinCode: team.join_code, createdAt: team.created_at },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
