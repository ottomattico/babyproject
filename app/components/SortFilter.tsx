"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
];

export default function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("orden") ?? "relevancia";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "relevancia") {
      params.delete("orden");
    } else {
      params.set("orden", value);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-[#B8B0A4] tracking-wide">Ordenar:</span>
      <select
        value={active}
        onChange={(e) => select(e.target.value)}
        className="text-[12px] border border-[#D8D4CC] rounded-full px-3 py-1 bg-transparent text-[#6B6460] cursor-pointer focus:outline-none focus:border-[#1A1A1A] focus:text-[#1A1A1A]"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
