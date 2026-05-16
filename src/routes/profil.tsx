import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/profil")({ component: Profil });

function Profil() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: staff } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const head = staff?.find((s) => s.role === "kepala");
  const pengurus = staff?.filter((s) => s.role !== "kepala") ?? [];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Tentang Kami" title="Profil Lab Komputer" desc="Mengenal visi, misi, dan struktur pengelola Lab Komputer SMA Riyadhussholihiin." />

      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-surface/60 border border-border">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">Visi</div>
          <p className="text-lg leading-relaxed whitespace-pre-line">{settings?.visi}</p>
        </div>
        <div className="p-8 rounded-3xl bg-surface/60 border border-border">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">Misi</div>
          <p className="leading-relaxed whitespace-pre-line">{settings?.misi}</p>
        </div>
      </section>

      {head && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-brand/10 to-accent2/10 border border-border">
            <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">Sambutan Kepala Lab</div>
            <blockquote className="text-2xl md:text-3xl font-display leading-snug text-pretty mb-8">
              "{head.greeting}"
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-gradient-to-br from-brand to-accent2 grid place-items-center text-white font-bold text-lg">
                {head.name[0]}
              </div>
              <div>
                <div className="font-semibold">{head.name}</div>
                <div className="text-sm text-muted-foreground">{head.position}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Struktur Kepengurusan</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pengurus.map((p) => (
            <div key={p.id} className="p-6 rounded-2xl bg-surface/60 border border-border text-center">
              <div className="size-20 mx-auto rounded-full bg-gradient-to-br from-brand to-accent2 grid place-items-center text-white font-bold text-xl mb-4">
                {p.name[0]}
              </div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{p.position}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
