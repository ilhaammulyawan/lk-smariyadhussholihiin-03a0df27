import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { ROLES, getRoleMeta, type RoleMeta } from "@/lib/staff-roles";
import { Quote } from "lucide-react";

export const Route = createFileRoute("/profil")({ component: Profil });

type StaffRow = {
  id: string;
  name: string;
  position: string;
  role: string;
  greeting: string | null;
  photo_url: string | null;
  sort_order: number;
  active: boolean;
};

function Profil() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: staff } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as StaffRow[];
    },
  });

  const head = staff?.find((s) => s.role === "kepala_lab" || s.role === "kepala");

  // Group by tier
  const byTier = new Map<number, { meta: RoleMeta; people: StaffRow[] }[]>();
  (staff ?? []).forEach((s) => {
    const meta = getRoleMeta(s.role);
    const tier = meta.tier;
    if (!byTier.has(tier)) byTier.set(tier, []);
    const groups = byTier.get(tier)!;
    let g = groups.find((x) => x.meta.label === meta.label);
    if (!g) {
      g = { meta, people: [] };
      groups.push(g);
    }
    g.people.push(s);
  });
  const tiers = Array.from(byTier.entries()).sort(([a], [b]) => a - b);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Tentang Kami"
        title="Profil Lab Komputer"
        desc="Mengenal visi, misi, dan struktur pengelola Lab Komputer SMA Riyadhussholihiin."
      />

      {/* Visi Misi */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-12 grid md:grid-cols-2 gap-6 sm:gap-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-surface/60 border border-border">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-3">Visi</div>
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line">{settings?.visi}</p>
        </div>
        <div className="p-6 sm:p-8 rounded-3xl bg-surface/60 border border-border">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-3">Misi</div>
          <p className="leading-relaxed whitespace-pre-line">{settings?.misi}</p>
        </div>
      </section>

      {/* Sambutan Kepala Lab */}
      {head && (
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-6 sm:py-10">
          <div className="relative p-6 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-br from-brand/10 to-accent2/10 border border-border overflow-hidden">
            <Quote className="absolute top-5 right-5 size-16 sm:size-24 text-brand/10" />
            <div className="text-xs font-bold uppercase tracking-widest text-brand mb-3">Sambutan Kepala Lab</div>
            <blockquote className="text-lg sm:text-2xl md:text-3xl font-display leading-snug text-pretty mb-6 sm:mb-8 relative">
              &ldquo;{head.greeting}&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <Avatar staff={head} size="lg" />
              <div>
                <div className="font-semibold">{head.name}</div>
                <div className="text-sm text-muted-foreground">{head.position}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Struktur Hierarki */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-widest border border-brand/20">
            Struktur Organisasi
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-display font-bold">
            Struktur Kepengurusan
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Hierarki kepengurusan Lab Komputer mulai dari Kepala Sekolah hingga tim IT &amp; Jaringan.
          </p>
        </div>

        {tiers.length === 0 && (
          <p className="text-sm text-muted-foreground py-12 text-center">Data struktur belum tersedia.</p>
        )}

        <div className="space-y-10 sm:space-y-12">
          {tiers.map(([tier, groups], idx) => (
            <div key={tier} className="relative">
              {/* connector line to next tier */}
              {idx < tiers.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute left-1/2 -translate-x-1/2 -bottom-10 sm:-bottom-12 w-px h-10 sm:h-12 bg-gradient-to-b from-border to-transparent"
                />
              )}
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                  Tier {tier}
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {groups.flatMap((g) =>
                  g.people.map((p) => (
                    <PersonCard
                      key={p.id}
                      person={p}
                      featured={tier === 1}
                    />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-border">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Jenjang Peran
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLES.filter((r) => r.key !== "kepala").map((r) => {
              const Icon = r.icon;
              return (
                <span
                  key={r.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-xs"
                >
                  <Icon className={`size-3.5 ${r.accent}`} />
                  {r.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Avatar({ staff, size = "md" }: { staff: StaffRow; size?: "md" | "lg" | "xl" }) {
  const dim = size === "xl" ? "size-28 sm:size-32" : size === "lg" ? "size-14" : "size-20";
  const text = size === "xl" ? "text-3xl" : size === "lg" ? "text-lg" : "text-xl";
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-brand to-accent2 grid place-items-center text-white font-bold ${text} overflow-hidden shrink-0 ring-4 ring-background shadow-md`}
    >
      {staff.photo_url ? (
        <img src={staff.photo_url} alt={staff.name} className="w-full h-full object-cover" />
      ) : (
        staff.name?.[0] ?? "?"
      )}
    </div>
  );
}

function PersonCard({ person, featured }: { person: StaffRow; featured?: boolean }) {
  const meta = getRoleMeta(person.role);
  const Icon = meta.icon;
  return (
    <div
      className={`w-[calc(50%-0.5rem)] sm:w-56 md:w-60 p-5 rounded-2xl bg-card border border-border text-center shadow-sm hover:shadow-md transition-shadow ${
        featured ? "sm:w-72 ring-2 ring-brand/20" : ""
      }`}
    >
      <Avatar staff={person} size={featured ? "xl" : "md"} />
      <div className="mt-3 sm:mt-4 font-semibold text-sm sm:text-base truncate">{person.name}</div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">{person.position}</div>
      <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-[10px] font-semibold uppercase tracking-wider">
        <Icon className={`size-3 ${meta.accent}`} />
        <span className="truncate max-w-[10rem]">{meta.label}</span>
      </div>
    </div>
  );
}
