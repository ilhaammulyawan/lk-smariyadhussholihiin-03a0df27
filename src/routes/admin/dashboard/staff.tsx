import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/staff")({ component: AdminStaff });

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

const EMPTY = { name: "", position: "", role: "pengurus", greeting: "", photo_url: "", sort_order: 0, active: true };

function AdminStaff() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<StaffRow> | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => (await supabase.from("staff").select("*").order("sort_order")).data ?? [],
  });

  const save = async () => {
    if (!editing?.name || !editing?.position) return toast.error("Nama & posisi wajib diisi");
    const payload = {
      name: editing.name!,
      position: editing.position!,
      role: editing.role ?? "pengurus",
      greeting: editing.greeting || null,
      photo_url: editing.photo_url || null,
      sort_order: editing.sort_order ?? 0,
      active: editing.active ?? true,
    };
    const op = editing.id
      ? supabase.from("staff").update(payload).eq("id", editing.id)
      : supabase.from("staff").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Disimpan");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-staff"] });
    qc.invalidateQueries({ queryKey: ["staff", "head"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus staff ini?")) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-staff"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Manajemen Staff</h1>
          <p className="text-muted-foreground">Kelola data kepala lab & pengurus.</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="size-4 mr-1" /> Tambah Staff
        </Button>
      </div>

      {editing && (
        <div className="p-6 rounded-2xl bg-surface/60 border border-border mb-6 grid gap-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">{editing.id ? "Edit Staff" : "Tambah Staff"}</h2>
            <Button size="icon" variant="ghost" onClick={() => setEditing(null)}><X className="size-4" /></Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nama *"><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Jabatan / Posisi *"><Input value={editing.position ?? ""} onChange={(e) => setEditing({ ...editing, position: e.target.value })} /></Field>
            <Field label="Role">
              <Select value={editing.role ?? "pengurus"} onValueChange={(v) => setEditing({ ...editing, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kepala">Kepala Lab</SelectItem>
                  <SelectItem value="pengurus">Pengurus</SelectItem>
                  <SelectItem value="teknisi">Teknisi</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Urutan Tampil"><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: +e.target.value })} /></Field>
            <Field label="URL Foto" full><Input value={editing.photo_url ?? ""} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} placeholder="https://..." /></Field>
            <Field label="Sambutan (untuk Kepala Lab)" full>
              <Textarea rows={3} value={editing.greeting ?? ""} onChange={(e) => setEditing({ ...editing, greeting: e.target.value })} />
            </Field>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
              <Label className="text-sm">Aktif (tampil di publik)</Label>
            </div>
          </div>
          <Button onClick={save}>Simpan</Button>
        </div>
      )}

      <div className="grid gap-3">
        {data?.map((s) => (
          <div key={s.id} className="p-4 rounded-xl bg-surface/60 border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="size-12 rounded-full bg-gradient-to-br from-brand to-accent2 grid place-items-center text-white font-bold shrink-0 overflow-hidden">
                {s.photo_url ? <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" /> : s.name[0]}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{s.name} {!s.active && <span className="text-xs text-muted-foreground">(nonaktif)</span>}</div>
                <div className="text-sm text-muted-foreground truncate">{s.position} · {s.role}</div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => setEditing(s)}><Pencil className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
        {data && data.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">Belum ada staff. Klik "Tambah Staff" di atas.</p>}
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`grid gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
