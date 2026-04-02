import { NextResponse } from "next/server";
import { getTopPlayers, getTopTeams } from "@/lib/db/leaderboard";

export async function GET() {
  try {
    const [players, teams] = await Promise.all([getTopPlayers(), getTopTeams()]);
    return NextResponse.json({ players, teams });
  } catch {
    return NextResponse.json({ players: [], teams: [] }, { status: 500 });
  }
}
