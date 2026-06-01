import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({ component: AdminLogin });

function AdminLogin() {
  const nav = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && isAdmin) nav({ to: "/admin/dashboard" });
  }, [user, isAdmin, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { supabase } = await import("@/integrations/supabase/client");
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Berhasil masuk");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Akun dibuat. Hubungi admin untuk diberi role admin.");
    }
  };

  if (loading) return null;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Admin" title="Dashboard Admin" desc="Masuk untuk mengelola booking, laporan, dan konten website." />
      <section className="max-w-md mx-auto px-6 py-12">
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Masuk</TabsTrigger>
            <TabsTrigger value="signup">Daftar</TabsTrigger>
          </TabsList>
        </Tabs>
        <form onSubmit={submit} className="p-6 rounded-3xl bg-surface/60 border border-border grid gap-4">
          <div className="grid gap-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" disabled={busy}>{busy ? "Memproses..." : mode === "signin" ? "Masuk" : "Daftar"}</Button>
          {user && !isAdmin && (
            <p className="text-xs text-yellow-400">Akun Anda belum memiliki akses admin. Hubungi pengelola untuk diberikan role admin di database.</p>
          )}
        </form>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Akun pertama yang daftar perlu diberi role <code className="text-brand">admin</code> via dashboard backend (tabel <code>user_roles</code>).
        </p>
      </section>
    </SiteLayout>
  );
}
