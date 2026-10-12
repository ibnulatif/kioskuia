export function BarChart({ title, data, format }: { title: string; data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-bold">{title}</h3>
      <div className="flex h-40 items-end gap-2" role="img" aria-label={title}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] text-navy-500">{format ? format(d.value) : d.value}</span>
            <div className="w-full rounded-t-md bg-brand" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
            <span className="text-[10px] text-navy-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
