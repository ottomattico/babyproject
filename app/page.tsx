import { getCategories, buildTree, Category } from "@/lib/products";
import Link from "next/link";

export default async function Home() {
  const categories = await getCategories();
  const tree = buildTree(categories) as (Category & { children: (Category & { children: Category[] })[] })[];

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-[#0F0F0F] leading-tight">
          Todo para tu bebé.<br />
          <span className="text-[#FF4D2E]">Al mejor precio.</span>
        </h1>
        <p className="text-[#6B6B6B] mt-3 text-base">
          Comparamos precios en Baby City, MVD Kids, Bebesit, Carestino, Chicco y más.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tree.map((parent) => (
          <div key={parent.id} className="bg-white rounded-2xl p-5 border border-[#E4E0D8] hover:border-[#FF4D2E] transition-colors">
            <h3 className="font-semibold text-[#0F0F0F] mb-3 text-sm uppercase tracking-wide">
              {parent.label}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {parent.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/categoria/${child.id}`}
                    className="inline-block px-3 py-1 bg-[#F5F2EC] hover:bg-[#FF4D2E] hover:text-white text-[#0F0F0F] text-sm rounded-full transition-colors"
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
