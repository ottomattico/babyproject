"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).slice(2, 7);
}

export default function NewListForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("lists").insert({
      user_id: user.id,
      name: name.trim(),
      baby_name: babyName.trim() || null,
      slug: generateSlug(name.trim()),
    });

    setName("");
    setBabyName("");
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-[#E2EDE8] rounded-2xl py-4 text-sm font-semibold text-[#8E9FA0] hover:border-[#72C5A2] hover:text-[#72C5A2] transition-colors"
      >
        + Nueva lista
      </button>
    );
  }

  return (
    <div className="border border-[#72C5A2] rounded-2xl p-5 flex flex-col gap-3">
      <input
        autoFocus
        type="text"
        placeholder="Nombre de la lista (ej: Lista de Sofía)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-[#E2EDE8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#72C5A2]"
      />
      <input
        type="text"
        placeholder="Nombre del bebé (opcional)"
        value={babyName}
        onChange={(e) => setBabyName(e.target.value)}
        className="w-full border border-[#E2EDE8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#72C5A2]"
      />
      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="bg-[#72C5A2] text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {loading ? "Creando..." : "Crear lista"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-[#8E9FA0] hover:text-[#1A1A1A] px-3 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
