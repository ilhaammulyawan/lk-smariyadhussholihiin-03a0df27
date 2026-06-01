import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/settings";
import { formatDateID, formatTime, toISODate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/booking")({ component: Booking });

// KBM 07:40–12:40, istirahat 10:00–10:30 (tidak ada slot)
const SLOTS = [
  { start: "07:40", end: "08:50" },
  { start: "08:50", end: "10:00" },
  { start: "10:30", end: "11:40" },
  { start: "11:40", end: "12:40" },
];

const STEPS = ["Pilih Tanggal", "Pilih Jam", "Data & Keperluan", "Konfirmasi"];

function Booking() {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<string>("");
  const [slot, setSlot] = useState<{ start: string; end: string } | null>(null);
  const [form, setForm] = useState({ teacher_name: "", teacher_wa: "", subject: "", student_count: 0, notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: tik } = useQuery({
    queryKey: ["tik"],
    queryFn: async () => (await supabase.from("tik_schedule").select("*").eq("active", true)).data ?? [],
  });
  const { data: blocked } = useQuery({
    queryKey: ["blocked"],
    queryFn: async () => (await supabase.from("blocked_dates").select("date,reason")).data ?? [],
  });
  const { data: upcomingBookings } = useQuery({
    queryKey: ["bookings", "upcoming"],
    queryFn: async () => {
      const todayIso = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("bookings")
        .select("date,start_time")
        .gte("date", todayIso)
        .in("status", ["pending", "approved"]);
      return data ?? [];
    },
  });
  const { data: dayBookings } = useQuery({
    queryKey: ["bookings", date],
    enabled: !!date,
    queryFn: async () => (await supabase.from("bookings").select("start_time").eq("date", date).in("status", ["pending", "approved"])).data ?? [],
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + 30);

  const availableDates = () => {
    const out: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const dow = d.getDay();
      // Jumat libur (tidak ada KBM)
      if (dow === 5) continue;
      const iso = toISODate(d);
      if (blocked?.some((b) => b.date === iso)) continue;
      out.push(d);
    }
    return out;
  };

  const isSlotBlocked = (s: { start: string; end: string }) => {
    if (!date) return true;
    const d = new Date(date);
    const dow = d.getDay() === 0 ? 7 : d.getDay(); // 1-6
    if (tik?.some((t) => t.day_of_week === dow && t.start_time.slice(0, 5) === s.start)) return "tik";
    if (dayBookings?.some((b) => b.start_time.slice(0, 5) === s.start)) return "booked";
    return null;
  };

  const submit = async () => {
    if (!date || !slot) return;
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      date,
      start_time: slot.start,
      end_time: slot.end,
      teacher_name: form.teacher_name,
      teacher_wa: form.teacher_wa,
      subject: form.subject,
      student_count: form.student_count,
      notes: form.notes || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Gagal mengirim booking: " + error.message);
      return;
    }
    toast.success("Booking tersimpan, mengarahkan ke WhatsApp...");
    const { data: adminWa } = await supabase.rpc("get_public_admin_wa");
    const msg =
      `Halo Admin Lab, saya ${form.teacher_name} ingin booking Lab Komputer:%0A` +
      `📅 ${formatDateID(date)}%0A🕐 ${slot.start} - ${slot.end}%0A` +
      `📚 ${form.subject}%0A👥 ${form.student_count} siswa%0A📱 ${form.teacher_wa}%0A` +
      `Mohon konfirmasinya. Terima kasih.`;
    setTimeout(() => {
      window.location.href = `https://wa.me/${adminWa}?text=${msg}`;
    }, 800);
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="Booking" title="Booking Lab Komputer" desc="Reservasi ruangan lab dalam beberapa langkah mudah." />

      <section className="max-w-3xl mx-auto px-6 py-12">
        {/* Stepper */}
        <ol className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1 flex items-center gap-2">
              <div className={`size-8 rounded-full grid place-items-center text-xs font-bold border ${
                i < step ? "bg-brand border-brand text-white" :
                i === step ? "bg-brand/20 border-brand text-brand" :
                "border-border text-muted-foreground"}`}>
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden md:inline ${i === step ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-brand" : "bg-border"}`} />}
            </li>
          ))}
        </ol>

        <div className="p-6 md:p-8 rounded-3xl bg-surface/60 border border-border">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-display font-bold mb-1">Pilih Tanggal</h2>
              <p className="text-sm text-muted-foreground mb-6">Senin–Ahad, maksimal 30 hari ke depan. Angka kecil = jumlah slot terpakai.</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {availableDates().map((d) => {
                  const iso = toISODate(d);
                  const isSel = date === iso;
                  const dow = d.getDay() === 0 ? 7 : d.getDay();
                  const tikCount = tik?.filter((t) => t.day_of_week === dow).length ?? 0;
                  const bookedCount = upcomingBookings?.filter((b) => b.date === iso).length ?? 0;
                  const used = tikCount + bookedCount;
                  const free = SLOTS.length - used;
                  const isFull = free <= 0;
                  return (
                    <button
                      key={iso}
                      disabled={isFull}
                      onClick={() => setDate(iso)}
                      className={`relative p-3 rounded-xl border text-center text-sm transition-colors ${
                        isFull ? "border-border bg-muted/20 text-muted-foreground cursor-not-allowed" :
                        isSel ? "bg-brand text-white border-brand" : "border-border hover:border-brand/50"}`}
                    >
                      <div className="text-[10px] uppercase tracking-widest opacity-70">
                        {new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(d)}
                      </div>
                      <div className="font-bold">{d.getDate()}</div>
                      <div className="text-[10px] opacity-70">{new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d)}</div>
                      <div className={`mt-1 text-[9px] font-bold uppercase tracking-wider ${
                        isFull ? "text-destructive" : free <= 1 ? "text-yellow-500" : isSel ? "text-white/90" : "text-brand"
                      }`}>
                        {isFull ? "Penuh" : `${free} slot`}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" /> Tersedia</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-yellow-500" /> Hampir penuh</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-destructive" /> Penuh / Libur</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-display font-bold mb-1">Pilih Jam</h2>
              <p className="text-sm text-muted-foreground mb-6">Slot abu-abu tidak tersedia.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {SLOTS.map((s) => {
                  const blockedKind = isSlotBlocked(s);
                  const sel = slot?.start === s.start;
                  return (
                    <button
                      key={s.start}
                      disabled={!!blockedKind}
                      onClick={() => setSlot(s)}
                      className={`p-4 rounded-xl border text-left text-sm transition-colors ${
                        blockedKind ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed" :
                        sel ? "border-brand bg-brand/10" : "border-border hover:border-brand/50"}`}
                    >
                      <div className="font-mono font-bold">{s.start} – {s.end}</div>
                      <div className="text-xs mt-1">
                        {blockedKind === "tik" ? "Jam TIK" : blockedKind === "booked" ? "Sudah dibooking" : "Tersedia"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-display font-bold mb-1">Data Guru & Keperluan</h2>
              <p className="text-sm text-muted-foreground mb-6">Lengkapi data berikut untuk konfirmasi.</p>
              <div className="grid gap-4">
                <Field label="Nama Guru *"><Input value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} /></Field>
                <Field label="Nomor WA Guru *"><Input value={form.teacher_wa} onChange={(e) => setForm({ ...form, teacher_wa: e.target.value })} placeholder="08xxx" /></Field>
                <Field label="Mata Pelajaran / Keperluan *"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
                <Field label="Jumlah Siswa"><Input type="number" min={0} value={form.student_count} onChange={(e) => setForm({ ...form, student_count: +e.target.value })} /></Field>
                <Field label="Catatan (opsional)"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-display font-bold mb-1">Konfirmasi Booking</h2>
              <p className="text-sm text-muted-foreground mb-6">Periksa ulang sebelum mengirim ke admin.</p>
              <dl className="grid gap-3 text-sm">
                <Row label="Tanggal" value={date ? formatDateID(date) : "-"} />
                <Row label="Jam" value={slot ? `${slot.start} – ${slot.end}` : "-"} />
                <Row label="Nama Guru" value={form.teacher_name} />
                <Row label="No. WA" value={form.teacher_wa} />
                <Row label="Keperluan" value={form.subject} />
                <Row label="Jumlah Siswa" value={String(form.student_count)} />
                {form.notes && <Row label="Catatan" value={form.notes} />}
              </dl>
              <p className="text-xs text-muted-foreground mt-6">
                Setelah konfirmasi, Anda akan diarahkan ke WhatsApp admin untuk konfirmasi langsung. Status booking: <span className="font-bold text-yellow-400">PENDING</span> sampai disetujui admin.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ChevronLeft className="size-4 mr-1" /> Kembali
            </Button>
            {step < 3 ? (
              <Button
                disabled={(step === 0 && !date) || (step === 1 && !slot) || (step === 2 && (!form.teacher_name || !form.teacher_wa || !form.subject))}
                onClick={() => setStep(step + 1)}
              >
                Lanjut <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button disabled={submitting} onClick={submit}>
                {submitting ? "Mengirim..." : "Konfirmasi & Kirim ke WhatsApp"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div>);
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
