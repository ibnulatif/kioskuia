import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/about", label: "Tentang KIOSKU" },
  { href: "/help", label: "Cara Kerja" },
  { href: "/help", label: "Pusat Bantuan" },
  { href: "/terms", label: "Syarat & Ketentuan" },
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/safety", label: "Keamanan" },
  { href: "/contact", label: "Kontak" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-navy-100 bg-white pb-24 pt-12 lg:pb-12">
      <div className="container-x grid gap-8 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-navy-500">Temukan tempat, mulai usaha.</p>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-sm text-navy-500">
          {links.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="hover:text-brand">{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className="text-sm text-navy-500">
          <p className="font-semibold text-navy">Ikuti Kami</p>
          <p className="mt-2">Instagram · Facebook · TikTok</p>
        </div>
      </div>
      <p className="container-x mt-10 text-xs text-navy-500">© 2026 KIOSKU. All rights reserved.</p>
    </footer>
  );
}
