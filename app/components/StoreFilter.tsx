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
          className={`px-3.5 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
            active === s
              ? "bg-[#72C5A2] border-[#72C5A2] text-white"
              : "bg-transparent border-[#E2EDE8] text-[#8E9FA0] hover:border-[#72C5A2] hover:text-[#72C5A2]"
          }`}
        >
          {s === "todas" ? "Todas" : s}
        </button>
      ))}
    </div>
  );
}
