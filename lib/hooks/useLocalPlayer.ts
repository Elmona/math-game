"use client";

import { useEffect, useState } from "react";

const KEY = "mathgame_player";

export interface LocalPlayer {
  playerId: string;
  playerName: string;
  teamId?: string;
  teamName?: string;
  joinCode?: string;
}

export function useLocalPlayer() {
  const [player, setPlayer] = useState<LocalPlayer | null>(null);

  // Read after mount only — avoids SSR/client hydration mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPlayer(JSON.parse(raw) as LocalPlayer);
    } catch {
      // Corrupt storage — ignore
    }
  }, []);

  function savePlayer(data: LocalPlayer) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setPlayer(data);
    } catch {
      // Storage full or unavailable — ignore
    }
  }

  function clearPlayer() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Ignore
    }
    setPlayer(null);
  }

  return { player, savePlayer, clearPlayer };
}
