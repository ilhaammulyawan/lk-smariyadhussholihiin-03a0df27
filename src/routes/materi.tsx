import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { BookOpen, ExternalLink, Search, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/materi")({
  head: () => ({
    meta: [
      { title: "Materi Informatika — Lab Komputer SMA Riyadhussholihiin" },
      {
        name: "description",
        content:
          "Akses materi pelajaran Informatika untuk santri SMA Riyadhussholihiin. Link materi dikelola oleh guru.",
      },
    ],
  }),
  component: MateriPage,
});

type Material = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  class_level: string;
  category: string;
  sort_order: number;
};

function MateriPage() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<string>("Semua");

  const { data, isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("materials")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      return (data ?? []) as Material[];
    },
  });

  const classes = useMemo(() => {
    const s = new Set<string>(["Semua"]);
    (data ?? []).forEach((m) => s.add(m.class_level));
    return Array.from(s);
  }, [data]);

  const filtered = (data ?? []).filter((m) => {
    if (cls !== "Semua" && m.class_level !== cls) return false;
    if (q && !`${m.title} ${m.description ?? ""} ${m.category}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand/10 via-background to-accent2/10" />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand/20 blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-10 sm:pt-14 sm:pb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/15 text-brand text-xs font-bold uppercase tracking-wider">
            <BookOpen className="size-3.5" /> Materi
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight">
            Materi Pelajaran Informatika
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
            Kumpulan tautan materi, modul, dan sumber belajar Informatika untuk santri. Klik salah satu kartu
            untuk membuka materinya.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari materi..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => setCls(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  cls === c
                    ? "bg-brand text-white border-brand"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-16 text-sm">Memuat materi...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <GraduationCap className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Belum ada materi tersedia.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group block p-5 rounded-2xl bg-card border border-border hover:border-brand/60 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider">
                      {m.class_level}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                      {m.category}
                    </span>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground group-hover:text-brand transition-colors shrink-0" />
                </div>
                <h3 className="font-display font-bold text-lg leading-snug mb-1.5 group-hover:text-brand transition-colors">
                  {m.title}
                </h3>
                {m.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
