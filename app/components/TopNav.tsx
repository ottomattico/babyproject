"use client";

import Link from "next/link";
import { useState } from "react";
import { Category } from "@/lib/products";

type CategoryWithChildren = Category & { children: (Category & { children: Category[] })[] };

export default function TopNav({ tree }: { tree: CategoryWithChildren[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <nav
      className="relative border-b border-[#E2EDE8] bg-white"
      onMouseLeave={() => setOpen(null)}
    >
      <div className="max-w-7xl mx-auto px-6 flex gap-0">
        {tree.map((parent) => (
          <div key={parent.id} onMouseEnter={() => setOpen(parent.id)}>
            <button
              className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                open === parent.id
                  ? "border-[#72C5A2] text-[#72C5A2]"
                  : "border-transparent text-[#1A1A1A] hover:text-[#72C5A2]"
              }`}
            >
              {parent.label}
            </button>
          </div>
        ))}
      </div>

      {/* Dropdown panel */}
      {open && (() => {
        const parent = tree.find((p) => p.id === open);
        if (!parent) return null;
        return (
          <div className="absolute left-0 right-0 bg-white border-b border-[#E2EDE8] shadow-md z-20">
            <div className="max-w-7xl mx-auto px-6 py-5">
              <div className="flex flex-wrap gap-2">
                {parent.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categoria/${child.id}`}
                    onClick={() => setOpen(null)}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#F0FAF5] hover:bg-[#72C5A2] hover:text-white text-[#1A1A1A] transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </nav>
  );
}
