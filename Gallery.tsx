"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = images.length;

  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, go]);

  if (n === 0) return <div className="aspect-[16/10] rounded-xl2 bg-navy-100" />;

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <div>
      <div
        className="relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-xl2 bg-navy-100"
        onClick={() => setZoom(true)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <Image src={images[i]} alt={`${title} - foto ${i + 1}`} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
        {n > 1 && (
          <>
            <button aria-label="Sebelumnya" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card">‹</button>
            <button aria-label="Berikutnya" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card">›</button>
            <span className="absolute bottom-3 right-3 rounded-full bg-navy/70 px-2.5 py-1 text-xs text-white">{i + 1}/{n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <button key={src + k} onClick={() => setI(k)} aria-label={`Foto ${k + 1}`} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${k === i ? "border-brand" : "border-transparent"}`}>
              <Image src={src} alt="" fill sizes="96px" className="object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/90 p-4" onClick={() => setZoom(false)} role="dialog" aria-modal="true">
          <button aria-label="Tutup" className="absolute right-4 top-4 text-3xl text-white">✕</button>
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[i]} alt={title} fill sizes="100vw" className="object-contain" />
          </div>
          {n > 1 && (
            <>
              <button aria-label="Sebelumnya" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-4 top-1/2 text-4xl text-white">‹</button>
              <button aria-label="Berikutnya" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-4 top-1/2 text-4xl text-white">›</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
