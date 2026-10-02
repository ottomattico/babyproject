import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";
import StoreFilter from "@/app/components/StoreFilter";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const { store } = await searchParams;
  const all = getProducts("cunas");
  const products = store ? all.filter((p) => p.store === store) : all;
  const stores = [...new Set(all.map((p) => p.store))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            bebe<span className="text-rose-500">uy</span>
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Compará precios de artículos de bebé en Uruguay
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Cunas</h2>
          <p className="text-gray-500 mt-1">
            {products.length > 0
              ? `${products.length} productos · ${stores.length} tiendas`
              : "Ejecutá el scraper para cargar productos"}
          </p>
        </div>

        {/* Store filter */}
        {stores.length > 1 && (
          <Suspense>
            <StoreFilter stores={stores} />
          </Suspense>
        )}

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={`${product.store}-${product.id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🍼</p>
            <p className="text-lg font-medium">Sin productos todavía</p>
          </div>
        )}
      </main>
    </div>
  );
}
