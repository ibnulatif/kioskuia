import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const PAGE_SIZE = 12;

export type SearchParams = {
  q?: string;
  type?: string;
  category?: string;
  province?: string;
  city?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  facilities?: string | string[];
  condition?: string;
  sort?: string;
  page?: string;
};

export const cardSelect = {
  id: true,
  slug: true,
  title: true,
  type: true,
  price: true,
  city: true,
  province: true,
  district: true,
  landArea: true,
  buildingArea: true,
  plan: true,
  featured: true,
  views: true,
  createdAt: true,
  images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }], take: 1, select: { url: true } },
  seller: { select: { id: true, name: true, verifiedStatus: true } },
  _count: { select: { favorites: true } },
} satisfies Prisma.ListingSelect;

export type ListingCardData = Prisma.ListingGetPayload<{ select: typeof cardSelect }>;

const num = (v?: string) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function buildWhere(sp: SearchParams): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [{ status: "PUBLISHED" }];
  if (sp.type === "SALE" || sp.type === "RENT") and.push({ type: sp.type });
  if (sp.category) and.push({ category: { slug: sp.category } });
  if (sp.province) and.push({ province: { equals: sp.province, mode: "insensitive" } });
  if (sp.city) and.push({ city: { contains: sp.city, mode: "insensitive" } });
  if (sp.district) and.push({ district: { contains: sp.district, mode: "insensitive" } });
  if (sp.condition === "NEW" || sp.condition === "USED") and.push({ condition: sp.condition });

  const minP = num(sp.minPrice);
  const maxP = num(sp.maxPrice);
  if (minP !== undefined || maxP !== undefined) {
    and.push({ price: { gte: minP !== undefined ? BigInt(minP) : undefined, lte: maxP !== undefined ? BigInt(maxP) : undefined } });
  }
  const minA = num(sp.minArea);
  const maxA = num(sp.maxArea);
  if (minA !== undefined || maxA !== undefined) {
    and.push({ OR: [{ landArea: { gte: minA, lte: maxA } }, { buildingArea: { gte: minA, lte: maxA } }] });
  }
  const fac = Array.isArray(sp.facilities) ? sp.facilities : sp.facilities ? sp.facilities.split(",") : [];
  if (fac.length) and.push({ facilities: { hasEvery: fac } });

  const q = sp.q?.trim();
  if (q) {
    const words = q.split(/\s+/).slice(0, 5);
    for (const w of words) {
      and.push({
        OR: [
          { title: { contains: w, mode: "insensitive" } },
          { description: { contains: w, mode: "insensitive" } },
          { province: { contains: w, mode: "insensitive" } },
          { city: { contains: w, mode: "insensitive" } },
          { district: { contains: w, mode: "insensitive" } },
          { village: { contains: w, mode: "insensitive" } },
          { address: { contains: w, mode: "insensitive" } },
          { category: { name: { contains: w, mode: "insensitive" } } },
        ],
      });
    }
  }
  return { AND: and };
}

export function buildOrder(sort?: string): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    case "popular":
      return [{ views: "desc" }, { createdAt: "desc" }];
    default:
      // listing PRO/PREMIUM diprioritaskan, lalu terbaru
      return [{ plan: "desc" }, { createdAt: "desc" }];
  }
}

export async function searchListings(sp: SearchParams) {
  const page = Math.max(1, Number(sp.page) || 1);
  const where = buildWhere(sp);
  const [items, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: buildOrder(sp.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: cardSelect,
    }),
    db.listing.count({ where }),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
