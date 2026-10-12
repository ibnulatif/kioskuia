"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Cari", icon: "🔍" },
  { href: "/favorites", label: "Favorit", icon: "❤️" },
  { href: "/messages", label: "Chat", icon: "💬" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((i) => {
          const active = i.href === "/" ? path === "/" : path.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-brand" : "text-navy-500"}`}
              >
                <span className="text-lg leading-none">{i.icon}</span>
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
