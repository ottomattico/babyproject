import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ClaimButton from "./ClaimButton";
import RemoveItemButton from "./RemoveItemButton";

export default async function ListaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!list) notFound();

  const isOwner = user?.id === list.user_id;

  const { data: rawItems } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", list.id)
    .order("created_at", { ascending: true });

  // Fetch product details for each item
  const items = await Promise.all(
    (rawItems ?? []).map(async (item) => {
      const { data: product } = await supabase
        .from("products")
        .select("name, image_url, price, price_text, currency, store, product_url")
        .eq("id", item.product_id)
        .eq("store", item.product_store)
        .single();
      return { ...item, product };
    })
  );

  const claimed = items.filter((i) => i.claimed_by);
  const pending = items.filter((i) => !i.claimed_by);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A]">{list.name}</h1>
        {list.baby_name && (
          <p className="text-sm text-[#8E9FA0] mt-1">Lista de regalos para {list.baby_name}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-sm text-[#8E9FA0]">
            {pending.length} pendientes · {claimed.length} elegidos
          </span>
          <button
            onClick={() => {}}
            className="text-xs text-[#72C5A2] font-semibold border border-[#72C5A2] rounded-full px-3 py-1 hover:bg-[#72C5A2] hover:text-white transition-colors"
            id="copy-btn"
          >
            Compartir link
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-[#8E9FA0] text-sm">La lista está vacía todavía.</p>
      )}

      {pending.length > 0 && (
        <div className="flex flex-col gap-3 mb-8">
          <h2 className="text-xs font-extrabold text-[#8E9FA0] uppercase tracking-widest">Pendientes</h2>
          {pending.map((item) => (
            <ListItem key={item.id} item={item} isOwner={isOwner} />
          ))}
        </div>
      )}

      {claimed.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-extrabold text-[#8E9FA0] uppercase tracking-widest">Ya elegidos</h2>
          {claimed.map((item) => (
            <ListItem key={item.id} item={item} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListItem({ item, isOwner }: { item: any; isOwner: boolean }) {
  const product = item.products;
  const isClaimed = !!item.claimed_by;

  return (
    <div className={`flex items-center gap-4 border rounded-2xl px-4 py-3 transition-colors ${isClaimed ? "border-[#E2EDE8] opacity-60" : "border-[#E2EDE8] hover:border-[#72C5A2]"}`}>
      {product?.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image_url}
          alt={product?.name ?? ""}
          className="w-16 h-16 object-cover rounded-xl bg-[#EFECE5] shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <a
          href={product?.product_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sm text-[#1A1A1A] hover:text-[#72C5A2] line-clamp-2 transition-colors"
        >
          {product?.name ?? item.product_id}
        </a>
        <p className="text-xs text-[#8E9FA0] mt-0.5">{product?.store}</p>
        <p className="text-sm font-bold text-[#1A1A1A] mt-1">{product?.price_text}</p>
        {isClaimed && (
          <p className="text-xs text-[#72C5A2] font-semibold mt-1">Elegido por {item.claimed_by}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {!isClaimed && !isOwner && (
          <ClaimButton itemId={item.id} />
        )}
        {isOwner && (
          <RemoveItemButton itemId={item.id} />
        )}
      </div>
    </div>
  );
}
