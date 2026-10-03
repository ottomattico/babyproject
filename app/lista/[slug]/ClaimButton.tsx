"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function ClaimButton({ itemId }: { itemId: string }) {
  const [claiming, setClaiming] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleClaim() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await supabase
      .from("list_items")
      .update({ claimed_by: trimmed, claimed_at: new Date().toISOString() })
      .eq("id", itemId);
    router.refresh();
  }

  if (!claiming) {
    return (
      <button
        onClick={() => setClaiming(true)}
        className="text-xs font-semibold bg-[#72C5A2] text-white rounded-full px-3 py-1.5 hover:opacity-90 transition-opacity"
      >
        Lo elijo yo
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <input
        autoFocus
        type="text"
        placeholder="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleClaim()}
        className="border border-[#E2EDE8] rounded-lg px-3 py-1.5 text-xs w-32 focus:outline-none focus:border-[#72C5A2]"
      />
      <div className="flex gap-1">
        <button
          onClick={handleClaim}
          disabled={!name.trim()}
          className="text-xs font-semibold bg-[#72C5A2] text-white rounded-full px-3 py-1 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Confirmar
        </button>
        <button
          onClick={() => setClaiming(false)}
          className="text-xs text-[#8E9FA0] hover:text-[#1A1A1A] px-1 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
