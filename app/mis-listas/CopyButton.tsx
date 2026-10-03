"use client";

import { useState } from "react";

export default function CopyButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(`${location.origin}/lista/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className={`text-xs font-semibold border rounded-full px-3 py-1 transition-all ${
        copied
          ? "bg-[#72C5A2] border-[#72C5A2] text-white"
          : "text-[#72C5A2] border-[#72C5A2] hover:bg-[#72C5A2] hover:text-white"
      }`}
    >
      {copied ? "¡Copiado!" : "Compartir link"}
    </button>
  );
}
