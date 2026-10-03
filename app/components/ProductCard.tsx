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

  const discountPercent = hasDiscount
    ? Math.round((1 - product.price! / product.original_price!) * 100)
    : null;

  const priceDisplay = formatPrice(product.price, product.currency);
  const originalDisplay = hasDiscount ? formatPrice(product.original_price, product.currency) : null;

  return (
    <a
      href={product.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.image_alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            ?
          </div>
        )}
        {discountPercent && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{product.store}</p>
        <h2 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </h2>

        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {priceDisplay || product.price_text}
          </span>
          {originalDisplay && (
            <span className="text-sm text-gray-400 line-through">{originalDisplay}</span>
          )}
        </div>

        {product.card_bank && product.card_price && (
          <div className="mt-2 flex items-center gap-1.5 bg-blue-50 rounded-lg px-2 py-1">
            <span className="text-xs text-blue-700 font-medium">
              {product.card_bank} {product.card_discount_pct}%
            </span>
            <span className="text-xs text-blue-900 font-bold">
              {formatPrice(product.card_price, product.currency)}
            </span>
          </div>
        )}

        <p className="text-xs text-gray-300 mt-1">
          * Actualizado el{" "}
          {new Date(product.scraped_at).toLocaleDateString("es-UY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </a>
  );
}
