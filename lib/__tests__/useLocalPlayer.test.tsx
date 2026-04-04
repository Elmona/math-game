import { renderHook, act } from "@testing-library/react";
import { useLocalPlayer } from "@/lib/hooks/useLocalPlayer";

const KEY = "mathgame_player";

beforeEach(() => localStorage.clear());

describe("useLocalPlayer", () => {
  it("returns null initially (SSR-safe)", () => {
    const { result } = renderHook(() => useLocalPlayer());
    expect(result.current.player).toBeNull();
  });

  it("reads stored player from localStorage after mount", async () => {
    const data = { playerId: "p1", playerName: "Erik" };
    localStorage.setItem(KEY, JSON.stringify(data));

    const { result } = renderHook(() => useLocalPlayer());
    await act(async () => {});
    expect(result.current.player).toEqual(data);
  });

  it("savePlayer writes to localStorage and updates state", () => {
    const { result } = renderHook(() => useLocalPlayer());
    const data = { playerId: "p2", playerName: "Maja" };

    act(() => result.current.savePlayer(data));

    expect(result.current.player).toEqual(data);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(data);
  });

  it("clearPlayer removes from localStorage and resets state", () => {
    const { result } = renderHook(() => useLocalPlayer());
    const data = { playerId: "p3", playerName: "Lina" };

    act(() => result.current.savePlayer(data));
    act(() => result.current.clearPlayer());

    expect(result.current.player).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("handles corrupt localStorage gracefully", async () => {
    localStorage.setItem(KEY, "not-valid-json{{{");
    const { result } = renderHook(() => useLocalPlayer());
    await act(async () => {});
    expect(result.current.player).toBeNull();
  });
});
