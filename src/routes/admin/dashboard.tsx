import { createFileRoute, useNavigate, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, CalendarCheck, ClipboardList, FileText, Newspaper, Settings, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminShell });

const ITEMS = [
  { to: "/admin/dashboard", label: "Beranda", icon: LayoutDashboard, exact: true },
  { to: "/admin/dashboard/booking", label: "Booking", icon: CalendarCheck },
  { to: "/admin/dashboard/laporan", label: "Laporan", icon: ClipboardList },
  { to: "/admin/dashboard/jadwal", label: "Jadwal TIK", icon: CalendarX },
  { to: "/admin/dashboard/berita", label: "Berita", icon: Newspaper },
  { to: "/admin/dashboard/konten", label: "Konten", icon: FileText },
  { to: "/admin/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
];

function AdminShell() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) nav({ to: "/admin" });
  }, [user, isAdmin, loading, nav]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Memuat...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-border bg-surface/40 p-6 flex flex-col gap-1">
        <Link to="/" className="font-display font-bold mb-6 block">← LabKom Admin</Link>
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {ITEMS.map((it) => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            return (
              <Link key={it.to} to={it.to} className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap",
                active ? "bg-brand text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
                <it.icon className="size-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/admin" }); }}>
            <LogOut className="size-4 mr-2" /> Keluar
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
