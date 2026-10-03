"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function RemoveItemButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleRemove() {
    await supabase.from("list_items").delete().eq("id", itemId);
    router.refresh();
  }

  return (
    <button
      onClick={handleRemove}
      className="text-xs text-[#E87A5C] hover:opacity-70 transition-opacity"
    >
      Quitar
    </button>
  );
}
