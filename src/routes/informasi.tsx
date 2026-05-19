import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/settings";
import {
  Monitor,
  Clock,
  Wifi,
  Cpu,
  HardDrive,
  MemoryStick,
  MousePointer,
  Keyboard,
  Headphones,
  Projector,
  Snowflake,
  Printer,
  ShieldCheck,
  Plug,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

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
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-brand/20 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-[380px] h-[380px] bg-accent2/20 blur-[110px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-12 pb-10 sm:pt-14 sm:pb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-widest border border-brand/20">
            <span className="size-1.5 rounded-full bg-brand" /> Fasilitas
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-balance">
            Informasi Lab
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty">
            Spesifikasi perangkat, fasilitas pendukung, dan jam operasional Lab Komputer.
          </p>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pt-10 sm:pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            icon={Monitor}
            label="Jumlah Komputer"
            value={`${s?.lab_total_pc ?? "-"}`}
            unit="Unit"
          />
          <StatCard
            icon={Clock}
            label="Jam Operasional"
            value={s?.operational_hours ?? "-"}
            sub={s?.operational_days}
          />
          <StatCard
            icon={Wifi}
            label="Koneksi Internet"
            value={s?.lab_internet ?? "-"}
          />
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
        {info?.map((i) => (
          <InfoCard key={i.id} category={i.category} title={i.title} content={i.content} />
        ))}
      </section>
    </SiteLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="relative p-6 sm:p-7 rounded-2xl bg-card border border-border border-l-4 border-l-brand shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center justify-center size-11 rounded-xl bg-brand/10 text-brand">
          <Icon className="size-5" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-4xl sm:text-5xl font-display font-bold text-foreground leading-none tracking-tight">
          {value}
        </span>
        {unit && <span className="text-base sm:text-lg font-semibold text-brand">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-2">{sub}</div>}
    </div>
  );
}

// Pick icons based on bullet line content (heuristic keyword matching)
const ICON_KEYWORDS: { keys: string[]; icon: LucideIcon }[] = [
  { keys: ["proc", "cpu", "intel", "ryzen", "core"], icon: Cpu },
  { keys: ["ram", "memori", "memory"], icon: MemoryStick },
  { keys: ["ssd", "hdd", "storage", "penyimp", "disk"], icon: HardDrive },
  { keys: ["monitor", "layar", "display", "lcd", "led"], icon: Monitor },
  { keys: ["mouse"], icon: MousePointer },
  { keys: ["keyboard", "papan ketik"], icon: Keyboard },
  { keys: ["headset", "headphone", "audio", "speaker"], icon: Headphones },
  { keys: ["proyektor", "projector"], icon: Projector },
  { keys: ["ac ", "pendingin", "ac,", "air condition"], icon: Snowflake },
  { keys: ["print"], icon: Printer },
  { keys: ["wifi", "internet", "jaringan", "mbps"], icon: Wifi },
  { keys: ["listrik", "stop kontak", "ups", "daya"], icon: Plug },
  { keys: ["cctv", "kamera", "keamanan", "security"], icon: ShieldCheck },
];

function pickIcon(line: string): LucideIcon {
  const l = line.toLowerCase();
  for (const { keys, icon } of ICON_KEYWORDS) {
    if (keys.some((k) => l.includes(k))) return icon;
  }
  return CheckCircle2;
}

function InfoCard({ category, title, content }: { category: string; title: string; content: string }) {
  const lines = content
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  // If content has multiple short lines, render as icon bullet list; otherwise paragraph
  const asList = lines.length >= 2;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest border border-brand/20 mb-3">
        {category}
      </span>
      <h3 className="text-lg sm:text-xl font-display font-bold mb-4">{title}</h3>
      {asList ? (
        <ul className="space-y-2.5">
          {lines.map((line, idx) => {
            const Icon = pickIcon(line);
            return (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] text-muted-foreground">
                <span className="mt-0.5 inline-flex items-center justify-center size-7 shrink-0 rounded-lg bg-brand/10 text-brand">
                  <Icon className="size-3.5" />
                </span>
                <span className="leading-relaxed pt-0.5">{line}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
      )}
    </div>
  );
}
