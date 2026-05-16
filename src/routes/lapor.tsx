import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/lapor")({ component: Lapor });

const CATEGORIES = ["Kerusakan Perangkat", "Kehilangan", "Pelanggaran", "Saran", "Lainnya"];

function Lapor() {
  const [form, setForm] = useState({ student_name: "", class: "", category: "", content: "" });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_name || !form.class || !form.category || !form.content) {
      toast.error("Lengkapi semua field wajib");
      return;
    }
    setSubmitting(true);
    let photo_url: string | null = null;
    if (file) {
      const path = `reports/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("public-files").upload(path, file);
      if (!upErr) {
        const { data } = supabase.storage.from("public-files").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
    }
    const { data, error } = await supabase.from("reports").insert({ ...form, photo_url, status: "baru" }).select("ticket_number").maybeSingle();
    setSubmitting(false);
    if (error) { toast.error("Gagal mengirim laporan: " + error.message); return; }
    setTicket(data?.ticket_number ?? "-");
  };

  if (ticket) {
    return (
      <SiteLayout>
        <section className="max-w-xl mx-auto px-6 py-24 text-center">
          <CheckCircle2 className="size-16 text-brand mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold mb-2">Laporan Terkirim</h1>
          <p className="text-muted-foreground mb-6">Terima kasih, laporan Anda akan ditinjau oleh admin lab.</p>
          <div className="p-6 rounded-2xl bg-surface/60 border border-border mb-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Nomor Tiket</div>
            <div className="text-2xl font-mono font-bold text-brand">{ticket}</div>
          </div>
          <Button onClick={() => { setTicket(null); setForm({ student_name: "", class: "", category: "", content: "" }); setFile(null); }}>Buat laporan lain</Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Layanan Siswa" title="Lapor Siswa" desc="Sampaikan kendala perangkat, kehilangan, atau saran perbaikan lab. Tanpa perlu login." />
      <section className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={submit} className="p-6 md:p-8 rounded-3xl bg-surface/60 border border-border grid gap-5">
          <Field label="Nama Siswa *"><Input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} /></Field>
          <Field label="Kelas *">
            <Select value={form.class} onValueChange={(v) => setForm({ ...form, class: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
              <SelectContent>{CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Kategori Laporan *">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Isi Laporan *"><Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Jelaskan kejadian secara singkat..." /></Field>
          <Field label="Foto / Bukti (opsional)">
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
          <Button type="submit" disabled={submitting} className="mt-2">{submitting ? "Mengirim..." : "Kirim Laporan"}</Button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div>);
}
