import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Ticket, Calendar } from "lucide-react";
import { formatDateID } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/cek-status")({
  head: () => ({
    meta: [
      { title: "Cek Status — Lab Komputer SMA Riyadhussholihiin" },
      { name: "description", content: "Cek status laporan kerusakan atau booking lab dengan nomor tiket atau nomor WhatsApp." },
    ],
  }),
  component: CekStatus,
});

type ResultItem =
  | { kind: "report"; ticket: string; status: string; created_at: string; category: string; content: string; admin_notes: string | null }
  | { kind: "booking"; status: string; date: string; start_time: string; end_time: string; subject: string; teacher_name: string };

function CekStatus() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (q.length < 3) {
      toast.error("Masukkan minimal 3 karakter");
      return;
    }
    setLoading(true);
    setSearched(true);
    const out: ResultItem[] = [];

    // Cari laporan via nomor tiket (RLS blok read laporan, jadi pakai RPC pendek: query by ticket dengan select kolom aman)
    // Karena SELECT pada reports butuh admin, kita pakai pendekatan publik: cari di bookings via WA.
    // Untuk laporan, gunakan endpoint terbatas via .select() dengan filter ticket_number — tapi RLS hanya admin.
    // Solusi pragmatis: tambah path search via WA di bookings (publik bisa SELECT).

    // 1. Booking by teacher_wa atau teacher_name (via RPC aman — tidak expose teacher_wa)
    const { data: bookings } = await supabase.rpc("lookup_bookings", { _q: q });

    bookings?.forEach((b) =>
      out.push({
        kind: "booking",
        status: b.status,
        date: b.date,
        start_time: b.start_time,
        end_time: b.end_time,
        subject: b.subject,
        teacher_name: b.teacher_name,
      })
    );

    setResults(out);
    setLoading(false);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Status"
        title="Cek Status Booking"
        desc="Pantau status booking lab Anda — masukkan nomor WhatsApp atau nama yang dipakai saat booking."
      />

      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="p-6 md:p-8 rounded-3xl bg-surface/60 border border-border">
          <Label className="text-xs">Nomor WhatsApp / Nama Guru</Label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="08xxx atau nama..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="size-4 mr-2" /> {loading ? "Mencari..." : "Cek"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <Ticket className="size-3 inline mr-1" />
            Untuk status <strong>laporan kerusakan</strong>, hubungi admin lab via WhatsApp dengan menyebutkan nomor tiket Anda.
          </p>
        </div>

        {searched && (
          <div className="mt-8 grid gap-3">
            {results.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-12 text-sm">
                Tidak ada hasil ditemukan untuk "{query}".
              </p>
            )}
            {results.map((r, i) => (
              <ResultCard key={i} item={r} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function ResultCard({ item }: { item: ResultItem }) {
  if (item.kind === "booking") {
    const tone =
      item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary";
    const label =
      item.status === "approved" ? "DISETUJUI" : item.status === "rejected" ? "DITOLAK" : "MENUNGGU";
    return (
      <div className="p-5 rounded-2xl bg-surface/60 border border-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="text-xs font-bold uppercase tracking-widest text-brand inline-flex items-center gap-1.5">
            <Calendar className="size-3" /> Booking Lab
          </div>
          <Badge variant={tone}>{label}</Badge>
        </div>
        <div className="font-semibold">{item.teacher_name} · <span className="text-muted-foreground font-normal">{item.subject}</span></div>
        <div className="text-sm text-muted-foreground mt-1">
          {formatDateID(item.date)} · {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
        </div>
      </div>
    );
  }
  return null;
}
