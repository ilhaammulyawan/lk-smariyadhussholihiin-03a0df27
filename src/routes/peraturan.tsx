import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/peraturan")({ component: Peraturan });

const LABELS: Record<string, string> = {
  peraturan: "Peraturan Umum",
  tata_tertib: "Tata Tertib",
  sanksi: "Sanksi",
};

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
      <PageHeader eyebrow="Tata Tertib" title="Peraturan & Tata Tertib" desc="Pedoman penggunaan Lab Komputer SMA Riyadhussholihiin." />
      <section className="max-w-3xl mx-auto px-6 py-12">
        <Accordion type="multiple" defaultValue={data?.map((d) => d.id) ?? []}>
          {data?.map((r) => (
            <AccordionItem key={r.id} value={r.id} className="border-border">
              <AccordionTrigger className="text-left text-base font-semibold">
                <span>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand mr-3">{LABELS[r.type] ?? r.type}</span>
                  {r.title}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{r.content}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
