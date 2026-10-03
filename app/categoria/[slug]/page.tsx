import { getProducts, getCategories } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";
import StoreFilter from "@/app/components/StoreFilter";
import SortFilter from "@/app/components/SortFilter";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ store?: string; orden?: string }>;
}) {
  const { slug } = await params;
  const { store, orden } = await searchParams;

  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(slug),
  ]);

  const cat = categories.find((c) => c.id === slug);
  if (!cat) notFound();

  let products = store ? allProducts.filter((p) => p.store === store) : allProducts;
  const stores = [...new Set(allProducts.map((p) => p.store))].sort();

  if (orden === "precio-asc") {
    products = [...products].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (orden === "precio-desc") {
    products = [...products].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  }

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

      <Suspense>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {stores.length > 1 && <StoreFilter stores={stores} />}
          <SortFilter />
        </div>
      </Suspense>

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
