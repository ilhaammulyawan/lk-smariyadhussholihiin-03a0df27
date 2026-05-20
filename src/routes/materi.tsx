import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { BookOpen, ExternalLink, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/materi")({ component: MateriPage });

function MateriPage() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("settings").select("*")).data ?? [],
  });
  const map: Record<string, string> = {};
  (settings ?? []).forEach((r: any) => { map[r.key] = r.value ?? ""; });
  const url = map.materi_url || "https://informatika.pages.dev";
  const title = map.materi_title || "Kelas Informatika";
  const desc = map.materi_desc || "Akses seluruh materi pelajaran Informatika SMA Riyadhussholihiin lengkap dengan modul, latihan, dan referensi belajar.";

  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Materi Pelajaran
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4">Materi Informatika</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Materi pelajaran tersedia di portal khusus. Klik kartu di bawah untuk mulai belajar.
          </p>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand/60 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">{title}</h2>
              <p className="text-muted-foreground mt-2">{desc}</p>
            </div>
            <div className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-brand text-white font-semibold group-hover:gap-3 transition-all">
              Buka <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </a>
      </section>
    </SiteLayout>
  );
}
