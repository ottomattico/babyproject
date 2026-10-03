import type { Metadata } from "next";
import "./globals.css";
import { getCategories, buildTree, Category } from "@/lib/products";
import TopNav from "./components/TopNav";

export const metadata: Metadata = {
  title: "Mini Klub — Compará precios de artículos de bebé en Uruguay",
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
        <header className="sticky top-0 z-10 bg-[#FAFAF7]">
          <div className="border-b border-[#E4E0D8]">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
              <a href="/" className="text-xl font-bold tracking-tight">
                mini<span className="text-[#FF4D2E]">klub</span>
              </a>
              <p className="text-sm text-[#6B6B6B] hidden sm:block">
                Compará precios en Uruguay
              </p>
            </div>
          </div>
          <TopNav tree={tree} />
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
