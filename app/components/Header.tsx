"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import NavMenu from "./NavMenu";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950";

export default function Header() {
  const t = useTranslations("nav");
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-indigo-950 border-b border-indigo-800">
      <Link
        href="/"
        aria-label="Mattespelet – startsidan"
        className={`text-lg font-black text-yellow-400 hover:text-yellow-300 transition-colors ${FOCUS_RING} rounded`}
      >
        ✖️ Mattespelet
      </Link>

      <button
        ref={triggerRef}
        aria-label={t("menu")}
        aria-expanded={isOpen}
        aria-controls="main-nav"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex flex-col justify-center items-center gap-[5px] min-h-[44px] min-w-[44px] rounded-xl hover:bg-indigo-800 transition-colors ${FOCUS_RING}`}
      >
        <span className="block w-5 h-0.5 bg-white rounded-full" />
        <span className="block w-5 h-0.5 bg-white rounded-full" />
        <span className="block w-5 h-0.5 bg-white rounded-full" />
      </button>

      <NavMenu
        id="main-nav"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      />
    </header>
  );
}
