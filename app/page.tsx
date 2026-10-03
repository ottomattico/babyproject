import { getCategories, buildTree, Category } from "@/lib/products";
import Link from "next/link";

export default async function Home() {
  const categories = await getCategories();
  const tree = buildTree(categories) as (Category & { children: (Category & { children: Category[] })[] })[];

  return (
    <div>
      <div className="mb-12 pt-4">
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] leading-tight">
          Todo para tu bebé.<br />
          <span className="text-[#72C5A2]">Al mejor precio.</span>
        </h1>
        <p className="text-[#8E9FA0] mt-3 text-base font-medium">
          Comparamos precios en Baby City, MVD Kids, Bebesit, Carestino, Chicco y más.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tree.map((parent) => (
          <div key={parent.id} className="rounded-2xl p-5 border border-[#E2EDE8] hover:border-[#72C5A2] transition-colors">
            <h3 className="font-extrabold text-[#1A1A1A] mb-3 text-sm uppercase tracking-wider">
              {parent.label}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {parent.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/categoria/${child.id}`}
                    className="inline-block px-3 py-1 bg-[#F0FAF5] hover:bg-[#72C5A2] hover:text-white text-[#1A1A1A] text-sm font-semibold rounded-full transition-colors"
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
