import Link from "next/link";
import { db } from "@/lib/db";
import { cardSelect } from "@/lib/listings";
import { getCities, getFavoriteIds } from "@/lib/queries";
import { SearchBox } from "@/components/SearchBox";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const categories = [
  { icon: "🏪", name: "Kios Dijual", href: "/search?type=SALE" },
  { icon: "🔑", name: "Kios Disewa", href: "/search?type=RENT" },
  { icon: "🏬", name: "Ruko", href: "/search?category=ruko" },
  { icon: "🛍️", name: "Lapak", href: "/search?category=lapak" },
  { icon: "🍜", name: "Tempat Kuliner", href: "/search?category=tempat-kuliner" },
  { icon: "🏢", name: "Tempat Usaha", href: "/search?category=tempat-usaha" },
];

export default async function HomePage() {
  const [featured, latest, cities, favs] = await Promise.all([
    db.listing.findMany({
      where: { status: "PUBLISHED", plan: "PRO" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: cardSelect,
    }),
    db.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: cardSelect,
    }),
    getCities(),
    getFavoriteIds(),
  ]);

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-x py-16 text-center md:py-24">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
            Temukan tempat yang tepat untuk memulai usaha.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-navy-500 md:text-lg">
            Cari kios, toko, ruko, dan tempat usaha terbaik di sekitar Anda.
          </p>
          <div className="mt-8">
            <SearchBox cities={cities} />
          </div>
          <p className="mt-4 text-sm text-navy-500">Contoh: Kios Semarang, Kios dekat pasar, Kios murah</p>
        </div>
      </section>

      <section className="container-x py-12">
        <h2 className="mb-6 text-2xl font-bold">Cari berdasarkan kebutuhan</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.name} href={c.href} className="card flex flex-col items-center gap-2 p-5 text-center transition hover:border-brand hover:shadow-md">
              <span className="text-3xl">{c.icon}</span>
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-x pb-4">
          <h2 className="mb-6 text-2xl font-bold">Pilihan utama</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} l={l} favorited={favs.has(l.id)} />
            ))}
          </div>
        </section>
      )}

      <section className="container-x py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Kios terbaru di KIOSKU</h2>
          <Link href="/search" className="text-sm font-semibold text-brand">Lihat semua →</Link>
        </div>
        {latest.length === 0 ? (
          <EmptyState title="Belum ada listing" text="Jadilah yang pertama memasang kios Anda." href="/register" cta="Pasang Listing" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((l) => (
              <ListingCard key={l.id} l={l} favorited={favs.has(l.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="container-x">
        <div className="card flex flex-col items-center gap-4 bg-navy p-10 text-center text-white">
          <h2 className="text-2xl font-bold">Punya kios untuk dijual atau disewa?</h2>
          <p className="max-w-lg text-white/70">Pasang listing dan jangkau calon pembeli serta penyewa di seluruh Indonesia.</p>
          <Link href="/register?role=SELLER" className="btn-primary">Mulai Jual / Sewakan</Link>
        </div>
      </section>
    </>
  );
}
