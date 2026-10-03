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
      <span className="text-sm text-gray-400">Ordenar:</span>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => select(o.value)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            active === o.value
              ? "bg-gray-900 border-gray-900 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
