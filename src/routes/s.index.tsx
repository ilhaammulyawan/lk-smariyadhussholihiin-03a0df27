import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Copy, Check, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/s/")({
  head: () => ({
    meta: [
      { title: "URL Shortener — Lab Komputer SMA Riyadhussholihiin" },
      { name: "description", content: "Buat link pendek dengan mudah. Pemendek URL gratis untuk siswa & guru." },
    ],
  }),
  component: ShortenerPage,
});

function randomCode(len = 6) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function ShortenerPage() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; target: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^https?:\/\//i.test(url)) {
      toast.error("URL harus diawali http:// atau https://");
      return;
    }
    setLoading(true);
    try {
      let code = customCode.trim() || randomCode();
      if (!/^[a-zA-Z0-9_-]{3,32}$/.test(code)) {
        toast.error("Kode hanya boleh huruf/angka/-/_ (3–32 karakter)");
        setLoading(false);
        return;
      }

      // try up to 3 times if collision on random code
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error } = await supabase.from("short_links").insert({
          code,
          target_url: url.trim(),
          note: note.trim() || null,
        });
        if (!error) {
          setResult({ code, target: url.trim() });
          toast.success("Link pendek berhasil dibuat!");
          setUrl("");
          setCustomCode("");
          setNote("");
          setLoading(false);
          return;
        }
        if (error.code === "23505" && !customCode) {
          code = randomCode(7 + attempt);
          continue;
        }
        if (error.code === "23505") {
          toast.error("Kode sudah dipakai, coba kode lain");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      toast.error("Gagal membuat link, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  function copyLink(short: string) {
    navigator.clipboard.writeText(short);
    setCopied(true);
    toast.success("Disalin!");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="URL SHORTENER"
        title="Bikin Link Pendek"
        desc="Ubah URL panjang menjadi tautan singkat yang mudah dibagikan."
      />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="rounded-2xl border border-border bg-surface/40 backdrop-blur p-5 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="url" className="text-sm font-semibold">URL Panjang *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://contoh.com/halaman/sangat-panjang"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="mt-2 h-12"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code" className="text-sm font-semibold">
                  Kode Khusus <span className="text-muted-foreground font-normal">(opsional)</span>
                </Label>
                <div className="mt-2 flex items-center gap-2 rounded-md border border-input bg-background h-12 px-3 focus-within:ring-2 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">/s/</span>
                  <input
                    id="code"
                    type="text"
                    placeholder="acak otomatis"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="note" className="text-sm font-semibold">
                  Catatan <span className="text-muted-foreground font-normal">(opsional)</span>
                </Label>
                <Input
                  id="note"
                  placeholder="Materi kelas 11"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-2 h-12"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base">
              <Sparkles className="size-4 mr-2" />
              {loading ? "Memproses..." : "Buat Link Pendek"}
            </Button>
          </form>

          {result && (
            <div className="mt-6 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-brand/10 to-accent2/10 border border-brand/20">
              <div className="text-xs font-bold uppercase tracking-widest text-brand mb-2 flex items-center gap-1.5">
                <Link2 className="size-3.5" /> Link kamu siap
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <code className="flex-1 px-3 py-2.5 rounded-md bg-background border border-border text-sm font-mono break-all">
                  {origin}/s/{result.code}
                </code>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => copyLink(`${origin}/s/${result.code}`)}
                    className="flex-1 sm:flex-none"
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="flex-1 sm:flex-none"
                  >
                    <a href={`/s/${result.code}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 break-all">
                → mengarah ke {result.target}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 px-4">
          Gunakan dengan bijak. Link berisi konten berbahaya akan dihapus admin.
        </p>
      </section>
    </SiteLayout>
  );
}
