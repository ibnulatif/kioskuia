"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function patch(url: string, body: object) {
  const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(((await r.json()) as { error?: string }).error ?? "Gagal.");
}

export function ListingActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: string, reason?: string) {
    setBusy(true);
    try {
      await patch(`/api/admin/listings/${id}`, { action, reason });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setBusy(false);
    }
  }

  const btn = "btn-outline px-2.5 py-1 text-xs";
  return (
    <div className="flex flex-wrap gap-1">
      <a className={btn} href={`/listing/${id}`} target="_blank" rel="noreferrer">View</a>
      {status !== "PUBLISHED" && <button className={`${btn} text-emerald-700`} disabled={busy} onClick={() => run("approve")}>Approve</button>}
      {status !== "REJECTED" && (
        <button className={`${btn} text-amber-700`} disabled={busy} onClick={() => {
          const reason = prompt("Alasan penolakan (akan dilihat seller):");
          if (reason?.trim()) run("reject", reason);
        }}>Reject</button>
      )}
      {status !== "BLOCKED" && <button className={`${btn} text-red-600`} disabled={busy} onClick={() => confirm("Blokir listing ini?") && run("block")}>Block</button>}
      <button className={`${btn} text-red-600`} disabled={busy} onClick={() => confirm("Hapus permanen listing ini?") && run("delete")}>Delete</button>
    </div>
  );
}

export function UserActions({ id, blocked }: { id: string; blocked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn-outline px-2.5 py-1 text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await patch(`/api/admin/users/${id}`, { blocked: !blocked });
          router.refresh();
        } catch (e) {
          alert(e instanceof Error ? e.message : "Gagal.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {blocked ? "Buka blokir" : "Blokir"}
    </button>
  );
}

export function VerificationActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run(action: string, note?: string) {
    setBusy(true);
    try {
      await patch(`/api/admin/verifications/${id}`, { action, note });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex gap-2">
      <button className="btn-primary px-3 py-1.5" disabled={busy} onClick={() => run("approve")}>Setujui</button>
      <button className="btn-outline px-3 py-1.5 text-red-600" disabled={busy} onClick={() => {
        const note = prompt("Alasan penolakan:");
        if (note?.trim()) run("reject", note);
      }}>Tolak</button>
    </div>
  );
}

export function ResolveReport({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button className="btn-outline px-2.5 py-1 text-xs" onClick={async () => {
      await patch(`/api/admin/reports/${id}`, {});
      router.refresh();
    }}>Tandai selesai</button>
  );
}
