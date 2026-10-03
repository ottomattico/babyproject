import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import NewListForm from "./NewListForm";
import DeleteListButton from "./DeleteListButton";

export default async function MisListasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: lists } = await supabase
    .from("lists")
    .select("*, list_items(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-extrabold text-[#1A1A1A] mb-2">Mis listas</h1>
      <p className="text-sm text-[#8E9FA0] mb-8">Creá listas de regalos para compartir con familia y amigos.</p>

      <NewListForm />

      {lists && lists.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {lists.map((list) => (
            <div key={list.id} className="flex items-center justify-between border border-[#E2EDE8] rounded-2xl px-5 py-4 hover:border-[#72C5A2] transition-colors">
              <div>
                <a href={`/lista/${list.slug}`} className="font-bold text-[#1A1A1A] hover:text-[#72C5A2] transition-colors">
                  {list.name}
                </a>
                {list.baby_name && (
                  <p className="text-xs text-[#8E9FA0] mt-0.5">Para {list.baby_name}</p>
                )}
                <p className="text-xs text-[#8E9FA0] mt-0.5">
                  {(list.list_items as { count: number }[])?.[0]?.count ?? 0} productos
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(`${location.origin}/lista/${list.slug}`)}
                  className="text-xs text-[#72C5A2] font-semibold border border-[#72C5A2] rounded-full px-3 py-1 hover:bg-[#72C5A2] hover:text-white transition-colors"
                >
                  Copiar link
                </button>
                <a
                  href={`/lista/${list.slug}`}
                  className="text-xs font-semibold text-[#8E9FA0] hover:text-[#1A1A1A] transition-colors"
                >
                  Ver →
                </a>
                <DeleteListButton listId={list.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#8E9FA0] text-sm mt-8">Todavía no tenés listas. ¡Creá una!</p>
      )}
    </div>
  );
}
