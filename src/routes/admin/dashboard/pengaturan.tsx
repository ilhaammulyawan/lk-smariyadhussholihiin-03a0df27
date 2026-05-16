import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/pengaturan")({ component: AdminPengaturan });

const FIELDS: { key: string; label: string; multi?: boolean }[] = [
  { key: "hero_image_url", label: "URL Gambar Hero (Beranda)" },
  { key: "lab_name", label: "Nama Lab" },
  { key: "admin_wa", label: "Nomor WA Admin (628xxx)" },
  { key: "operational_hours", label: "Jam Operasional" },
  { key: "operational_days", label: "Hari Aktif" },
  { key: "lab_total_pc", label: "Jumlah PC" },
  { key: "lab_internet", label: "Kecepatan Internet" },
  { key: "lab_rooms", label: "Jumlah Ruangan" },
  { key: "school_address", label: "Alamat Sekolah" },
  { key: "school_email", label: "Email Sekolah" },
  { key: "sambutan", label: "Sambutan Beranda", multi: true },
  { key: "visi", label: "Visi", multi: true },
  { key: "misi", label: "Misi", multi: true },
];

function AdminPengaturan() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await supabase.from("settings").select("*")).data ?? [],
  });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const m: Record<string, string> = {};
      data.forEach((r: any) => { m[r.key] = r.value ?? ""; });
      setForm(m);
    }
  }, [data]);

  const save = async () => {
    const rows = FIELDS.map((f) => ({ key: f.key, value: form[f.key] ?? "" }));
    const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
    if (error) return toast.error(error.message);
    toast.success("Pengaturan disimpan");
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const uploadHero = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("public-files").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("public-files").getPublicUrl(path);
    setForm((f) => ({ ...f, hero_image_url: pub.publicUrl }));
    toast.success("Gambar diunggah. Klik Simpan untuk menerapkan.");
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-1">Pengaturan</h1>
      <p className="text-muted-foreground mb-6">Konfigurasi data umum website.</p>
      <div className="p-6 rounded-2xl bg-surface/60 border border-border grid gap-4 max-w-2xl">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label>{f.label}</Label>
            {f.multi
              ? <Textarea rows={3} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              : <Input value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />}
            {f.key === "hero_image_url" && (
              <div className="grid gap-2 mt-1">
                <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadHero(file); }} />
                {form.hero_image_url && (
                  <img src={form.hero_image_url} alt="Hero preview" className="w-full max-w-sm aspect-[5/4] object-cover rounded-lg border border-border" />
                )}
              </div>
            )}
          </div>
        ))}
        <Button onClick={save} className="mt-2">Simpan Perubahan</Button>
      </div>
    </div>
  );
}
