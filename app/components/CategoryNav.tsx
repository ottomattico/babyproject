"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/lib/products";

type CategoryWithChildren = Category & { children: (Category & { children: Category[] })[] };

export default function CategoryNav({ tree }: { tree: CategoryWithChildren[] }) {
  const pathname = usePathname();

  return (
    <nav className="w-52 shrink-0">
      <ul className="flex flex-col gap-4">
        {tree.map((parent) => (
          <li key={parent.id}>
            <p className="px-2 mb-1 text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest">
              {parent.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {parent.children.map((child) => {
                const active = pathname === `/categoria/${child.id}`;
                return (
                  <li key={child.id}>
                    <Link
                      href={`/categoria/${child.id}`}
                      className={`block px-2 py-1.5 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-[#FF4D2E] text-white font-medium"
                          : "text-[#0F0F0F] hover:bg-[#F0EDE6]"
                      }`}
                    >
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
