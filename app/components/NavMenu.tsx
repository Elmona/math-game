"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocalPlayer } from "@/lib/hooks/useLocalPlayer";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

const NAV_LINK =
  `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold text-white hover:bg-indigo-800 active:scale-95 transition-all min-h-[44px] ${FOCUS_RING}`;

interface NavMenuProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NavMenu({ id, isOpen, onClose, triggerRef }: NavMenuProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const { player, clearPlayer } = useLocalPlayer();
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  // Focus first item when opened; restore trigger focus when closed
  useEffect(() => {
    if (isOpen) {
      firstItemRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        aria-hidden="true"
        onClick={() => { onClose(); triggerRef.current?.focus(); }}
      />

      {/* Panel */}
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className="fixed top-14 right-0 left-0 z-50 bg-indigo-950 border-b border-indigo-800 px-4 py-4 flex flex-col gap-1 sm:left-auto sm:right-4 sm:w-72 sm:rounded-2xl sm:top-16 sm:border sm:shadow-2xl"
      >
        <Link ref={firstItemRef} href="/spela" onClick={onClose} className={NAV_LINK}>
          <span aria-hidden="true">🎮</span> {t("play")}
        </Link>
        <Link href="/lag" onClick={onClose} className={NAV_LINK}>
          <span aria-hidden="true">👥</span> {t("teams")}
        </Link>
        <Link href="/topplista" onClick={onClose} className={NAV_LINK}>
          <span aria-hidden="true">🏆</span> {t("leaderboard")}
        </Link>

        {player && (
          <>
            <div className="my-2 border-t border-indigo-700" />
            <div className="px-4 py-2 text-sm text-indigo-400">
              {t("playingAs")}{" "}
              <span className="font-bold text-white">{player.playerName}</span>
              {player.teamName && (
                <span className="text-indigo-300"> · {player.teamName}</span>
              )}
            </div>
            <button
              onClick={() => { clearPlayer(); onClose(); router.push("/spela"); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold text-yellow-400 hover:bg-indigo-800 active:scale-95 transition-all min-h-[44px] w-full text-left ${FOCUS_RING}`}
            >
              <span aria-hidden="true">✏️</span> {t("changeName")}
            </button>
            <button
              onClick={() => { clearPlayer(); onClose(); router.push("/lag"); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold text-yellow-400 hover:bg-indigo-800 active:scale-95 transition-all min-h-[44px] w-full text-left ${FOCUS_RING}`}
            >
              <span aria-hidden="true">👥</span> {t("changeTeam")}
            </button>
          </>
        )}
      </div>
    </>
  );
}
