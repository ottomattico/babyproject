import type { Metadata } from "next";
import "./globals.css";
import { getCategories, buildTree, Category } from "@/lib/products";
import CategoryNav from "./components/CategoryNav";

export const metadata: Metadata = {
  title: "bebeuy — Compará precios de artículos de bebé en Uruguay",
  description: "Compará precios de artículos de bebé en las mejores tiendas de Uruguay",
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
      <body>
        <header className="sticky top-0 z-10 border-b border-[#E4E0D8] bg-[#FAFAF7]">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              bebe<span className="text-[#FF4D2E]">uy</span>
            </a>
            <p className="text-sm text-[#6B6B6B] hidden sm:block">
              Compará precios en Uruguay
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 flex gap-10">
          <CategoryNav tree={tree} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
