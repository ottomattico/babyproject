import { getCategories, buildTree, Category } from "@/lib/products";
import Link from "next/link";

export default async function Home() {
  const categories = await getCategories();
  const tree = buildTree(categories) as (Category & { children: (Category & { children: Category[] })[] })[];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h2>
      <p className="text-gray-500 mb-8">
        Encontrá y compará artículos de bebé de las mejores tiendas de Uruguay.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tree.map((parent) => (
          <div key={parent.id} className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">{parent.label}</h3>
            <ul className="flex flex-wrap gap-2">
              {parent.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/categoria/${child.id}`}
                    className="inline-block px-3 py-1.5 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-600 text-sm rounded-lg border border-gray-100 transition-colors"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
