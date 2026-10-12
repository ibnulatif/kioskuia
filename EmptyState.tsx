import Link from "next/link";

export function EmptyState({
  title,
  text,
  href,
  cta,
}: {
  title: string;
  text?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center">
      <div className="text-4xl">🏪</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="max-w-md text-sm text-navy-500">{text}</p>}
      {href && cta && <Link href={href} className="btn-primary">{cta}</Link>}
    </div>
  );
}
