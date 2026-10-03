import { Product } from "@/lib/products";

function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) return "";
  if (currency === "USD") {
    return `U$S ${amount.toLocaleString("es-UY")}`;
  }
  return `$ ${amount.toLocaleString("es-UY")}`;
}

function formatPesos(amount: number | null, currency: string, usdRate: number): string | null {
  if (amount === null || currency !== "USD") return null;
  return `aprox. $ ${Math.round(amount * usdRate).toLocaleString("es-UY")}`;
}

export default function ProductCard({ product, usdRate = 43 }: { product: Product; usdRate?: number }) {
  const hasDiscount =
    product.original_price && product.price && product.original_price > product.price;

  const discountPct = hasDiscount
    ? Math.round((1 - product.price! / product.original_price!) * 100)
    : null;

  const priceDisplay = formatPrice(product.price, product.currency);
  const pesosDisplay = formatPesos(product.price, product.currency, usdRate);
  const originalDisplay = hasDiscount ? formatPrice(product.original_price, product.currency) : null;
  const cardPriceDisplay = product.card_bank && product.card_price
    ? formatPrice(product.card_price, product.currency)
    : null;

  const cardDiscountPct = product.card_discount_pct ??
    (product.card_price && product.price
      ? Math.round((1 - product.card_price / product.price) * 100)
      : null);

  return (
    <a
      href={product.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#EFECE5]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.image_alt}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#C0BAB0] text-2xl">
            —
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 flex flex-col gap-1">
        <span className="inline-block text-[10px] font-bold text-[#72C5A2] uppercase tracking-[0.1em] bg-[#F0FAF5] px-2 py-0.5 rounded-full w-fit">
          {product.store}
        </span>

        <h2 className="text-[13px] text-[#1A1A1A] line-clamp-2 leading-[1.4]">
          {product.name}
        </h2>

        <div className="mt-1.5 flex flex-col gap-0.5">
          {/* Price row */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-[#1A1A1A]">
              {priceDisplay || product.price_text}
            </span>
            {originalDisplay && (
              <span className="text-[11px] text-[#B8B0A4] line-through">{originalDisplay}</span>
            )}
            {discountPct && (
              <span className="text-[11px] font-semibold text-[#E87A5C]">−{discountPct}%</span>
            )}
          </div>

          {/* Bank price row */}
          {cardPriceDisplay && (
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/banks/${product.card_bank?.toLowerCase()}.png`}
                alt={product.card_bank ?? ""}
                className="h-3 object-contain opacity-70"
              />
              <span className="text-[11px] font-semibold text-[#E87A5C]">{cardPriceDisplay}</span>
              {cardDiscountPct && (
                <span className="text-[11px] font-semibold text-[#E87A5C]">−{cardDiscountPct}%</span>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
