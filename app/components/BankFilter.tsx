"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function BankFilter({ banks }: { banks: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("banco") ?? "todas";

  function select(bank: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (bank === "todas") {
      params.delete("banco");
    } else {
      params.set("banco", bank);
    }
    router.push(`?${params.toString()}`);
  }

  const options = ["todas", ...banks];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((b) => (
        <button
          key={b}
          onClick={() => select(b)}
          className={`px-3.5 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
            active === b
              ? "bg-[#E87A5C] border-[#E87A5C] text-white"
              : "bg-transparent border-[#E2EDE8] text-[#8E9FA0] hover:border-[#E87A5C] hover:text-[#E87A5C]"
          }`}
        >
          {b === "todas" ? "Todos los bancos" : b}
        </button>
      ))}
    </div>
  );
}
