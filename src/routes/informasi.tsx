import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/settings";

export const Route = createFileRoute("/informasi")({ component: Informasi });

function Informasi() {
  const { data: info } = useQuery({
    queryKey: ["lab_info"],
    queryFn: async () => {
      const { data } = await supabase.from("lab_info").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  return (
    <SiteLayout>
      <PageHeader eyebrow="Fasilitas" title="Informasi Lab" desc="Spesifikasi perangkat, fasilitas pendukung, dan jam operasional Lab Komputer." />

      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        <Card label="Jumlah Komputer" value={`${s?.lab_total_pc ?? "-"} Unit`} />
        <Card label="Jam Operasional" value={s?.operational_hours ?? "-"} sub={s?.operational_days} />
        <Card label="Koneksi Internet" value={s?.lab_internet ?? "-"} />
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        {info?.map((i) => (
          <div key={i.id} className="p-8 rounded-3xl bg-surface/60 border border-border">
            <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">{i.category}</div>
            <h3 className="text-xl font-display font-bold mb-4">{i.title}</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{i.content}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-6 rounded-2xl bg-surface/60 border border-border">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="text-2xl font-display font-bold text-brand">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
