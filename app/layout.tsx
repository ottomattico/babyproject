import type { Metadata } from "next";
import "./globals.css";
import { getCategories, buildTree, Category } from "@/lib/products";
import CategoryNav from "./components/CategoryNav";

export const metadata: Metadata = {
  title: "BebeUY — Artículos de bebé en Uruguay",
  description: "Compará precios de artículos de bebé en tiendas de Uruguay",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  const tree = buildTree(categories) as (Category & { children: (Category & { children: Category[] })[] })[];

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-gray-900">
              bebe<span className="text-rose-500">uy</span>
            </a>
            <p className="text-sm text-gray-500 hidden sm:block">
              Compará precios de artículos de bebé en Uruguay
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          <CategoryNav tree={tree} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
