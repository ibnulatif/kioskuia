# KIOSKU

**Temukan tempat, mulai usaha.**

Marketplace jual-beli dan sewa kios, toko kecil, ruko, lapak, dan tempat usaha di Indonesia.
Dibangun dengan Next.js (App Router), React, TypeScript, Tailwind CSS, PostgreSQL, dan Prisma.

## Requirements

- Node.js 20 atau lebih baru
- PostgreSQL 14+ (atau Docker, lihat di bawah)
- npm

## Installation

```bash
npm install
cp .env.example .env
```

Isi `.env`. Untuk menjalankan secara lokal cukup `DATABASE_URL` dan `NEXTAUTH_SECRET`
(buat dengan `openssl rand -base64 32`).

## Environment variables

| Variabel | Fungsi | Wajib |
|---|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL | Ya |
| `NEXTAUTH_SECRET` | Kunci penandatangan sesi (JWT cookie) | Ya (produksi) |
| `NEXT_PUBLIC_APP_URL` | URL publik situs (SEO, sitemap, OAuth) | Disarankan |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login/Daftar dengan Google | Opsional |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps Embed API; tanpa ini peta memakai embed publik | Opsional |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Penyimpanan foto & video | Wajib di Vercel |
| `MIDTRANS_SERVER_KEY` / `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Pembayaran paket promosi | Opsional |
| `CRON_SECRET` | Melindungi endpoint cron `/api/cron/expiring` | Produksi |

## Database setup

Dengan Docker:

```bash
docker compose up -d
```

`DATABASE_URL` bawaan di `.env.example` sudah cocok dengan `docker-compose.yml`.

## Prisma migration

```bash
npx prisma migrate dev --name init   # membuat migrasi + menerapkannya
# atau untuk prototipe cepat:
npm run db:push
```

Produksi: `npx prisma migrate deploy`.

## Seed

```bash
npm run db:seed
```

Membuat 1 admin, 3 seller, 1 user, 6 kategori, 10 listing terbit (Ungaran, Semarang, Salatiga,
Solo, Yogyakarta), 1 listing PENDING, serta contoh favorit dan chat. Gambar placeholder dari Unsplash
hanya untuk development.

### Akun demo

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@kiosku.id` | `password123` |
| Seller | `seller@kiosku.id` | `password123` |
| User | `user@kiosku.id` | `password123` |

Ganti/hapus akun ini sebelum produksi.

## Development

```bash
npm run dev
```

Buka http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

Type-check terpisah: `npm run typecheck`.

## Deployment (Vercel)

1. Push repo ke GitHub, import di Vercel.
2. Buat database PostgreSQL (Vercel Postgres, Neon, Supabase) dan isi `DATABASE_URL`.
3. Isi semua environment variable di atas, termasuk Cloudinary (filesystem Vercel tidak persisten).
4. Jalankan migrasi: `npx prisma migrate deploy` (mis. dari lokal dengan `DATABASE_URL` produksi).
5. `vercel.json` sudah mendaftarkan cron harian `/api/cron/expiring`; set `CRON_SECRET`.

## PostgreSQL

Skema ada di `prisma/schema.prisma`. Indeks tersedia pada status, kota, jenis, harga, seller, dan paket
promosi untuk pencarian cepat. Pencarian memakai `ILIKE` (`contains` + `mode: insensitive`); untuk volume
besar pertimbangkan Postgres full-text search atau trigram index.

## Storage

`/api/upload` memvalidasi tipe (JPG/PNG/WEBP, MP4/WEBM) dan ukuran (foto 5 MB, video 40 MB), lalu
mengunggah ke Cloudinary bila kunci diisi. Tanpa Cloudinary, file disimpan ke `public/uploads`
**hanya untuk development**.

## Google Maps

Isi `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (aktifkan *Maps Embed API*, batasi key per domain). Koordinat tidak
pernah ditampilkan ke pengunjung; hanya dipakai untuk peta.

## Google OAuth

Buat OAuth Client (Web) di Google Cloud Console. Authorized redirect URI:
`{NEXT_PUBLIC_APP_URL}/api/auth/google/callback`.

## Midtrans

Gunakan Server Key sandbox (`SB-Mid-server-...`) untuk uji. Atur *Payment Notification URL* di dashboard
Midtrans ke `{NEXT_PUBLIC_APP_URL}/api/payments/notify`. Webhook memverifikasi signature SHA-512.
Tanpa `MIDTRANS_SERVER_KEY`, paket promosi langsung aktif (mode development).

## Fitur

Homepage, pencarian dengan filter/sort/pagination (debounce, bottom sheet di mobile), detail listing
(galeri zoom/swipe, peta, JSON-LD `RealEstateListing`, URL SEO `/kios-dijual/{kota}/{slug}`), favorit,
chat (polling 3 detik), WhatsApp, laporan listing, registrasi/login, dashboard seller (wizard 5 langkah,
edit, tandai terjual/tersewa, promosi, verifikasi penjual), panel admin (statistik & grafik, moderasi
listing, verifikasi penjual, pengguna, laporan, transaksi, kategori), notifikasi, review (hanya setelah
transaksi valid), audit log, sitemap & robots.

## Keterbatasan yang perlu diketahui

- Rate limiting bersifat in-memory (per instance); gunakan Redis/Upstash untuk produksi multi-instance.
- Chat memakai polling, bukan WebSocket.
- Kelola banner dan pengeditan paket promosi dari admin belum ada UI (model `Banner` sudah ada di skema).
  Harga paket ada di `lib/utils.ts` (`PLANS`).
- OTP WhatsApp (opsional di spesifikasi) belum diimplementasikan.
- Antarmuka untuk menulis review belum ada; endpoint `POST /api/reviews` dan tampilan ulasan sudah ada.
- Lupa password belum otomatis; halaman Bantuan mengarahkan ke kontak.
