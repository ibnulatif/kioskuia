"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type C = { id: string; name: string; icon: string | null; _count: { listings: number } };

export function CategoryManager({ items }: { items: C[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [err, setErr] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    if (!r.ok) return setErr(((await r.json()) as { error?: string }).error ?? "Gagal.");
    setName("");
    setIcon("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    const r = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    if (!r.ok) return alert(((await r.json()) as { error?: string }).error ?? "Gagal.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="card flex flex-col gap-2 p-4 sm:flex-row">
        <input className="input" placeholder="Nama kategori" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input sm:w-28" placeholder="Ikon 🏪" value={icon} onChange={(e) => setIcon(e.target.value)} />
        <button className="btn-primary">Tambah</button>
      </form>
      {err && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div className="card divide-y divide-navy-100">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 text-sm">
            <span>{c.icon} {c.name} <span className="text-navy-500">({c._count.listings} listing)</span></span>
            <button className="btn-outline px-2.5 py-1 text-xs text-red-600" onClick={() => remove(c.id)}>Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
