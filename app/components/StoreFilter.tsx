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
              ? "bg-[#FF4D2E] border-[#FF4D2E] text-white"
              : "bg-white border-[#E4E0D8] text-[#0F0F0F] hover:border-[#FF4D2E]"
          }`}
        >
          {s === "todas" ? "Todas las tiendas" : s}
        </button>
      ))}
    </div>
  );
}
