import Link from "next/link";

export function Pagination({
  page,
  pages,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    sp.set("page", String(p));
    return `${basePath}?${sp}`;
  };
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Halaman">
      {page > 1 && <Link className="btn-outline" href={href(page - 1)}>‹ Sebelumnya</Link>}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-navy-500">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`btn ${n === page ? "bg-brand text-white" : "border border-navy-100"}`}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && <Link className="btn-outline" href={href(page + 1)}>Berikutnya ›</Link>}
    </nav>
  );
}
