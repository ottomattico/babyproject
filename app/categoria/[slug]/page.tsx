import { getProducts, getCategories, toPesos } from "@/lib/products";
import Link from "next/link";
import { getUsdToUyu } from "@/lib/exchange";
import ProductCard from "@/app/components/ProductCard";
import StoreFilter from "@/app/components/StoreFilter";
import BankFilter from "@/app/components/BankFilter";
import SortFilter from "@/app/components/SortFilter";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ store?: string; orden?: string; banco?: string }>;
}) {
  const { slug } = await params;
  const { store, orden, banco } = await searchParams;

  const [categories, usdRate] = await Promise.all([getCategories(), getUsdToUyu()]);
  const allProducts = await getProducts(slug, categories);

  const cat = categories.find((c) => c.id === slug);
  if (!cat) notFound();

  // Sub-categorías propias, o hermanas si somos un hijo
  const subCategories = categories.filter((c) => c.parent_id === slug);
  const sidebarParent = subCategories.length > 0 ? cat : categories.find((c) => c.id === cat.parent_id);
  const sidebarItems = sidebarParent
    ? categories.filter((c) => c.parent_id === sidebarParent.id)
    : [];

  let products = allProducts;
  if (store) products = products.filter((p) => p.store === store);
  if (banco) products = products.filter((p) => p.card_bank === banco);

  const stores = [...new Set(allProducts.map((p) => p.store))].sort();
  const banks = [...new Set(allProducts.map((p) => p.card_bank).filter(Boolean))].sort() as string[];

  if (orden === "precio-asc") {
    products = [...products].sort((a, b) => toPesos(a.price, a.currency, usdRate) - toPesos(b.price, b.currency, usdRate));
  } else if (orden === "precio-desc") {
    products = [...products].sort((a, b) => toPesos(b.price, b.currency, usdRate) - toPesos(a.price, a.currency, usdRate));
  }

  return (
    <div className="flex gap-8">
      {/* Sidebar subcategorías */}
      {sidebarItems.length > 0 && (
        <aside className="hidden md:block w-44 shrink-0">
          <div className="sticky top-32 pt-2">
            <p className="text-[11px] font-extrabold text-[#8E9FA0] uppercase tracking-widest mb-3">
              {sidebarParent?.label}
            </p>
            <ul className="flex flex-col gap-1">
              {sidebarItems.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/categoria/${sub.id}`}
                    className={`block text-sm font-semibold py-1 transition-colors ${
                      sub.id === slug
                        ? "text-[#72C5A2]"
                        : "text-[#1A1A1A] hover:text-[#72C5A2]"
                    }`}
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0">
      <div className="mb-8 pt-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A]">{cat.label}</h1>
        <p className="text-sm text-[#8E9FA0] font-medium mt-1.5">
          {allProducts.length > 0
            ? `${products.length} productos · ${stores.length} ${stores.length === 1 ? "tienda" : "tiendas"}`
            : "Sin productos en esta categoría todavía"}
        </p>
      </div>

      <Suspense>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 pb-6 border-b border-[#E2EDE8]">
          {stores.length > 1 && <StoreFilter stores={stores} />}
          {banks.length > 0 && (
            <>
              <span className="text-[#E2EDE8] font-bold">|</span>
              <BankFilter banks={banks} />
            </>
          )}
          <span className="text-[#E2EDE8] font-bold">|</span>
          <SortFilter />
        </div>
      </Suspense>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-12">
          {products.map((product) => (
            <ProductCard key={`${product.store}-${product.id}`} product={product} usdRate={usdRate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🍼</p>
          <p className="text-lg font-medium">Sin productos todavía</p>
        </div>
      )}
      </div>
    </div>
  );
}
