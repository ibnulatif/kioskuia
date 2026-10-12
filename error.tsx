"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x py-16 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="mt-3 text-xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-1 text-navy-500">Silakan coba lagi sebentar lagi.</p>
      <button className="btn-primary mt-5" onClick={reset}>Coba lagi</button>
    </div>
  );
}
