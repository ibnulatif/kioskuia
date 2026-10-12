"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLANS, formatRupiah } from "@/lib/utils";

declare global {
  interface Window {
    snap?: { pay: (token: string, cb: Record<string, () => void>) => void };
  }
}

type L = { id: string; title: string; plan: string; planUntil: string | null };

function loadSnap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    const key = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
    const sandbox = key.startsWith("SB-");
    const s = document.createElement("script");
    s.src = `https://app${sandbox ? ".sandbox" : ""}.midtrans.com/snap/snap.js`;
    s.setAttribute("data-client-key", key);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Gagal memuat Midtrans."));
    document.body.appendChild(s);
  });
}

export function PromoClient({ listings }: { listings: L[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function buy(listingId: string, plan: "PREMIUM" | "PRO") {
    setBusy(`${listingId}:${plan}`);
    setErr("");
    setMsg("");
    try {
      const r = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, plan }),
      });
      const j = (await r.json()) as { error?: string; token?: string; devMode?: boolean };
      if (!r.ok) throw new Error(j.error ?? "Gagal memproses.");
      if (j.devMode) {
        setMsg("Mode development: paket diaktifkan tanpa pembayaran (MIDTRANS_SERVER_KEY belum diatur).");
        router.refresh();
      } else if (j.token) {
        await loadSnap();
        window.snap?.pay(j.token, {
          onSuccess: () => { setMsg("Pembayaran berhasil. Paket akan aktif sebentar lagi."); router.refresh(); },
          onPending: () => setMsg("Menunggu pembayaran Anda."),
          onError: () => setErr("Pembayaran gagal."),
          onClose: () => setMsg("Pembayaran dibatalkan."),
        });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {msg && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{msg}</p>}
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((k) => (
          <div key={k} className="card p-5">
            <h3 className="font-bold">{PLANS[k].name}</h3>
            <p className="text-2xl font-extrabold text-brand">{PLANS[k].price === 0 ? "Gratis" : formatRupiah(PLANS[k].price)}</p>
            <ul className="mt-2 space-y-1 text-sm text-navy-500">
              {PLANS[k].perks.map((p) => <li key={p}>✓ {p}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-bold">Promosikan Listing</h2>
      <div className="space-y-3">
        {listings.map((l) => (
          <div key={l.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold">{l.title}</p>
              <p className="text-sm text-navy-500">
                Paket: {l.plan}{l.planUntil ? ` · sampai ${new Date(l.planUntil).toLocaleDateString("id-ID")}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              {(["PREMIUM", "PRO"] as const).map((p) => (
                <button key={p} className="btn-primary" disabled={busy !== null} onClick={() => buy(l.id, p)}>
                  {busy === `${l.id}:${p}` ? "Memproses..." : `${p} ${formatRupiah(PLANS[p].price)}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
