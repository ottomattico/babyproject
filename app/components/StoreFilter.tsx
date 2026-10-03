"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StoreFilter({ stores }: { stores: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("store") ?? "todas";

  function select(store: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (store === "todas") {
      params.delete("store");
    } else {
      params.set("store", store);
    }
    router.push(`?${params.toString()}`);
  }

  const options = ["todas", ...stores];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((s) => (
        <button
          key={s}
          onClick={() => select(s)}
          className={`px-3.5 py-1 rounded-full text-[12px] tracking-wide border transition-colors ${
            active === s
              ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
              : "bg-transparent border-[#D8D4CC] text-[#6B6460] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
          }`}
        >
          {s === "todas" ? "Todas" : s}
        </button>
      ))}
    </div>
  );
}
