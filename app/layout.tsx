import type { Metadata } from "next";
import "./globals.css";
import { getCategories, buildTree, Category } from "@/lib/products";
import TopNav from "./components/TopNav";
import AuthButton from "./components/AuthButton";

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
        <header className="sticky top-0 z-10">
          <div className="bg-[#72C5A2]">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <a href="/">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="Mini Klub" className="h-12 w-auto" />
              </a>
              <div className="flex items-center gap-6">
                <p className="text-sm text-white/80 hidden sm:block font-semibold">
                  Lo lindo de encontrarlo todo.
                </p>
                <AuthButton />
              </div>
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
