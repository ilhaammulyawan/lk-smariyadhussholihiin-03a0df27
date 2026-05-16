import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, FileWarning, Clock, Cpu, Wifi, Building2, CalendarCheck, Newspaper, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/settings";
import { formatDateID } from "@/lib/format";
import heroImg from "@/assets/hero-lab.jpg";

export const Route = createFileRoute("/")({ component: Beranda });

function Beranda() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: posts } = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts").select("*").eq("published", true).order("created_at", { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    },
  });
  const { data: head } = useQuery({
    queryKey: ["staff", "head"],
    queryFn: async () => {
      const { data } = await supabase.from("staff").select("*").eq("role", "kepala").maybeSingle();
      return data;
    },
  });
  const { data: liveStats } = useQuery({
    queryKey: ["live-stats"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const [bookings, posts] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "approved").gte("date", monthStart),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
      ]);
      return { bookings: bookings.count ?? 0, posts: posts.count ?? 0 };
    },
  });

  const labName = settings?.lab_name ?? "Lab Komputer SMA Riyadhussholihiin";
  const hours = settings?.operational_hours ?? "07:30 - 16:00";

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-5 sm:mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              Lab buka: {hours}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display tracking-tight leading-[1.05] mb-5 sm:mb-6 text-balance break-words">
              Pusat <span className="gradient-text">literasi digital</span> santri SMA Riyadhussholihiin.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 sm:mb-10 text-pretty">
              {settings?.sambutan ??
                "Selamat datang di Lab Komputer. Membentuk generasi cakap teknologi yang berakhlakul karimah melalui fasilitas modern dan pembelajaran berkualitas."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/booking" className="px-5 sm:px-6 py-3 sm:py-3.5 bg-brand text-white font-semibold rounded-xl hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] transition-shadow inline-flex items-center gap-2 text-sm sm:text-base">
                Booking Lab <ArrowRight className="size-4" />
              </Link>
              <Link to="/jadwal" className="px-5 sm:px-6 py-3 sm:py-3.5 bg-secondary text-foreground font-semibold rounded-xl border border-border hover:bg-accent transition-colors text-sm sm:text-base">
                Lihat Jadwal
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand to-accent2 rounded-3xl blur opacity-30" />
              <img
                src={settings?.hero_image_url || heroImg}
                alt="Lab Komputer SMA Riyadhussholihiin"
                width={1280}
                height={1024}
                className="relative w-full aspect-[5/4] object-cover rounded-2xl sm:rounded-3xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-8 sm:py-10 border-y border-border">
          <Stat icon={<Cpu className="size-5" />} value={`${settings?.lab_total_pc ?? "40"}+`} label="Workstation PC" />
          <Stat icon={<Wifi className="size-5" />} value={settings?.lab_internet ?? "200 Mbps"} label="Koneksi Internet" />
          <Stat icon={<Building2 className="size-5" />} value={settings?.lab_rooms ?? "2 Ruangan"} label="Kapasitas Lab" />
          <Stat icon={<Clock className="size-5" />} value={hours} label="Jam Operasional" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-8 sm:py-10 border-b border-border">
          <Stat icon={<CalendarCheck className="size-5" />} value={String(liveStats?.bookings ?? 0)} label="Booking Disetujui Bulan Ini" />
          <Stat icon={<Newspaper className="size-5" />} value={String(liveStats?.posts ?? 0)} label="Pengumuman Aktif" />
          <Stat icon={<CheckCircle2 className="size-5" />} value="24/7" label="Layanan Lapor Online" />
        </div>
      </section>

      {/* Greeting + Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-6 sm:gap-10">
        {head && (
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface/60 border border-border">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 sm:mb-6">Sambutan Kepala Lab</div>
            <blockquote className="text-lg sm:text-xl font-display leading-relaxed text-pretty mb-6 sm:mb-8">
              "{head.greeting}"
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-brand to-accent2 flex items-center justify-center text-white font-bold">
                {head.name?.[0]}
              </div>
              <div>
                <div className="font-semibold">{head.name}</div>
                <div className="text-sm text-muted-foreground">{head.position}</div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
          <Shortcut to="/booking" title="Booking Lab" desc="Reservasi ruangan di luar jam TIK." accent="brand" icon={<Calendar className="size-5" />} />
          <Shortcut to="/lapor" title="Lapor Siswa" desc="Sampaikan kendala perangkat lab." accent="destructive" icon={<FileWarning className="size-5" />} />
          <Shortcut to="/jadwal" title="Jadwal Lab" desc="Lihat ketersediaan ruangan." accent="accent2" icon={<Clock className="size-5" />} />
        </div>
      </section>

      {/* Posts */}
      {posts && posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="flex items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight">Pengumuman Terbaru</h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Informasi terkini dari Lab Komputer.</p>
            </div>
            <Link to="/berita" className="text-sm font-semibold text-brand inline-flex items-center gap-1 whitespace-nowrap">
              Semua <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((p) => (
              <Link key={p.id} to="/berita/$slug" params={{ slug: p.slug }} className="group">
                <div className="aspect-[16/10] rounded-2xl bg-surface border border-border mb-4 overflow-hidden">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-muted-foreground uppercase tracking-widest">{p.category}</div>
                  )}
                </div>
                <div className="text-xs text-brand font-bold uppercase tracking-widest mb-2">{p.category}</div>
                <h3 className="font-display font-bold text-lg leading-snug mb-2 group-hover:text-brand transition-colors">{p.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt ?? p.content}</p>
                <div className="text-xs text-muted-foreground mt-3">{formatDateID(p.created_at)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div>
      <div className="text-brand mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-display font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{label}</div>
    </div>
  );
}

function Shortcut({ to, title, desc, icon, accent }: { to: string; title: string; desc: string; icon: React.ReactNode; accent: "brand" | "destructive" | "accent2" }) {
  const ring = accent === "brand" ? "hover:border-brand/60" : accent === "destructive" ? "hover:border-destructive/60" : "hover:border-accent2/60";
  const color = accent === "brand" ? "text-brand" : accent === "destructive" ? "text-destructive" : "text-[var(--accent2)]";
  return (
    <Link to={to} className={`group p-6 rounded-2xl bg-surface/60 border border-border ${ring} transition-colors flex flex-col justify-between min-h-[180px]`}>
      <div className={`${color}`}>{icon}</div>
      <div className="mt-8">
        <h3 className="font-display font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <div className={`mt-4 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1 ${color}`}>
          Buka <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
