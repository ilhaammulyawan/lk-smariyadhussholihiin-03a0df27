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
import { Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/berita")({ component: AdminBerita });

const CATS = ["Pengumuman", "Kegiatan", "Prestasi"];

function AdminBerita() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const empty = { title: "", slug: "", content: "", excerpt: "", category: "Pengumuman", published: true, cover_url: "" };
  const [form, setForm] = useState<any>(empty);

  const { data } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => (await supabase.from("posts").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const save = async () => {
    if (!form.title || !form.content) return toast.error("Judul dan konten wajib");
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = { ...form, slug };
    let res;
    if (editing) res = await supabase.from("posts").update(payload).eq("id", editing.id);
    else res = await supabase.from("posts").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Tersimpan");
    setEditing(null); setForm(empty);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  const edit = (p: any) => { setEditing(p); setForm(p); };
  const del = async (id: string) => {
    if (!confirm("Hapus berita ini?")) return;
    await supabase.from("posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-1">Manajemen Berita</h1>
      <p className="text-muted-foreground mb-6">Tambah, ubah, atau hapus pengumuman.</p>

      <div className="p-5 rounded-2xl bg-surface/60 border border-border grid gap-4 mb-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5"><Label>Judul</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Slug (opsional)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Kategori</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Cover URL (opsional)</Label><Input value={form.cover_url ?? ""} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></div>
        </div>
        <div className="grid gap-1.5"><Label>Ringkasan</Label><Input value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
        <div className="grid gap-1.5"><Label>Isi</Label><Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
        <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Terbitkan</Label></div>
        <div className="flex gap-2">
          <Button onClick={save}>{editing ? "Update" : "Tambah"} Berita</Button>
          {editing && <Button variant="ghost" onClick={() => { setEditing(null); setForm(empty); }}>Batal</Button>}
        </div>
      </div>

      <div className="grid gap-2">
        {data?.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/40 border border-border">
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.category} · {p.published ? "Published" : "Draft"}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => edit(p)}><Pencil className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
