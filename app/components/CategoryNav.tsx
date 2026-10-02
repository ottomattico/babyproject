"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/lib/products";

type CategoryWithChildren = Category & { children: (Category & { children: Category[] })[] };

export default function CategoryNav({ tree }: { tree: CategoryWithChildren[] }) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0">
      <ul className="flex flex-col gap-1">
        {tree.map((parent) => (
          <li key={parent.id}>
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {parent.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {parent.children.map((child) => {
                const active = pathname === `/categoria/${child.id}`;
                return (
                  <li key={child.id}>
                    <Link
                      href={`/categoria/${child.id}`}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-rose-50 text-rose-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
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
