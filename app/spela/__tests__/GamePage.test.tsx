import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import GamePage from "../GamePage";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocalPlayer } from "@/lib/hooks/useLocalPlayer";
import { generateRound } from "@/lib/question";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

jest.mock("@/lib/hooks/useLocalPlayer", () => ({
  useLocalPlayer: jest.fn(),
}));

jest.mock("@/lib/question", () => ({
  generateRound: jest.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockSavePlayer = jest.fn();
const mockClearPlayer = jest.fn();

// Questions where answer === a * 2 for easy test arithmetic
function makeQuestions(n = 20) {
  return Array.from({ length: n }, (_, i) => ({
    a: i + 1,
    b: 2,
    answer: (i + 1) * 2,
  }));
}

function setupMocks({
  playerId = null,
  storedPlayer = null,
}: {
  playerId?: string | null;
  storedPlayer?: { playerId: string; playerName: string } | null;
} = {}) {
  (useSearchParams as jest.Mock).mockReturnValue({
    get: (k: string) => (k === "playerId" ? playerId : null),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useTranslations as jest.Mock).mockReturnValue(
    (key: string, opts?: Record<string, unknown>) => {
      if (key === "question") return `${opts?.a} × ${opts?.b}`;
      if (key === "reveal") return `Svaret var ${opts?.answer}`;
      return key;
    }
  );
  (useLocalPlayer as jest.Mock).mockReturnValue({
    player: storedPlayer,
    savePlayer: mockSavePlayer,
    clearPlayer: mockClearPlayer,
  });
  (generateRound as jest.Mock).mockReturnValue(makeQuestions());
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ id: "session-1", score: 100 }),
  });
}

// ── Setup / teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// ── Name entry phase ───────────────────────────────────────────────────────

describe("name entry phase", () => {
  beforeEach(() => setupMocks());

  it("renders name form when no player is stored", () => {
    render(<GamePage />);
    expect(screen.getByText("Vad heter du?")).toBeInTheDocument();
    expect(screen.getByLabelText("Ditt namn")).toBeInTheDocument();
  });

  it("shows validation error on empty submit", async () => {
    render(<GamePage />);
    fireEvent.submit(screen.getByLabelText("Ditt namn").closest("form")!);
    await act(async () => {});
    expect(screen.getByRole("alert")).toHaveTextContent("Du måste ange ett namn");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits name, calls POST /api/players, and transitions to playing", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ id: "player-123", name: "Erik", teamId: null }),
    });
    render(<GamePage />);

    fireEvent.change(screen.getByLabelText("Ditt namn"), {
      target: { value: "Erik" },
    });
    fireEvent.submit(screen.getByLabelText("Ditt namn").closest("form")!);

    await act(async () => {});

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/players",
      expect.objectContaining({ method: "POST" })
    );
    expect(mockSavePlayer).toHaveBeenCalledWith(
      expect.objectContaining({ playerName: "Erik" })
    );
    // Should show the game board (first question)
    await waitFor(() =>
      expect(screen.getByText("1 × 2")).toBeInTheDocument()
    );
  });
});

// ── Playing phase ──────────────────────────────────────────────────────────

describe("playing phase (playerId in URL)", () => {
  beforeEach(() => setupMocks({ playerId: "player-123" }));

  it("shows the first question after questions load", async () => {
    render(<GamePage />);
    await act(async () => {});
    expect(screen.getByText("1 × 2")).toBeInTheDocument();
  });

  it("numpad digit click updates the capture input value", async () => {
    render(<GamePage />);
    await act(async () => {});

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Siffra 2" }));
    });

    const input = document.getElementById("capture-input") as HTMLInputElement;
    expect(input.value).toBe("2");
  });

  it("numpad delete removes the last digit", async () => {
    render(<GamePage />);
    await act(async () => {});

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Siffra 2" }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Radera" }));
    });

    const input = document.getElementById("capture-input") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("correct answer via numpad confirm advances to next question", async () => {
    render(<GamePage />);
    await act(async () => {}); // flush generateRound

    // q[0]: 1 × 2 = 2
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Siffra 2" }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Svara" }));
    });

    // q[1]: 2 × 2 should be visible (current advances immediately on correct)
    expect(screen.getByText("2 × 2")).toBeInTheDocument();
  });

  it("correct answer via keyboard (Enter) advances to next question", async () => {
    render(<GamePage />);
    await act(async () => {});

    const input = document.getElementById("capture-input") as HTMLInputElement;

    // Set answer then submit in the same act so the closure picks up the state
    await act(async () => {
      fireEvent.change(input, { target: { value: "2" } });
    });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(screen.getByText("2 × 2")).toBeInTheDocument();
  });

  it("wrong answer shows wrong feedback", async () => {
    render(<GamePage />);
    await act(async () => {});

    const input = document.getElementById("capture-input") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: "99" } });
    });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(screen.getByRole("alert")).toHaveTextContent("wrong");
  });

  it("3 wrong answers shows reveal feedback with the correct answer", async () => {
    render(<GamePage />);
    await act(async () => {});

    const input = document.getElementById("capture-input") as HTMLInputElement;

    for (let i = 0; i < 3; i++) {
      // Clear any previous wrong feedback before next attempt
      if (i > 0) {
        await act(async () => { jest.advanceTimersByTime(700); });
      }
      await act(async () => {
        fireEvent.change(input, { target: { value: "99" } });
      });
      await act(async () => {
        fireEvent.keyDown(input, { key: "Enter" });
      });
    }

    expect(screen.getByRole("alert")).toHaveTextContent("Svaret var 2");
  });

  it("numpad buttons are disabled during wrong feedback", async () => {
    render(<GamePage />);
    await act(async () => {});

    const input = document.getElementById("capture-input") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: "99" } });
    });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    // All digit buttons should be disabled during "wrong" feedback
    const digit1 = screen.getByRole("button", { name: "Siffra 1" });
    expect(digit1).toBeDisabled();
  });

  it("timer expiry submits session and navigates to results", async () => {
    render(<GamePage />);
    await act(async () => {}); // flush generateRound

    // Advance past the 120s round time
    await act(async () => { jest.advanceTimersByTime(121_000); });
    // Let the fetch promise resolve
    await act(async () => {});

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({ method: "POST" })
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/spela/resultat")
    );
  });
});
