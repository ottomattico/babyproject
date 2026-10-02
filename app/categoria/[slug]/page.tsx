import { getProducts, getCategories } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";
import StoreFilter from "@/app/components/StoreFilter";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ store?: string }>;
}) {
  const { slug } = await params;
  const { store } = await searchParams;

  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(slug),
  ]);

  const cat = categories.find((c) => c.id === slug);
  if (!cat) notFound();

  const products = store ? allProducts.filter((p) => p.store === store) : allProducts;
  const stores = [...new Set(allProducts.map((p) => p.store))].sort();

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{cat.label}</h2>
        <p className="text-gray-500 mt-1">
          {allProducts.length > 0
            ? `${products.length} productos · ${stores.length} ${stores.length === 1 ? "tienda" : "tiendas"}`
            : "Sin productos en esta categoría todavía"}
        </p>
      </div>

      {stores.length > 1 && (
        <Suspense>
          <StoreFilter stores={stores} />
        </Suspense>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
