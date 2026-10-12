"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FavoriteButton({ listingId, initial = false }: { listingId: string; initial?: boolean }) {
  const router = useRouter();
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (r.status === 401) {
        router.push("/login?next=" + encodeURIComponent(window.location.pathname));
        return;
      }
      const j = (await r.json()) as { favorited?: boolean };
      setFav(Boolean(j.favorited));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={fav ? "Hapus dari favorit" : "Simpan ke favorit"}
      aria-pressed={fav}
      className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-lg shadow-card transition hover:scale-105"
    >
      {fav ? "❤️" : "🤍"}
    </button>
  );
}
