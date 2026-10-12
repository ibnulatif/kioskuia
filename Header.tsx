import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBell } from "@/components/NotificationBell";

const nav = [
  { href: "/search", label: "Cari Kios" },
  { href: "/search?type=SALE", label: "Jual Kios" },
  { href: "/search?type=RENT", label: "Sewa Kios" },
  { href: "/about", label: "Tentang" },
  { href: "/help", label: "Bantuan" },
];

export async function Header() {
  const session = await getSession();
  const home = session?.role === "ADMIN" ? "/admin" : session?.role === "SELLER" ? "/dashboard" : null;
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-navy-500 lg:flex">
            {nav.map((n) => (
              <Link key={n.label} href={n.href} className="hover:text-brand">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <NotificationBell />
              {home && (
                <Link href={home} className="btn-outline hidden sm:inline-flex">
                  {session.role === "ADMIN" ? "Admin" : "Dashboard"}
                </Link>
              )}
              <span className="hidden text-sm text-navy-500 md:inline">Hai, {session.name.split(" ")[0]}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">Masuk</Link>
              <Link href="/register" className="btn-primary hidden sm:inline-flex">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
