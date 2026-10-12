import { HttpError } from "@/lib/auth";

const buckets = new Map<string, { count: number; reset: number }>();

/** Rate limit sederhana in-memory. Untuk produksi multi-instance gunakan Redis/Upstash. */
export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > limit) throw new HttpError(429, "Terlalu banyak permintaan. Coba lagi sebentar.");
}
