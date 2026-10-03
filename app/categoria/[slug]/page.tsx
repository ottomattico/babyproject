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

  const categories = await getCategories();
  const allProducts = await getProducts(slug, categories);

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
      <div className="mb-8 pt-2">
        <h1 className="text-3xl font-medium tracking-tight text-[#1A1A1A]">{cat.label}</h1>
        <p className="text-sm text-[#B8B0A4] mt-1.5 tracking-wide">
          {allProducts.length > 0
            ? `${products.length} productos · ${stores.length} ${stores.length === 1 ? "tienda" : "tiendas"}`
            : "Sin productos en esta categoría todavía"}
        </p>
      </div>

      <Suspense>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 pb-6 border-b border-[#E8E4DC]">
          {stores.length > 1 && <StoreFilter stores={stores} />}
          <SortFilter />
        </div>
      </Suspense>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
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
