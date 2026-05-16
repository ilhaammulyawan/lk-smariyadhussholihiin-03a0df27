import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatDateID } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/berita/$slug")({ component: Detail });

function Detail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <SiteLayout><div className="max-w-3xl mx-auto px-6 py-24 text-muted-foreground">Memuat...</div></SiteLayout>;
  if (!data) return null;

  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/berita" className="text-sm text-muted-foreground hover:text-brand inline-flex items-center gap-2 mb-8">
          <ArrowLeft className="size-4" /> Semua Berita
        </Link>
        <div className="text-xs font-bold uppercase tracking-widest text-brand mb-3">{data.category}</div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-balance">{data.title}</h1>
        <div className="text-sm text-muted-foreground mb-8">{formatDateID(data.created_at)}</div>
        {data.cover_url && (
          <img src={data.cover_url} alt={data.title} className="w-full aspect-video object-cover rounded-2xl mb-8 border border-border" />
        )}
        <div className="prose prose-invert max-w-none whitespace-pre-line leading-relaxed text-foreground/90">{data.content}</div>
      </article>
    </SiteLayout>
  );
}
