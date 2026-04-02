"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CopyButton({ code }: { code: string }) {
  const t = useTranslations("team");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={handleCopy}
        className="rounded-xl bg-indigo-700 px-6 py-3 text-base font-semibold text-white min-h-[44px] hover:bg-indigo-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
        aria-label={`Kopiera koden ${code}`}
      >
        {copied ? t("codeCopied") : "Kopiera kod"}
      </button>
      {/* Screen reader live announcement */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? t("codeCopied") : ""}
      </span>
    </>
  );
}
