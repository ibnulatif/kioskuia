"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingRowActions({ id, status, type }: { id: string; status: string; type: "SALE" | "RENT" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(method: "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    const r = await fetch(`/api/listings/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setBusy(false);
    if (!r.ok) alert(((await r.json()) as { error?: string }).error ?? "Gagal.");
    router.refresh();
  }

  return (
    <div className="flex gap-1.5">
      <Link href={`/dashboard/listings/${id}/edit`} className="btn-outline px-3 py-1.5">Edit</Link>
      {status === "PUBLISHED" && (
        <button className="btn-outline px-3 py-1.5" disabled={busy} onClick={() => call("PATCH", { status: type === "SALE" ? "SOLD" : "RENTED" })}>
          {type === "SALE" ? "Tandai Terjual" : "Tandai Tersewa"}
        </button>
      )}
      <button
        className="btn-outline px-3 py-1.5 text-red-600"
        disabled={busy}
        onClick={() => confirm("Hapus listing ini? Tindakan tidak dapat dibatalkan.") && call("DELETE")}
      >
        Hapus
      </button>
    </div>
  );
}
