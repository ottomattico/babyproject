"use client";

export default function CopyButton({ slug }: { slug: string }) {
  function copy() {
    navigator.clipboard.writeText(`${location.origin}/lista/${slug}`);
  }
  return (
    <button
      onClick={copy}
      className="text-xs text-[#72C5A2] font-semibold border border-[#72C5A2] rounded-full px-3 py-1 hover:bg-[#72C5A2] hover:text-white transition-colors"
    >
      Copiar link
    </button>
  );
}
