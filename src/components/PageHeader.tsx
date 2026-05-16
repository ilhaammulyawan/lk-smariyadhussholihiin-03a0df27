export function PageHeader({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
        {eyebrow && (
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">{eyebrow}</div>
        )}
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-balance">{title}</h1>
        {desc && <p className="mt-4 text-lg text-muted-foreground max-w-2xl text-pretty">{desc}</p>}
      </div>
    </section>
  );
}
