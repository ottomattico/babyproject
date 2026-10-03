import { Product } from "@/lib/products";

function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) return "";
  if (currency === "USD") {
    return `U$S ${amount.toLocaleString("es-UY")}`;
  }
  return `$ ${amount.toLocaleString("es-UY")}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.original_price && product.price && product.original_price > product.price;

  const discountPct = hasDiscount
    ? Math.round((1 - product.price! / product.original_price!) * 100)
    : null;

  const priceDisplay = formatPrice(product.price, product.currency);
  const originalDisplay = hasDiscount ? formatPrice(product.original_price, product.currency) : null;
  const cardPriceDisplay = product.card_bank && product.card_price
    ? formatPrice(product.card_price, product.currency)
    : null;

  return (
    <a
      href={product.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E4E0D8] hover:border-[#FF4D2E] hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F2EC]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.image_alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-4xl">
            ?
          </div>
        )}
        {discountPct && (
          <span className="absolute top-2.5 left-2.5 bg-[#FF4D2E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
        <span className="absolute bottom-2.5 left-2.5 bg-white/90 text-[#0F0F0F] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
          {product.store}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h2 className="text-sm font-medium text-[#0F0F0F] line-clamp-2 leading-snug">
          {product.name}
        </h2>

        <div className="mt-auto pt-2 flex flex-col gap-0.5">
          {originalDisplay && (
            <span className="text-xs text-[#6B6B6B] line-through">{originalDisplay}</span>
          )}
          <span className="text-base font-bold text-[#0F0F0F]">
            {priceDisplay || product.price_text}
          </span>
          {cardPriceDisplay && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/banks/${product.card_bank?.toLowerCase()}.png`}
                alt={product.card_bank ?? ""}
                className="h-3.5 object-contain"
              />
              <span className="text-sm font-semibold text-[#FF4D2E]">{cardPriceDisplay}</span>
            </div>
          )}
        </div>

        <p className="text-[10px] text-[#C0BAB0] mt-1">
          * {new Date(product.scraped_at).toLocaleDateString("es-UY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </a>
  );
}
