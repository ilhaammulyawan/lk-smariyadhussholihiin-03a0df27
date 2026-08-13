import { createFileRoute, useNavigate, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  FileText,
  Newspaper,
  Settings,
  CalendarX,
  Users,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminShell });

const TOP_ITEMS = [
  { to: "/admin/dashboard", label: "Beranda", icon: LayoutDashboard },
  { to: "/admin/dashboard/booking", label: "Booking", icon: CalendarCheck },
  { to: "/admin/dashboard/laporan", label: "Laporan", icon: ClipboardList },
  { to: "/admin/dashboard/jadwal", label: "Jadwal & Libur", icon: CalendarX },
];

const MORE_ITEMS = [
  { to: "/admin/dashboard/staff", label: "Staff", icon: Users },
  { to: "/admin/dashboard/berita", label: "Berita", icon: Newspaper },
  { to: "/admin/dashboard/konten", label: "Konten", icon: FileText },
  { to: "/admin/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
];

function isActive(path: string, to: string) {
  return to === "/admin/dashboard" ? path === to : path.startsWith(to);
}

function AdminShell() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) nav({ to: "/admin" });
  }, [user, isAdmin, loading, nav]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-white text-muted-foreground">
        Memuat...
      </div>
    );
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        className="font-display font-bold text-lg text-foreground mb-8 inline-flex items-center gap-1 hover:text-brand transition-colors"
      >
        <span className="text-brand">←</span> LabKom Admin
      </Link>

      <nav className="flex flex-col gap-1">
        {TOP_ITEMS.map((it) => {
          const active = isActive(path, it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-[#3b82f6] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              )}
            >
              <it.icon className="size-4" />
              {it.label}
            </Link>
          );
        })}

        <Separator className="my-3 bg-border/60" />

        {MORE_ITEMS.map((it) => {
          const active = isActive(path, it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-[#3b82f6] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              )}
            >
              <it.icon className="size-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          onClick={async () => {
            const { supabase } = await import("@/integrations/supabase/client");
            await supabase.auth.signOut();
            nav({ to: "/admin" });
          }}
        >
          <LogOut className="size-4" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-white p-6 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/60 bg-white sticky top-0 z-40">
        <Link to="/" className="font-display font-bold text-base text-foreground">
          <span className="text-brand">←</span> LabKom Admin
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Buka menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-6 bg-white">
            <SheetTitle className="sr-only">Menu Admin</SheetTitle>
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
