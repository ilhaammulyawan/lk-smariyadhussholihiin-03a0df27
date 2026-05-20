import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, X, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/materi")({ component: AdminMateri });

type Material = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  class_level: string;
  category: string;
  sort_order: number;
  active: boolean;
};

const EMPTY = {
  title: "",
  description: "",
  url: "",
  class_level: "Umum",
  category: "Materi",
  sort_order: 0,
  active: true,
};

const CLASS_OPTIONS = ["Umum", "Kelas X", "Kelas XI", "Kelas XII"];
const CATEGORY_OPTIONS = ["Materi", "Modul", "Video", "Latihan", "Tugas", "Referensi"];

function AdminMateri() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Material> | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-materials"],
    queryFn: async () =>
      ((await supabase.from("materials").select("*").order("sort_order")).data ?? []) as Material[],
  });

  const save = async () => {
    if (!editing?.title || !editing?.url) return toast.error("Judul & URL wajib diisi");
    try {
      new URL(editing.url);
    } catch {
      return toast.error("URL tidak valid");
    }
    const payload = {
      title: editing.title!,
      description: editing.description || null,
      url: editing.url!,
      class_level: editing.class_level ?? "Umum",
      category: editing.category ?? "Materi",
      sort_order: editing.sort_order ?? 0,
      active: editing.active ?? true,
    };
    const op = editing.id
      ? supabase.from("materials").update(payload).eq("id", editing.id)
      : supabase.from("materials").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Disimpan");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-materials"] });
    qc.invalidateQueries({ queryKey: ["materials"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus materi ini?")) return;
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-materials"] });
    qc.invalidateQueries({ queryKey: ["materials"] });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Materi Informatika</h1>
          <p className="text-sm text-muted-foreground">
            Kelola tautan materi pelajaran yang dapat diakses santri.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="size-4 mr-1" /> Tambah Materi
        </Button>
      </div>

      {editing && (
        <div className="p-5 sm:p-6 rounded-2xl bg-surface/60 border border-border mb-6 grid gap-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">{editing.id ? "Edit Materi" : "Tambah Materi"}</h2>
            <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Judul *" full>
              <Input
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Contoh: Pengenalan Algoritma"
              />
            </Field>
            <Field label="URL / Link *" full>
              <Input
                value={editing.url ?? ""}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </Field>
            <Field label="Deskripsi" full>
              <Textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Ringkasan singkat materi..."
              />
            </Field>
            <Field label="Kelas">
              <Select
                value={editing.class_level ?? "Umum"}
                onValueChange={(v) => setEditing({ ...editing, class_level: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Kategori">
              <Select
                value={editing.category ?? "Materi"}
                onValueChange={(v) => setEditing({ ...editing, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Urutan Tampil">
              <Input
                type="number"
                value={editing.sort_order ?? 0}
                onChange={(e) => setEditing({ ...editing, sort_order: +e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch
                checked={editing.active ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, active: v })}
              />
              <Label className="text-sm">Aktif (tampil di publik)</Label>
            </div>
          </div>
          <Button onClick={save}>Simpan</Button>
        </div>
      )}

      <div className="grid gap-3">
        {(data ?? []).map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-xl bg-surface/60 border border-border flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold truncate">{m.title}</span>
                {!m.active && (
                  <span className="text-xs text-muted-foreground">(nonaktif)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider">
                  {m.class_level}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider">
                  {m.category}
                </span>
              </div>
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-muted-foreground hover:text-brand inline-flex items-center gap-1 truncate max-w-full"
              >
                <ExternalLink className="size-3 shrink-0" />
                <span className="truncate">{m.url}</span>
              </a>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => setEditing(m)}>
                <Pencil className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(m.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {data && data.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Belum ada materi. Klik "Tambah Materi" di atas.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`grid gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
