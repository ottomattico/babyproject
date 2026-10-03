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

  const cardDiscountPct = product.card_discount_pct ??
    (product.card_price && product.price
      ? Math.round((1 - product.card_price / product.price) * 100)
      : null);

  return (
    <a
      href={product.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F2EC]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.image_alt}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#C0BAB0] text-3xl">
            ?
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 flex flex-col gap-0.5 flex-1">
        <span className="text-[9px] font-semibold text-[#C0BAB0] uppercase tracking-widest">
          {product.store}
        </span>
        <h2 className="text-sm text-[#0F0F0F] line-clamp-2 leading-snug mt-0.5">
          {product.name}
        </h2>

        <div className="mt-auto pt-3 flex flex-col gap-0.5">
          <span className="text-xs text-[#C0BAB0] line-through min-h-[1rem]">
            {originalDisplay ?? ""}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0F0F0F]">
              {priceDisplay || product.price_text}
            </span>
            {discountPct && (
              <span className="text-xs font-medium text-[#FF4D2E]">-{discountPct}%</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 min-h-[1.25rem]">
            {cardPriceDisplay && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/banks/${product.card_bank?.toLowerCase()}.png`}
                  alt={product.card_bank ?? ""}
                  className="h-3 object-contain"
                />
                <span className="text-xs font-medium text-[#FF4D2E]">{cardPriceDisplay}</span>
                {cardDiscountPct && (
                  <span className="text-xs font-medium text-[#FF4D2E]">-{cardDiscountPct}%</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
