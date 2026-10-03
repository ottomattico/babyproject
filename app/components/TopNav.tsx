"use client";

import Link from "next/link";
import { useState } from "react";
import { Category } from "@/lib/products";

type CategoryWithChildren = Category & { children: (Category & { children: Category[] })[] };

export default function TopNav({ tree }: { tree: CategoryWithChildren[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);

  const active = locked ?? open;
  const activeParent = tree.find((p) => p.id === active);

  function handleMouseEnter(id: string) {
    setOpen(id);
  }

  function handleMouseLeave() {
    setOpen(null);
  }

  function handleClick(id: string) {
    setLocked((prev) => (prev === id ? null : id));
  }

  function close() {
    setLocked(null);
    setOpen(null);
  }

  return (
    <nav
      className="relative border-b border-[#E2EDE8] bg-white"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-6 flex gap-0">
        {tree.map((parent) => (
          <div key={parent.id} onMouseEnter={() => handleMouseEnter(parent.id)}>
            <button
              onClick={() => handleClick(parent.id)}
              className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                active === parent.id
                  ? "border-[#72C5A2] text-[#72C5A2]"
                  : "border-transparent text-[#1A1A1A] hover:text-[#72C5A2]"
              }`}
            >
              {parent.label}
            </button>
          </div>
        ))}
      </div>

      {/* Dropdown */}
      <div
        className={`absolute left-0 right-0 bg-white border-b border-[#E2EDE8] shadow-md z-20 overflow-hidden transition-all duration-200 ease-out ${
          active ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {activeParent?.children.map((child) => (
              <Link
                key={child.id}
                href={`/categoria/${child.id}`}
                onClick={close}
                className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#F0FAF5] hover:bg-[#72C5A2] hover:text-white text-[#1A1A1A] transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
