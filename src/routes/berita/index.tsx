import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatDateID } from "@/lib/format";

export const Route = createFileRoute("/berita/")({ component: Berita });

function Berita() {
  const { data } = useQuery({
    queryKey: ["posts", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <PageHeader eyebrow="Berita" title="Pengumuman & Berita" desc="Update terbaru kegiatan dan informasi Lab Komputer." />
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.map((p) => (
            <Link key={p.id} to="/berita/$slug" params={{ slug: p.slug }} className="group">
              <div className="aspect-[16/10] rounded-2xl bg-surface border border-border mb-4 overflow-hidden">
                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-muted-foreground uppercase tracking-widest">{p.category}</div>
                )}
              </div>
              <div className="text-xs text-brand font-bold uppercase tracking-widest mb-2">{p.category}</div>
              <h3 className="font-display font-bold text-lg leading-snug group-hover:text-brand transition-colors">{p.title}</h3>
              <div className="text-xs text-muted-foreground mt-2">{formatDateID(p.created_at)}</div>
            </Link>
          ))}
        </div>
        {data && data.length === 0 && <p className="text-center text-muted-foreground py-12">Belum ada berita.</p>}
      </section>
    </SiteLayout>
  );
}
