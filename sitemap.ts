import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { listingPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let listings: { slug: string; type: "SALE" | "RENT"; city: string; updatedAt: Date }[] = [];
  try {
    listings = await db.listing.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, type: true, city: true, updatedAt: true },
      take: 5000,
    });
  } catch {}
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "hourly", priority: 0.9 },
    ...listings.map((l) => ({ url: `${base}${listingPath(l)}`, lastModified: l.updatedAt, priority: 0.7 })),
  ];
}
