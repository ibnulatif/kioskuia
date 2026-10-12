import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getFavoriteIds(): Promise<Set<string>> {
  const s = await getSession();
  if (!s) return new Set();
  const favs = await db.favorite.findMany({ where: { userId: s.id }, select: { listingId: true } });
  return new Set(favs.map((f) => f.listingId));
}

export async function getCities(): Promise<string[]> {
  const rows = await db.listing.findMany({
    where: { status: "PUBLISHED" },
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });
  return rows.map((r) => r.city);
}
