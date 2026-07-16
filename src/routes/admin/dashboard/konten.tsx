import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { DEFAULT_PERATURAN, parsePeraturanContent } from "@/lib/peraturan-content";

export const Route = createFileRoute("/admin/dashboard/konten")({ component: AdminKonten });

function AdminKonten() {
  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-1">Manajemen Konten</h1>
      <p className="text-muted-foreground mb-6">Edit konten halaman publik.</p>
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Pengurus</TabsTrigger>
          <TabsTrigger value="lab_info">Info Lab</TabsTrigger>
          <TabsTrigger value="regulations">Peraturan (list)</TabsTrigger>
          <TabsTrigger value="peraturan_page">Halaman /peraturan</TabsTrigger>
        </TabsList>
        <TabsContent value="staff" className="mt-6"><StaffEditor /></TabsContent>
        <TabsContent value="lab_info" className="mt-6"><GenericEditor table="lab_info" fields={["category", "title", "content"]} /></TabsContent>
        <TabsContent value="regulations" className="mt-6"><GenericEditor table="regulations" fields={["type", "title", "content"]} /></TabsContent>
        <TabsContent value="peraturan_page" className="mt-6"><PeraturanPageEditor /></TabsContent>
      </Tabs>
    </div>
  );
}

function PeraturanPageEditor() {
  const qc = useQueryClient();
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "peraturan_content").maybeSingle();
      const parsed = parsePeraturanContent(data?.value);
      setText(JSON.stringify(parsed, null, 2));
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e: any) {
      return toast.error("JSON tidak valid: " + e.message);
    }
    setSaving(true);
    const value = JSON.stringify(parsed);
    const { data: existing } = await supabase.from("settings").select("id").eq("key", "peraturan_content").maybeSingle();
    const res = existing
      ? await supabase.from("settings").update({ value }).eq("id", existing.id)
      : await supabase.from("settings").insert({ key: "peraturan_content", value });
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Konten /peraturan disimpan");
    qc.invalidateQueries({ queryKey: ["peraturan-content"] });
  };

  const reset = () => {
    if (!confirm("Kembalikan ke konten default? Perubahan yang belum disimpan akan hilang.")) return;
    setText(JSON.stringify(DEFAULT_PERATURAN, null, 2));
  };

  return (
    <div className="grid gap-4">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
        <strong>Format JSON.</strong> Edit teks di bawah untuk mengubah hero, kartu peraturan, tabel sistem poin, timeline eskalasi, dan tanda tangan halaman <code>/peraturan</code>.
        Nilai <code>icon</code> yang tersedia: <code>Heart, Monitor, ShieldAlert, Lock, Wrench, AlertTriangle, CheckCircle2, XCircle, Bell, BookOpen, Users, Server, Wifi, Trash2</code>.
        Nilai <code>tier</code>: <code>warn | danger | critical</code>. Nilai <code>tone</code>: <code>green | orange | red</code>.
      </div>
      <Textarea
        value={loading ? "Memuat..." : text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        rows={30}
        className="font-mono text-xs"
        spellCheck={false}
      />
      <div className="flex gap-2">
        <Button onClick={save} disabled={loading || saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
        <Button variant="ghost" onClick={reset} disabled={loading}>Reset ke Default</Button>
      </div>
    </div>
  );
}

function StaffEditor() {
  const qc = useQueryClient();
  const empty = { name: "", position: "", role: "pengurus", greeting: "", sort_order: 0, active: true };
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => (await supabase.from("staff").select("*").order("sort_order")).data ?? [],
  });

  const save = async () => {
    const payload = { ...form };
    let res;
    if (editing) res = await supabase.from("staff").update(payload).eq("id", editing.id);
    else res = await supabase.from("staff").insert(payload);
    if (res.error) return toast.error(res.error.message);
    setEditing(null); setForm(empty);
    qc.invalidateQueries({ queryKey: ["admin-staff"] });
  };

  return (
    <div>
      <div className="p-5 rounded-2xl bg-surface/60 border border-border grid gap-3 mb-6">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Jabatan</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Role (kepala/pengurus)</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Urutan</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
        </div>
        <div className="grid gap-1.5"><Label>Sambutan (untuk kepala lab)</Label><Textarea rows={3} value={form.greeting ?? ""} onChange={(e) => setForm({ ...form, greeting: e.target.value })} /></div>
        <div className="flex gap-2">
          <Button onClick={save}>{editing ? "Update" : "Tambah"}</Button>
          {editing && <Button variant="ghost" onClick={() => { setEditing(null); setForm(empty); }}>Batal</Button>}
        </div>
      </div>
      <div className="grid gap-2">
        {data?.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/40 border border-border text-sm">
            <span><strong>{s.name}</strong> · {s.position} <span className="text-muted-foreground">({s.role})</span></span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setForm(s); }}>Edit</Button>
              <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("staff").delete().eq("id", s.id); qc.invalidateQueries({ queryKey: ["admin-staff"] }); }}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericEditor({ table, fields }: { table: "lab_info" | "regulations"; fields: string[] }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const empty: any = { sort_order: 0 };
  fields.forEach((f) => { empty[f] = ""; });
  const [form, setForm] = useState<any>(empty);

  const { data } = useQuery({
    queryKey: [`admin-${table}`],
    queryFn: async () => (await supabase.from(table).select("*").order("sort_order")).data ?? [],
  });

  const save = async () => {
    let res;
    if (editing) res = await supabase.from(table).update(form).eq("id", editing.id);
    else res = await supabase.from(table).insert(form);
    if (res.error) return toast.error(res.error.message);
    setEditing(null); setForm(empty);
    qc.invalidateQueries({ queryKey: [`admin-${table}`] });
  };

  return (
    <div>
      <div className="p-5 rounded-2xl bg-surface/60 border border-border grid gap-3 mb-6">
        {fields.map((f) => (
          <div key={f} className="grid gap-1.5">
            <Label className="capitalize">{f.replace("_", " ")}</Label>
            {f === "content" ? (
              <Textarea rows={4} value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
            ) : (
              <Input value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Button onClick={save}>{editing ? "Update" : "Tambah"}</Button>
          {editing && <Button variant="ghost" onClick={() => { setEditing(null); setForm(empty); }}>Batal</Button>}
        </div>
      </div>
      <div className="grid gap-2">
        {data?.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/40 border border-border text-sm">
            <span><strong>{s.title}</strong> · <span className="text-muted-foreground">{s.category ?? s.type}</span></span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setForm(s); }}>Edit</Button>
              <Button size="icon" variant="ghost" onClick={async () => { await supabase.from(table).delete().eq("id", s.id); qc.invalidateQueries({ queryKey: [`admin-${table}`] }); }}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
