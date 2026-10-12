import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate, formatRupiah, FACILITIES, typeLabel, waLink } from "@/lib/utils";
import { Gallery } from "@/components/Gallery";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ChatButton } from "@/components/ContactButtons";
import { ReportButton } from "@/components/ReportButton";
import { ViewTracker } from "@/components/ViewTracker";

export async function getListingBySlug(slug: string) {
  return db.listing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
      category: true,
      seller: {
        select: {
          id: true, name: true, avatar: true, phone: true, verifiedStatus: true, createdAt: true,
          _count: { select: { listings: { where: { status: "PUBLISHED" } } } },
        },
      },
    },
  });
}

type Full = NonNullable<Awaited<ReturnType<typeof getListingBySlug>>>;

const spec = (label: string, v: string | number | null | undefined) =>
  v === null || v === undefined || v === "" ? null : { label, v };

export async function ListingDetail({ l }: { l: Full }) {
  const session = await getSession();
  const [rating, fav] = await Promise.all([
    db.review.aggregate({ where: { sellerId: l.sellerId }, _avg: { rating: true }, _count: true }),
    session ? db.favorite.findUnique({ where: { userId_listingId: { userId: session.id, listingId: l.id } } }) : null,
  ]);

  const specs = [
    spec("Luas tanah", l.landArea && `${l.landArea} m²`),
    spec("Luas bangunan", l.buildingArea && `${l.buildingArea} m²`),
    spec("Lebar", l.width && `${l.width} m`),
    spec("Panjang", l.length && `${l.length} m`),
    spec("Lantai", l.floor),
    spec("Tahun bangunan", l.yearBuilt),
    spec("Listrik", l.electricity),
    spec("Air", l.water),
    spec("Kondisi", l.condition === "NEW" ? "Baru" : "Bekas"),
  ].filter(Boolean) as { label: string; v: string | number }[];

  const mapQuery = l.latitude && l.longitude ? `${l.latitude},${l.longitude}` : `${l.address}, ${l.district}, ${l.city}`;
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const available = l.status === "PUBLISHED";
  const isOwner = session?.id === l.sellerId;

  return (
    <div className="container-x py-8">
      <ViewTracker listingId={l.id} />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Gallery images={l.images.map((i) => i.url)} title={l.title} />

          {l.videoUrl && (
            <video src={l.videoUrl} controls preload="none" className="w-full rounded-xl2 bg-navy" />
          )}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`badge ${l.type === "SALE" ? "bg-brand text-white" : "bg-navy text-white"}`}>{typeLabel(l.type).toUpperCase()}</span>
              {l.status === "SOLD" && <span className="badge bg-red-100 text-red-700">TERJUAL</span>}
              {l.status === "RENTED" && <span className="badge bg-red-100 text-red-700">TERSEWA</span>}
              {l.plan !== "BASIC" && <span className="badge bg-amber-400 text-navy">★ Premium</span>}
            </div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-extrabold md:text-3xl">{l.title}</h1>
              <FavoriteButton listingId={l.id} initial={Boolean(fav)} />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-brand">
              {formatRupiah(l.price)}
              {l.type === "RENT" && <span className="text-base font-medium text-navy-500"> /tahun</span>}
            </p>
            {l.negotiable && <p className="text-sm text-navy-500">Harga dapat dinegosiasikan</p>}
            <p className="mt-2 text-navy-500">📍 {[l.village, l.district, l.city, l.province].filter(Boolean).join(", ")}</p>
          </div>

          <section>
            <h2 className="mb-2 text-lg font-bold">Deskripsi</h2>
            <p className="whitespace-pre-line leading-relaxed text-navy-500">{l.description}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Spesifikasi</h2>
            <dl className="card grid grid-cols-2 gap-4 p-5 md:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-navy-500">{s.label}</dt>
                  <dd className="font-semibold">{s.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Fasilitas</h2>
            {l.facilities.length === 0 ? (
              <p className="text-sm text-navy-500">Tidak ada fasilitas yang dicantumkan.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {l.facilities.map((f) => (
                  <li key={f} className="badge bg-brand-50 px-3 py-1.5 text-brand">
                    ✓ {FACILITIES.find((x) => x.key === f)?.label ?? f}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Lokasi</h2>
            {mapsKey ? (
              <iframe
                title="Peta lokasi"
                loading="lazy"
                className="h-72 w-full rounded-xl2 border-0"
                src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(mapQuery)}`}
              />
            ) : (
              <iframe
                title="Peta lokasi"
                loading="lazy"
                className="h-72 w-full rounded-xl2 border-0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
              />
            )}
            <p className="mt-2 text-sm text-navy-500">{l.address}, {l.district}, {l.city}</p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <div className="card space-y-4 p-5">
            <h2 className="font-bold">Dijual oleh</h2>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand">
                {l.seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{l.seller.name}</p>
                {l.seller.verifiedStatus === "VERIFIED" ? (
                  <p className="text-sm font-medium text-emerald-600">✓ Terverifikasi KIOSKU</p>
                ) : (
                  <p className="text-sm text-navy-500">Belum terverifikasi</p>
                )}
              </div>
            </div>
            <ul className="space-y-1 text-sm text-navy-500">
              <li>Bergabung sejak {l.seller.createdAt.getFullYear()}</li>
              <li>{l.seller._count.listings} listing aktif</li>
              <li>
                ⭐ {rating._count > 0 ? `${(rating._avg.rating ?? 0).toFixed(1)} (${rating._count} ulasan)` : "Belum ada ulasan"}
              </li>
              <li>Diposting {formatDate(l.createdAt)}</li>
            </ul>
            {available && !isOwner ? (
              <div className="space-y-2">
                <ChatButton listingId={l.id} />
                <a href={waLink(l.seller.phone, l.title)} target="_blank" rel="noopener noreferrer" className="btn w-full bg-emerald-500 text-white hover:bg-emerald-600">
                  Chat WhatsApp
                </a>
                <Link href={`/seller/${l.seller.id}`} className="btn-outline w-full">Lihat Profil</Link>
              </div>
            ) : (
              <Link href={`/seller/${l.seller.id}`} className="btn-outline w-full">Lihat Profil</Link>
            )}
          </div>

          <div className="card border-amber-300 bg-amber-50 p-5">
            <h3 className="font-bold">⚠️ Tips keamanan KIOSKU</h3>
            <p className="mt-1 text-sm text-navy-500">
              Jangan melakukan pembayaran sebelum memeriksa lokasi, dokumen, dan identitas penjual.
            </p>
            <div className="mt-4">
              <ReportButton listingId={l.id} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
