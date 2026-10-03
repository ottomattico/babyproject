"use client";

import Link from "next/link";
import { useState } from "react";
import { Category } from "@/lib/products";

type CategoryWithChildren = Category & { children: (Category & { children: Category[] })[] };

export default function TopNav({ tree }: { tree: CategoryWithChildren[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <nav
      className="relative border-b border-[#E4E0D8] bg-[#FAFAF7]"
      onMouseLeave={() => setOpen(null)}
    >
      <div className="max-w-7xl mx-auto px-6 flex gap-0">
        {tree.map((parent) => (
          <div key={parent.id} onMouseEnter={() => setOpen(parent.id)}>
            <button
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                open === parent.id
                  ? "border-[#FF4D2E] text-[#FF4D2E]"
                  : "border-transparent text-[#0F0F0F] hover:text-[#FF4D2E]"
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
          <div className="absolute left-0 right-0 bg-white border-b border-[#E4E0D8] shadow-lg z-20">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-wrap gap-2">
                {parent.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categoria/${child.id}`}
                    onClick={() => setOpen(null)}
                    className="px-4 py-2 rounded-full text-sm bg-[#F5F2EC] hover:bg-[#FF4D2E] hover:text-white text-[#0F0F0F] transition-colors"
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
