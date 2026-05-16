import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/jadwal")({ component: AdminJadwal });

const DAYS = [
  { id: 1, name: "Senin" }, { id: 2, name: "Selasa" }, { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" }, { id: 5, name: "Jumat" }, { id: 6, name: "Sabtu" },
];

function AdminJadwal() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ day_of_week: 1, start_time: "07:30", end_time: "09:00", class_name: "" });
  const [blockDate, setBlockDate] = useState({ date: "", reason: "" });

  const { data: tik } = useQuery({
    queryKey: ["admin-tik"],
    queryFn: async () => (await supabase.from("tik_schedule").select("*").order("day_of_week").order("start_time")).data ?? [],
  });
  const { data: blocked } = useQuery({
    queryKey: ["admin-blocked"],
    queryFn: async () => (await supabase.from("blocked_dates").select("*").order("date")).data ?? [],
  });

  const addTik = async () => {
    if (!form.class_name) return toast.error("Isi nama kelas");
    const { error } = await supabase.from("tik_schedule").insert(form);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-tik"] });
    setForm({ ...form, class_name: "" });
  };

  const delTik = async (id: string) => {
    await supabase.from("tik_schedule").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-tik"] });
  };

  const addBlock = async () => {
    if (!blockDate.date) return;
    const { error } = await supabase.from("blocked_dates").insert(blockDate);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-blocked"] });
    setBlockDate({ date: "", reason: "" });
  };

  const delBlock = async (id: string) => {
    await supabase.from("blocked_dates").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-blocked"] });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <section>
        <h2 className="text-2xl font-display font-bold mb-4">Jadwal TIK Permanen</h2>
        <div className="p-4 rounded-xl bg-surface/60 border border-border grid gap-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Hari</Label>
              <Select value={String(form.day_of_week)} onValueChange={(v) => setForm({ ...form, day_of_week: +v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Kelas</Label><Input value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} /></div>
            <div><Label className="text-xs">Mulai</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
            <div><Label className="text-xs">Selesai</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
          </div>
          <Button onClick={addTik}>Tambah Jadwal TIK</Button>
        </div>
        <div className="grid gap-2">
          {tik?.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/40 border border-border text-sm">
              <span>{DAYS.find((d) => d.id === t.day_of_week)?.name} · {t.start_time.slice(0,5)}–{t.end_time.slice(0,5)} · <strong>{t.class_name}</strong></span>
              <Button size="icon" variant="ghost" onClick={() => delTik(t.id)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold mb-4">Tanggal Libur / Blokir</h2>
        <div className="p-4 rounded-xl bg-surface/60 border border-border grid gap-3 mb-4">
          <div className="grid gap-2">
            <Label className="text-xs">Tanggal</Label>
            <Input type="date" value={blockDate.date} onChange={(e) => setBlockDate({ ...blockDate, date: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Alasan</Label>
            <Input value={blockDate.reason} onChange={(e) => setBlockDate({ ...blockDate, reason: e.target.value })} placeholder="Libur nasional, ujian..." />
          </div>
          <Button onClick={addBlock}>Tambah Tanggal Blokir</Button>
        </div>
        <div className="grid gap-2">
          {blocked?.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/40 border border-border text-sm">
              <span>{b.date} · {b.reason}</span>
              <Button size="icon" variant="ghost" onClick={() => delBlock(b.id)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
