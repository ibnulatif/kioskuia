import Link from "next/link";

export function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <Link href="/" className={`font-extrabold tracking-tight ${className}`} aria-label="KIOSKU">
      <span className="text-navy">KIOS</span>
      <span className="text-brand">KU</span>
    </Link>
  );
}
