"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  productStore: string;
}

export default function AddToListButton({ productId, productStore }: Props) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Preload user + lists on mount so the dropdown opens instantly
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setReady(true); return; }
      setLoggedIn(true);
      const [{ data: userLists }, { data: existing }] = await Promise.all([
        supabase.from("lists").select("id, name").eq("user_id", data.user.id).order("created_at", { ascending: false }),
        supabase.from("list_items").select("list_id").eq("product_id", productId).eq("product_store", productStore),
      ]);
      setLists(userLists ?? []);
      setAdded(new Set(existing?.map((e) => e.list_id) ?? []));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleOpen() {
    if (!loggedIn) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      return;
    }
    setOpen(true);
  }

  async function toggle(listId: string) {
    if (added.has(listId)) {
      await supabase
        .from("list_items")
        .delete()
        .eq("list_id", listId)
        .eq("product_id", productId)
        .eq("product_store", productStore);
      setAdded((prev) => { const s = new Set(prev); s.delete(listId); return s; });
    } else {
      await supabase.from("list_items").insert({
        list_id: listId,
        product_id: productId,
        product_store: productStore,
      });
      setAdded((prev) => new Set([...prev, listId]));
    }
    router.refresh();
  }

  return (
    <div ref={ref} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        onClick={handleOpen}
        title="Agregar a lista"
        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white border border-[#E2EDE8] hover:border-[#72C5A2] transition-all shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-colors ${added.size > 0 ? "fill-[#E87A5C]" : "fill-[#8E9FA0]"}`}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 bg-white border border-[#E2EDE8] rounded-2xl shadow-lg p-3 min-w-[180px]">
          {lists.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-xs text-[#8E9FA0] mb-2">No tenés listas aún</p>
              <a
                href="/mis-listas"
                className="text-xs font-semibold text-[#72C5A2] hover:underline"
              >
                Crear una lista
              </a>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-extrabold text-[#8E9FA0] uppercase tracking-widest mb-2">Agregar a lista</p>
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => toggle(list.id)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                    added.has(list.id)
                      ? "text-[#72C5A2] font-semibold"
                      : "text-[#1A1A1A] hover:bg-[#F0FAF5]"
                  }`}
                >
                  <span className="text-base">{added.has(list.id) ? "✓" : "+"}</span>
                  {list.name}
                </button>
              ))}
              <a
                href="/mis-listas"
                className="block text-xs text-[#8E9FA0] hover:text-[#72C5A2] mt-2 pt-2 border-t border-[#E2EDE8] transition-colors"
              >
                Gestionar listas →
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
