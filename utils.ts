export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const formatRupiah = (n: number | bigint) =>
  "Rp" + new Intl.NumberFormat("id-ID").format(Number(n));

export const formatDate = (d: Date | string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

export const formatTime = (d: Date | string) =>
  new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(d));

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const FACILITIES = [
  { key: "parkir", label: "Parkir" },
  { key: "toilet", label: "Toilet" },
  { key: "listrik", label: "Listrik" },
  { key: "air", label: "Air" },
  { key: "gudang", label: "Gudang" },
  { key: "jalan-utama", label: "Pinggir jalan" },
  { key: "dekat-pasar", label: "Dekat pasar" },
] as const;

export const REPORT_REASONS = [
  { value: "FRAUD", label: "Penipuan" },
  { value: "WRONG_PRICE", label: "Harga tidak sesuai" },
  { value: "FAKE_PHOTO", label: "Foto palsu" },
  { value: "FAKE_LOCATION", label: "Lokasi palsu" },
  { value: "SUSPICIOUS_DOCUMENT", label: "Dokumen mencurigakan" },
  { value: "OTHER", label: "Lainnya" },
] as const;

export const PLANS = {
  BASIC: { name: "BASIC", price: 0, days: 0, perks: ["Listing standar", "Tampil di pencarian"] },
  PREMIUM: {
    name: "PREMIUM",
    price: 49000,
    days: 14,
    perks: ["Posisi lebih tinggi", "Badge premium", "Tampil di rekomendasi"],
  },
  PRO: {
    name: "PRO",
    price: 99000,
    days: 30,
    perks: ["Posisi teratas", "Tampil di homepage", "Badge premium", "Prioritas pencarian"],
  },
} as const;

export const listingPath = (l: { slug: string; type: string; city: string }) =>
  `/${l.type === "SALE" ? "kios-dijual" : "kios-disewa"}/${slugify(l.city)}/${l.slug}`;

export const typeLabel = (t: string) => (t === "SALE" ? "Dijual" : "Disewa");

export const waLink = (phone: string | null | undefined, title: string) => {
  const digits = (phone ?? "").replace(/\D/g, "").replace(/^0/, "62");
  const text = `Halo, saya melihat listing ${title} di KIOSKU dan tertarik. Apakah masih tersedia?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};
