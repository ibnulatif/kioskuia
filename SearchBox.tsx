"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ cities }: { cities: string[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [type, setType] = useState("SALE");
  const [city, setCity] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (type) p.set("type", type);
    if (city) p.set("city", city);
    router.push(`/search?${p}`);
  }

  return (
    <form onSubmit={submit} className="card mx-auto flex w-full max-w-4xl flex-col gap-2 p-2 md:flex-row">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔍 Cari lokasi, pasar, atau nama kios"
        className="input flex-1 border-transparent"
        aria-label="Kata kunci"
      />
      <select value={type} onChange={(e) => setType(e.target.value)} className="input md:w-40" aria-label="Jenis">
        <option value="SALE">Dijual</option>
        <option value="RENT">Disewa</option>
        <option value="">Semua</option>
      </select>
      <select value={city} onChange={(e) => setCity(e.target.value)} className="input md:w-52" aria-label="Kota">
        <option value="">Semua Kota</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button className="btn-primary md:px-8">CARI</button>
    </form>
  );
}
