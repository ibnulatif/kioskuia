"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <select
      aria-label="Urutkan"
      className="input w-auto"
      value={sp.get("sort") ?? ""}
      onChange={(e) => {
        const p = new URLSearchParams(sp.toString());
        if (e.target.value) p.set("sort", e.target.value);
        else p.delete("sort");
        p.delete("page");
        router.push(`${path}?${p}`);
      }}
    >
      <option value="">Terbaru</option>
      <option value="price_asc">Harga terendah</option>
      <option value="price_desc">Harga tertinggi</option>
      <option value="popular">Terpopuler</option>
    </select>
  );
}
