import { PrismaClient, type ListingType, type PromoPlan } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const IMG = [
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=70",
  "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&q=70",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=70",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=70",
  "https://images.unsplash.com/photo-1519566335946-e6f65f0f4fdf?w=1200&q=70",
];

type Seed = {
  title: string; type: ListingType; price: number; city: string; province: string;
  district: string; village: string; address: string; lat: number; lng: number;
  land: number; building: number; w: number; l: number; cat: string;
  facilities: string[]; seller: 0 | 1 | 2; plan?: PromoPlan; condition?: "NEW" | "USED";
};

const listings: Seed[] = [
  { title: "Kios Strategis Dekat Pasar Ungaran", type: "SALE", price: 350_000_000, city: "Kabupaten Semarang", province: "Jawa Tengah", district: "Ungaran Barat", village: "Genuk", address: "Jl. Diponegoro No. 12", lat: -7.1386, lng: 110.4066, land: 12, building: 12, w: 3, l: 4, cat: "kios-dijual", facilities: ["listrik", "air", "jalan-utama", "dekat-pasar"], seller: 0, plan: "PRO" },
  { title: "Kios Disewa Pinggir Jalan Ungaran", type: "RENT", price: 12_000_000, city: "Kabupaten Semarang", province: "Jawa Tengah", district: "Ungaran Timur", village: "Beji", address: "Jl. Gatot Subroto No. 5", lat: -7.1331, lng: 110.4193, land: 15, building: 15, w: 3, l: 5, cat: "kios-disewa", facilities: ["listrik", "air", "parkir", "jalan-utama"], seller: 0, plan: "PREMIUM" },
  { title: "Ruko 2 Lantai Pusat Kota Semarang", type: "SALE", price: 1_850_000_000, city: "Kota Semarang", province: "Jawa Tengah", district: "Semarang Tengah", village: "Pekunden", address: "Jl. Pandanaran No. 88", lat: -6.9855, lng: 110.4134, land: 60, building: 120, w: 5, l: 12, cat: "ruko", facilities: ["listrik", "air", "parkir", "toilet", "gudang", "jalan-utama"], seller: 1, plan: "PRO" },
  { title: "Kios Makanan Siap Pakai Simpang Lima", type: "RENT", price: 30_000_000, city: "Kota Semarang", province: "Jawa Tengah", district: "Semarang Tengah", village: "Mugassari", address: "Jl. Pahlawan No. 21", lat: -6.9906, lng: 110.4229, land: 24, building: 24, w: 4, l: 6, cat: "tempat-kuliner", facilities: ["listrik", "air", "toilet", "parkir"], seller: 1, plan: "PREMIUM", condition: "NEW" },
  { title: "Lapak Pasar Salatiga Blok A", type: "RENT", price: 6_000_000, city: "Kota Salatiga", province: "Jawa Tengah", district: "Sidorejo", village: "Salatiga", address: "Pasar Raya 1 Salatiga Blok A", lat: -7.3305, lng: 110.5084, land: 6, building: 6, w: 2, l: 3, cat: "lapak", facilities: ["listrik", "dekat-pasar"], seller: 2 },
  { title: "Kios Baru Dekat Kampus UKSW Salatiga", type: "SALE", price: 275_000_000, city: "Kota Salatiga", province: "Jawa Tengah", district: "Sidomukti", village: "Kembangarum", address: "Jl. Diponegoro No. 40", lat: -7.3228, lng: 110.4923, land: 14, building: 14, w: 3.5, l: 4, cat: "kios-dijual", facilities: ["listrik", "air", "toilet", "jalan-utama"], seller: 2, condition: "NEW" },
  { title: "Ruko Strategis Jalan Slamet Riyadi Solo", type: "SALE", price: 2_400_000_000, city: "Kota Surakarta", province: "Jawa Tengah", district: "Laweyan", village: "Penumping", address: "Jl. Slamet Riyadi No. 150", lat: -7.5661, lng: 110.8061, land: 72, building: 144, w: 6, l: 12, cat: "ruko", facilities: ["listrik", "air", "parkir", "toilet", "gudang", "jalan-utama"], seller: 0, plan: "PRO" },
  { title: "Kios Disewa Dekat Pasar Gede Solo", type: "RENT", price: 18_000_000, city: "Kota Surakarta", province: "Jawa Tengah", district: "Pasar Kliwon", village: "Sudiroprajan", address: "Jl. Urip Sumoharjo No. 9", lat: -7.5701, lng: 110.8332, land: 18, building: 18, w: 3, l: 6, cat: "kios-disewa", facilities: ["listrik", "air", "dekat-pasar"], seller: 1 },
  { title: "Tempat Usaha Cafe Siap Operasional Jogja", type: "RENT", price: 45_000_000, city: "Kota Yogyakarta", province: "DI Yogyakarta", district: "Gondokusuman", village: "Terban", address: "Jl. Kaliurang Km 1", lat: -7.7771, lng: 110.3777, land: 90, building: 80, w: 8, l: 11, cat: "tempat-usaha", facilities: ["listrik", "air", "parkir", "toilet", "gudang"], seller: 2, plan: "PREMIUM" },
  { title: "Kios Murah Dekat Malioboro Yogyakarta", type: "SALE", price: 520_000_000, city: "Kota Yogyakarta", province: "DI Yogyakarta", district: "Gedongtengen", village: "Sosromenduran", address: "Jl. Pasar Kembang No. 3", lat: -7.7928, lng: 110.3655, land: 16, building: 16, w: 4, l: 4, cat: "kios-dijual", facilities: ["listrik", "air", "jalan-utama"], seller: 1 },
  { title: "Kios Kecil Cocok untuk Konter Ungaran", type: "SALE", price: 120_000_000, city: "Kabupaten Semarang", province: "Jawa Tengah", district: "Ungaran Barat", village: "Gedanganak", address: "Jl. Letjen Suprapto No. 77", lat: -7.1459, lng: 110.3984, land: 6, building: 6, w: 2, l: 3, cat: "kios-dijual", facilities: ["listrik", "jalan-utama"], seller: 0 },
];

async function main() {
  const hash = await bcrypt.hash("password123", 12);

  const cats = [
    { name: "Kios Dijual", slug: "kios-dijual", icon: "🏪" },
    { name: "Kios Disewa", slug: "kios-disewa", icon: "🔑" },
    { name: "Ruko", slug: "ruko", icon: "🏬" },
    { name: "Lapak", slug: "lapak", icon: "🛍️" },
    { name: "Tempat Kuliner", slug: "tempat-kuliner", icon: "🍜" },
    { name: "Tempat Usaha", slug: "tempat-usaha", icon: "🏢" },
  ];
  for (const c of cats) await db.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  const catMap = Object.fromEntries((await db.category.findMany()).map((c) => [c.slug, c.id]));

  await db.user.upsert({
    where: { email: "admin@kiosku.id" },
    update: {},
    create: { name: "Admin KIOSKU", email: "admin@kiosku.id", phone: "081200000000", passwordHash: hash, role: "ADMIN", verifiedStatus: "VERIFIED" },
  });

  const sellerDefs = [
    { name: "Budi Santoso", email: "seller@kiosku.id", phone: "081234567801", verifiedStatus: "VERIFIED" as const },
    { name: "Siti Rahayu", email: "siti@kiosku.id", phone: "081234567802", verifiedStatus: "VERIFIED" as const },
    { name: "Agus Prasetyo", email: "agus@kiosku.id", phone: "081234567803", verifiedStatus: "UNVERIFIED" as const },
  ];
  const sellers = [];
  for (const s of sellerDefs) {
    sellers.push(
      await db.user.upsert({ where: { email: s.email }, update: {}, create: { ...s, passwordHash: hash, role: "SELLER" } }),
    );
  }

  await db.user.upsert({
    where: { email: "user@kiosku.id" },
    update: {},
    create: { name: "Dewi Lestari", email: "user@kiosku.id", phone: "081234567899", passwordHash: hash, role: "USER" },
  });

  if ((await db.listing.count()) === 0) {
    let i = 0;
    for (const l of listings) {
      const plan = l.plan ?? "BASIC";
      const created = await db.listing.create({
        data: {
          sellerId: sellers[l.seller].id,
          categoryId: catMap[l.cat],
          title: l.title,
          slug: `${slugify(l.title)}-${i + 1}`,
          description: `${l.title}. Lokasi strategis dengan akses mudah dan lingkungan ramai, cocok untuk berbagai jenis usaha seperti toko, warung, konter, atau layanan jasa. Dokumen lengkap dan siap dinegosiasikan. Hubungi penjual untuk jadwal survei lokasi.`,
          type: l.type,
          price: BigInt(l.price),
          province: l.province,
          city: l.city,
          district: l.district,
          village: l.village,
          address: l.address,
          latitude: l.lat,
          longitude: l.lng,
          landArea: l.land,
          buildingArea: l.building,
          width: l.w,
          length: l.l,
          floor: l.building > 60 ? 2 : 1,
          yearBuilt: 2015 + (i % 9),
          electricity: "2200 VA",
          water: "PDAM",
          condition: l.condition ?? "USED",
          facilities: l.facilities,
          status: "PUBLISHED",
          featured: plan === "PRO",
          plan,
          planUntil: plan === "BASIC" ? null : new Date(Date.now() + 30 * 86400000),
          views: 20 + i * 17,
          images: {
            create: [0, 1, 2].map((k) => ({ url: IMG[(i + k) % IMG.length], isPrimary: k === 0, position: k })),
          },
        },
      });
      i++;
      void created;
    }
    // satu listing menunggu verifikasi agar panel admin tidak kosong
    await db.listing.create({
      data: {
        sellerId: sellers[2].id,
        categoryId: catMap["kios-dijual"],
        title: "Kios Baru Menunggu Verifikasi Salatiga",
        slug: "kios-baru-menunggu-verifikasi-salatiga",
        description: "Listing contoh dengan status PENDING untuk menguji alur moderasi admin pada KIOSKU.",
        type: "SALE", price: BigInt(180_000_000), province: "Jawa Tengah", city: "Kota Salatiga",
        district: "Argomulyo", address: "Jl. Osamaliki No. 2", landArea: 10, buildingArea: 10,
        facilities: ["listrik", "air"], status: "PENDING",
        images: { create: [{ url: IMG[0], isPrimary: true, position: 0 }] },
      },
    });
  }

  const buyer = await db.user.findUniqueOrThrow({ where: { email: "user@kiosku.id" } });
  const first = await db.listing.findFirst({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "asc" } });
  if (first) {
    await db.favorite.upsert({
      where: { userId_listingId: { userId: buyer.id, listingId: first.id } },
      update: {},
      create: { userId: buyer.id, listingId: first.id },
    });
    const conv = await db.conversation.upsert({
      where: { listingId_buyerId: { listingId: first.id, buyerId: buyer.id } },
      update: {},
      create: { listingId: first.id, buyerId: buyer.id, sellerId: first.sellerId },
    });
    if ((await db.message.count({ where: { conversationId: conv.id } })) === 0) {
      await db.message.createMany({
        data: [
          { conversationId: conv.id, senderId: buyer.id, body: "Halo, apakah kios ini masih tersedia?" },
          { conversationId: conv.id, senderId: first.sellerId, body: "Masih tersedia." },
        ],
      });
    }
  }

  console.log("Seed selesai.");
  console.log("Admin : admin@kiosku.id / password123");
  console.log("Seller: seller@kiosku.id / password123");
  console.log("User  : user@kiosku.id / password123");
}

main().finally(() => db.$disconnect());
