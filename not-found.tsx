import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="container-x py-16">
      <EmptyState title="Halaman tidak ditemukan" text="Halaman atau listing yang Anda cari tidak tersedia." href="/search" cta="Cari Kios" />
    </div>
  );
}
