"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function DeleteListButton({ listId }: { listId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("¿Borrar esta lista?")) return;
    await supabase.from("lists").delete().eq("id", listId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-[#E87A5C] hover:opacity-70 transition-opacity"
    >
      Borrar
    </button>
  );
}
