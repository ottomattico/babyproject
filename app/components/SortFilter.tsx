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
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-[#6B6B6B]">Ordenar:</span>
      <select
        value={active}
        onChange={(e) => select(e.target.value)}
        className="text-sm border border-[#E4E0D8] rounded-full px-3 py-1 bg-white text-[#0F0F0F] cursor-pointer focus:outline-none focus:border-[#0F0F0F]"
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
