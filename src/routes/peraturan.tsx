import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ShieldCheck,
  BookOpenCheck,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/peraturan")({ component: Peraturan });

type SectionTone = {
  label: string;
  icon: LucideIcon;
  badge: string; // pill bg/text
  border: string; // accordion left border
  iconWrap: string; // bullet icon background
  iconColor: string;
  bullet: LucideIcon;
};

const TONES: Record<string, SectionTone> = {
  peraturan: {
    label: "Peraturan Umum",
    icon: ShieldCheck,
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    border: "border-l-blue-500",
    iconWrap: "bg-blue-500/10",
    iconColor: "text-blue-600",
    bullet: CheckCircle2,
  },
  tata_tertib: {
    label: "Tata Tertib Penggunaan Komputer",
    icon: BookOpenCheck,
    badge: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    border: "border-l-teal-500",
    iconWrap: "bg-teal-500/10",
    iconColor: "text-teal-600",
    bullet: CheckCircle2,
  },
  sanksi: {
    label: "Sanksi Pelanggaran",
    icon: AlertTriangle,
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    border: "border-l-amber-500",
    iconWrap: "bg-amber-500/10",
    iconColor: "text-amber-600",
    bullet: AlertTriangle,
  },
};

const DEFAULT_TONE: SectionTone = TONES.peraturan;

function Peraturan() {
  const { data } = useQuery({
    queryKey: ["regulations"],
    queryFn: async () => {
      const { data } = await supabase.from("regulations").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-24 left-1/3 w-[420px] h-[300px] bg-brand/15 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-[360px] h-[300px] bg-amber-500/15 blur-[110px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-12 pb-10 sm:pt-14 sm:pb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-widest border border-brand/20">
            <ShieldCheck className="size-3.5" /> Tata Tertib
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-balance">
            Peraturan &amp; Tata Tertib
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty">
            Pedoman penggunaan Lab Komputer SMA Riyadhussholihiin.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 sm:pt-12 pb-16 sm:pb-20">
        <Accordion
          type="multiple"
          defaultValue={data?.map((d) => d.id) ?? []}
          className="space-y-4"
        >
          {data?.map((r) => {
            const tone = TONES[r.type] ?? DEFAULT_TONE;
            const Icon = tone.icon;
            const Bullet = tone.bullet;

            const items = r.content
              .split("\n")
              .map((l: string) =>
                l.replace(/^\s*(\d+\.|[-•*])\s*/, "").trim()
              )
              .filter(Boolean);

            return (
              <AccordionItem
                key={r.id}
                value={r.id}
                className={`bg-card rounded-2xl border border-border border-l-4 ${tone.border} shadow-sm overflow-hidden`}
              >
                <AccordionTrigger className="px-5 sm:px-6 py-4 sm:py-5 hover:no-underline">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 text-left w-full">
                    <span
                      className={`inline-flex items-center justify-center size-10 shrink-0 rounded-xl ${tone.iconWrap} ${tone.iconColor}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${tone.badge} mb-1.5`}
                      >
                        {tone.label}
                      </span>
                      <div className="text-base sm:text-lg font-display font-semibold leading-snug">
                        {r.title}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 sm:px-6 pb-5 sm:pb-6">
                  <ul className="space-y-2.5 pl-0 sm:pl-[3.25rem]">
                    {items.map((line: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm sm:text-[15px] text-muted-foreground"
                      >
                        <span
                          className={`mt-0.5 inline-flex items-center justify-center size-6 shrink-0 rounded-md ${tone.iconWrap} ${tone.iconColor}`}
                        >
                          <Bullet className="size-3.5" />
                        </span>
                        <span className="leading-relaxed pt-0.5 whitespace-pre-line">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
