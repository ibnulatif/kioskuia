"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChatButton({ listingId, disabled }: { listingId: string; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function start() {
    setBusy(true);
    setErr("");
    const r = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    if (r.status === 401) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    const j = (await r.json()) as { id?: string; error?: string };
    setBusy(false);
    if (!r.ok || !j.id) return setErr(j.error ?? "Gagal memulai chat.");
    router.push(`/messages?c=${j.id}`);
  }

  return (
    <div>
      <button className="btn-primary w-full" onClick={start} disabled={busy || disabled}>
        💬 {busy ? "Membuka chat..." : "Chat"}
      </button>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
