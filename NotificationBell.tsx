"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type N = { id: string; title: string; body: string; href: string | null; read: boolean };

export function NotificationBell() {
  const [items, setItems] = useState<N[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/notifications");
        if (!r.ok) return;
        const j = (await r.json()) as { items: N[]; unread: number };
        if (alive) {
          setItems(j.items);
          setUnread(j.unread);
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await fetch("/api/notifications", { method: "POST" });
      setUnread(0);
    }
  }

  return (
    <div className="relative">
      <button onClick={toggle} aria-label="Notifikasi" className="relative rounded-xl p-2 hover:bg-navy-100/50">
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="card absolute right-0 mt-2 max-h-96 w-80 overflow-auto p-2">
          {items.length === 0 ? (
            <p className="p-4 text-center text-sm text-navy-500">Belum ada notifikasi.</p>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                href={n.href ?? "#"}
                onClick={() => setOpen(false)}
                className="block rounded-lg p-3 text-sm hover:bg-navy-100/40"
              >
                <p className="font-semibold">{n.title}</p>
                <p className="line-clamp-2 text-navy-500">{n.body}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
