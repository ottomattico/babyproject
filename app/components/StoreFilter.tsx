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
    <div className="flex flex-wrap gap-2 mb-6">
      {options.map((s) => (
        <button
          key={s}
          onClick={() => select(s)}
          className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
            active === s
              ? "bg-rose-500 border-rose-500 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-rose-300"
          }`}
        >
          {s === "todas" ? "Todas las tiendas" : s}
        </button>
      ))}
    </div>
  );
}
