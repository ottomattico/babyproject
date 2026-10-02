import { getProducts } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";

export default function Home() {
  const products = getProducts("cunas");

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
        {/* Category title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Cunas</h2>
          <p className="text-gray-500 mt-1">
            {products.length > 0
              ? `${products.length} productos encontrados`
              : "Ejecutá el scraper para cargar productos"}
          </p>
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🍼</p>
            <p className="text-lg font-medium">Sin productos todavía</p>
            <p className="text-sm mt-2">
              Ejecutá{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                python scraper/carestino.py
              </code>{" "}
              para cargar las cunas de Carestino
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
