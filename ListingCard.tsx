import Image from "next/image";
import Link from "next/link";
import type { ListingCardData } from "@/lib/listings";
import { formatRupiah, listingPath, typeLabel } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";

export function ListingCard({ l, favorited = false }: { l: ListingCardData; favorited?: boolean }) {
  const area = l.buildingArea ?? l.landArea;
  const img = l.images[0]?.url;
  return (
    <article className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-navy-100">
        {img && (
          <Image
            src={img}
            alt={l.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
        )}
        <span
          className={`badge absolute left-3 top-3 ${l.type === "SALE" ? "bg-brand text-white" : "bg-navy text-white"}`}
        >
          {typeLabel(l.type)}
        </span>
        {l.plan !== "BASIC" && (
          <span className="badge absolute bottom-3 left-3 bg-amber-400 text-navy">★ Premium</span>
        )}
        <div className="absolute right-3 top-3">
          <FavoriteButton listingId={l.id} initial={favorited} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] font-semibold leading-snug">{l.title}</h3>
        <p className="text-lg font-extrabold text-brand">
          {formatRupiah(l.price)}
          {l.type === "RENT" && <span className="text-sm font-medium text-navy-500"> /tahun</span>}
        </p>
        <p className="text-sm text-navy-500">
          📍 {l.district}, {l.city}
        </p>
        <div className="flex items-center justify-between text-sm text-navy-500">
          <span>{area ? `${area} m²` : "-"}</span>
          {l.seller.verifiedStatus === "VERIFIED" && (
            <span className="font-medium text-emerald-600">✓ Terverifikasi KIOSKU</span>
          )}
        </div>
        <p className="truncate text-xs text-navy-500">Oleh {l.seller.name}</p>
        <Link href={listingPath(l)} className="btn-outline w-full">
          Lihat Detail
        </Link>
      </div>
    </article>
  );
}
