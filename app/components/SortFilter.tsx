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
      <span className="text-[12px] text-[#8E9FA0] font-semibold">Ordenar:</span>
      <select
        value={active}
        onChange={(e) => select(e.target.value)}
        className="text-[12px] font-semibold border border-[#E2EDE8] rounded-full px-3 py-1 bg-transparent text-[#8E9FA0] cursor-pointer focus:outline-none focus:border-[#72C5A2] focus:text-[#72C5A2]"
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
