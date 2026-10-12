"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";

type Conv = {
  id: string;
  updatedAt: string;
  listing: { id: string; title: string };
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  messages: { body: string; createdAt: string }[];
  _count: { messages: number };
};
type Msg = { id: string; senderId: string; body: string; createdAt: string };

export function ChatClient({ meId, initialId }: { meId: string; initialId?: string }) {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(initialId ?? null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const lastAt = useRef<string | null>(null);

  const loadConvs = useCallback(async () => {
    try {
      const r = await fetch("/api/conversations");
      if (r.ok) setConvs(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConvs();
    const t = setInterval(loadConvs, 8000);
    return () => clearInterval(t);
  }, [loadConvs]);

  // pesan real-time lewat polling 3 detik
  useEffect(() => {
    if (!active) return;
    let alive = true;
    setMsgs([]);
    lastAt.current = null;
    const poll = async () => {
      const q = lastAt.current ? `?after=${encodeURIComponent(lastAt.current)}` : "";
      try {
        const r = await fetch(`/api/conversations/${active}/messages${q}`);
        if (!r.ok || !alive) return;
        const fresh = (await r.json()) as Msg[];
        if (fresh.length) {
          lastAt.current = fresh[fresh.length - 1].createdAt;
          setMsgs((m) => {
            const ids = new Set(m.map((x) => x.id));
            return [...m, ...fresh.filter((x) => !ids.has(x.id))];
          });
        }
      } catch {}
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [active]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    setErr("");
    const r = await fetch(`/api/conversations/${active}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    setSending(false);
    if (!r.ok) return setErr(((await r.json()) as { error?: string }).error ?? "Gagal mengirim.");
    const m = (await r.json()) as Msg;
    lastAt.current = m.createdAt;
    setMsgs((x) => (x.some((y) => y.id === m.id) ? x : [...x, m]));
    setText("");
    loadConvs();
  }

  const current = convs.find((c) => c.id === active);

  return (
    <div className="card grid h-[calc(100vh-14rem)] min-h-[28rem] overflow-hidden md:grid-cols-3">
      <div className={`overflow-auto border-r border-navy-100 ${active ? "hidden md:block" : ""}`}>
        <h2 className="border-b border-navy-100 p-4 font-bold">Pesan</h2>
        {loading ? (
          <p className="p-4 text-sm text-navy-500">Memuat...</p>
        ) : convs.length === 0 ? (
          <p className="p-4 text-sm text-navy-500">Belum ada percakapan. Mulai dengan menekan Chat pada sebuah listing.</p>
        ) : (
          convs.map((c) => {
            const other = c.buyer.id === meId ? c.seller : c.buyer;
            return (
              <button key={c.id} onClick={() => setActive(c.id)} className={`block w-full border-b border-navy-100/60 p-4 text-left hover:bg-navy-100/30 ${active === c.id ? "bg-brand-50" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{other.name}</span>
                  {c._count.messages > 0 && <span className="rounded-full bg-brand px-2 text-xs font-bold text-white">{c._count.messages}</span>}
                </div>
                <p className="truncate text-xs text-brand">{c.listing.title}</p>
                <p className="truncate text-sm text-navy-500">{c.messages[0]?.body ?? "—"}</p>
              </button>
            );
          })
        )}
      </div>
      <div className={`flex min-h-0 flex-col md:col-span-2 ${active ? "" : "hidden md:flex"}`}>
        {!active ? (
          <div className="grid flex-1 place-items-center text-navy-500">Pilih percakapan</div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-navy-100 p-4">
              <button className="md:hidden" onClick={() => setActive(null)} aria-label="Kembali">←</button>
              <div>
                <p className="font-semibold">{current ? (current.buyer.id === meId ? current.seller.name : current.buyer.name) : "Percakapan"}</p>
                {current && <p className="text-xs text-brand">Terkait: {current.listing.title}</p>}
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {msgs.length === 0 && <p className="text-center text-sm text-navy-500">Belum ada pesan. Sapa penjual 👋</p>}
              {msgs.map((m) => {
                const mine = m.senderId === meId;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-brand text-white" : "bg-navy-100"}`}>
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-navy-500"}`}>{formatTime(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottom} />
            </div>
            <form onSubmit={send} className="border-t border-navy-100 p-3">
              {err && <p className="mb-2 text-xs text-red-600">{err}</p>}
              <div className="flex gap-2">
                <input className="input" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan..." />
                <button className="btn-primary" disabled={sending || !text.trim()}>Kirim</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
