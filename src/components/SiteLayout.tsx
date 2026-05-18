import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import { Menu, X, Monitor, Mail, MessageCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/profil", label: "Profil" },
  { to: "/informasi", label: "Info Lab" },
  { to: "/peraturan", label: "Peraturan" },
  { to: "/berita", label: "Berita" },
  { to: "/jadwal", label: "Jadwal" },
  { to: "/lapor", label: "Lapor" },
  { to: "/cek-status", label: "Cek Status" },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="size-8 rounded-lg bg-gradient-to-br from-brand to-accent2 flex items-center justify-center">
              <Monitor className="size-4 text-white" />
            </span>
            <span className="font-display font-bold tracking-tight text-sm sm:text-base">
              LabKom <span className="text-muted-foreground font-normal hidden sm:inline">· Riyadhussholihiin</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/booking"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-brand hover:text-white transition-colors"
            >
              Booking Lab
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-md hover:bg-accent"
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border bg-background">
            <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-md text-sm hover:bg-accent"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/booking"
                onClick={() => setOpen(false)}
                className="mt-2 px-3 py-2.5 rounded-md bg-brand text-white text-sm font-semibold text-center"
              >
                Booking Lab
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface/30 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="size-8 rounded-lg bg-gradient-to-br from-brand to-accent2 flex items-center justify-center">
                <Monitor className="size-4 text-white" />
              </span>
              <span className="font-display font-bold">Lab Komputer SMA Riyadhussholihiin</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Pusat literasi digital santri — menghadirkan fasilitas komputasi modern untuk mendukung pembelajaran dan
              kompetensi teknologi berbasis nilai islami.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/profil" className="hover:text-brand">Profil Lab</Link></li>
              <li><Link to="/jadwal" className="hover:text-brand">Jadwal Lab</Link></li>
              <li><Link to="/peraturan" className="hover:text-brand">Peraturan</Link></li>
              <li><Link to="/berita" className="hover:text-brand">Berita</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Layanan</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/booking" className="hover:text-brand">Booking Lab</Link></li>
              <li><Link to="/lapor" className="hover:text-brand">Lapor Siswa</Link></li>
              <li><Link to="/admin" className="hover:text-brand text-muted-foreground">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} SMA Riyadhussholihiin. All rights reserved.</span>
            <span className="font-mono uppercase tracking-widest">Designed for santri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
