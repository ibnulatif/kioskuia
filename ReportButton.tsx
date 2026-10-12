"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { REPORT_REASONS } from "@/lib/utils";

export function ReportButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("FRAUD");
  const [detail, setDetail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setErr("");
    const r = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reason, detail: detail || undefined }),
    });
    if (r.status === 401) return router.push("/login?next=" + encodeURIComponent(window.location.pathname));
    if (!r.ok) {
      setErr(((await r.json()) as { error?: string }).error ?? "Gagal mengirim laporan.");
      return setState("idle");
    }
    setState("done");
  }

  return (
    <>
      <button className="btn-outline w-full text-red-600" onClick={() => setOpen(true)}>🚩 Laporkan Listing</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-md p-6">
            {state === "done" ? (
              <div className="space-y-4 text-center">
                <p className="text-3xl">✅</p>
                <p className="font-semibold">Terima kasih, laporan Anda telah diterima.</p>
                <button className="btn-primary" onClick={() => { setOpen(false); setState("idle"); }}>Tutup</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h2 className="text-lg font-bold">Laporkan Listing</h2>
                {err && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="reason" checked={reason === r.value} onChange={() => setReason(r.value)} /> {r.label}
                    </label>
                  ))}
                </div>
                <textarea className="input" rows={3} maxLength={1000} placeholder="Detail tambahan (opsional)" value={detail} onChange={(e) => setDetail(e.target.value)} />
                <div className="flex gap-2">
                  <button type="button" className="btn-outline flex-1" onClick={() => setOpen(false)}>Batal</button>
                  <button className="btn-danger flex-1" disabled={state === "busy"}>{state === "busy" ? "Mengirim..." : "Kirim Laporan"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
