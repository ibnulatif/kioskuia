"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FACILITIES } from "@/lib/utils";

export function FilterSidebar() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(sp.get("q") ?? "");
  const first = useRef(true);

  function update(patch: Record<string, string | null>) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    p.delete("page");
    router.push(`${path}?${p}`);
  }

  // debounce pencarian teks 400ms
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => update({ q }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const fac = (sp.get("facilities") ?? "").split(",").filter(Boolean);
  const toggleFac = (k: string) =>
    update({ facilities: (fac.includes(k) ? fac.filter((x) => x !== k) : [...fac, k]).join(",") });

  const body = (
    <div className="space-y-6">
      <div>
        <label className="label">Kata kunci</label>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kios..." />
      </div>
      <div>
        <p className="label">Jenis</p>
        <div className="flex gap-2">
          {[["", "Semua"], ["SALE", "Dijual"], ["RENT", "Disewa"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => update({ type: v })}
              className={`btn flex-1 ${(sp.get("type") ?? "") === v ? "bg-brand text-white" : "border border-navy-100"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Harga (Rp)</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" inputMode="numeric" placeholder="Minimum" defaultValue={sp.get("minPrice") ?? ""} onBlur={(e) => update({ minPrice: e.target.value.replace(/\D/g, "") })} />
          <input className="input" inputMode="numeric" placeholder="Maksimum" defaultValue={sp.get("maxPrice") ?? ""} onBlur={(e) => update({ maxPrice: e.target.value.replace(/\D/g, "") })} />
        </div>
      </div>
      <div>
        <p className="label">Lokasi</p>
        <div className="space-y-2">
          <input className="input" placeholder="Provinsi" defaultValue={sp.get("province") ?? ""} onBlur={(e) => update({ province: e.target.value })} />
          <input className="input" placeholder="Kota/Kabupaten" defaultValue={sp.get("city") ?? ""} onBlur={(e) => update({ city: e.target.value })} />
          <input className="input" placeholder="Kecamatan" defaultValue={sp.get("district") ?? ""} onBlur={(e) => update({ district: e.target.value })} />
        </div>
      </div>
      <div>
        <p className="label">Luas (m²)</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" inputMode="numeric" placeholder="Min" defaultValue={sp.get("minArea") ?? ""} onBlur={(e) => update({ minArea: e.target.value.replace(/\D/g, "") })} />
          <input className="input" inputMode="numeric" placeholder="Maks" defaultValue={sp.get("maxArea") ?? ""} onBlur={(e) => update({ maxArea: e.target.value.replace(/\D/g, "") })} />
        </div>
      </div>
      <div>
        <p className="label">Fasilitas</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {FACILITIES.map((f) => (
            <label key={f.key} className="flex items-center gap-2">
              <input type="checkbox" checked={fac.includes(f.key)} onChange={() => toggleFac(f.key)} />
              {f.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Status</p>
        <select className="input" value={sp.get("condition") ?? ""} onChange={(e) => update({ condition: e.target.value })}>
          <option value="">Semua</option>
          <option value="NEW">Baru</option>
          <option value="USED">Bekas</option>
        </select>
      </div>
      <button className="btn-outline w-full" onClick={() => { setQ(""); router.push(path); }}>
        Reset filter
      </button>
    </div>
  );

  return (
    <>
      <aside className="card hidden h-fit w-72 shrink-0 p-5 lg:block">{body}</aside>
      <button className="btn-outline lg:hidden" onClick={() => setOpen(true)}>⚙️ Filter</button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filter</h2>
              <button onClick={() => setOpen(false)} aria-label="Tutup">✕</button>
            </div>
            {body}
            <button className="btn-primary mt-5 w-full" onClick={() => setOpen(false)}>Tampilkan hasil</button>
          </div>
        </div>
      )}
    </>
  );
}
