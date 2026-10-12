export function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-extrabold">{title}</h1>
      <div className="space-y-4 leading-relaxed text-navy-500 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-navy">
        {children}
      </div>
    </div>
  );
}
