import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { formatRupiah, listingPath, typeLabel } from "@/lib/utils";
import { getListingBySlug, ListingDetail } from "@/components/ListingDetail";

const base = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function listingMetadata(slug: string): Promise<Metadata> {
  const l = await getListingBySlug(slug);
  if (!l || l.status !== "PUBLISHED") return { title: "Listing tidak ditemukan", robots: { index: false } };
  const url = `${base()}${listingPath(l)}`;
  const desc = `${typeLabel(l.type)} ${l.title} di ${l.district}, ${l.city} seharga ${formatRupiah(l.price)}. ${l.description.slice(0, 110)}`;
  const img = l.images[0]?.url;
  return {
    title: `${l.title} - ${typeLabel(l.type)} di ${l.city}`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title: l.title, description: desc, url, type: "website", images: img ? [{ url: img }] : undefined },
  };
}

export async function ListingPageView({ slug, expectedType }: { slug: string; expectedType?: "SALE" | "RENT" }) {
  const l = await getListingBySlug(slug);
  if (!l) notFound();
  if (expectedType && l.type !== expectedType) notFound();

  if (l.status === "PENDING" || l.status === "REJECTED" || l.status === "BLOCKED") {
    const s = await getSession();
    if (!s || (s.id !== l.sellerId && s.role !== "ADMIN")) notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: l.title,
    description: l.description.slice(0, 300),
    url: `${base()}${listingPath(l)}`,
    image: l.images.map((i) => i.url),
    datePosted: l.createdAt.toISOString(),
    offers: {
      "@type": "Offer",
      price: Number(l.price),
      priceCurrency: "IDR",
      availability: l.status === "PUBLISHED" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
    contentLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: l.city, addressRegion: l.province, addressCountry: "ID" },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ListingDetail l={l} />
    </>
  );
}
