import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Calendar, FileWarning, Clock, Cpu, Wifi, Building2, CalendarCheck, Newspaper, CheckCircle2, Megaphone, Sparkles, Trophy } from "lucide-react";
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

  const hours = settings?.operational_hours ?? "07:30 - 15:00";
  const totalPc = Number((settings?.lab_total_pc ?? "40").replace(/\D/g, "")) || 40;
  const internet = settings?.lab_internet ?? "200 Mbps";
  const internetNum = Number(internet.replace(/\D/g, "")) || 200;
  const rooms = Number((settings?.lab_rooms ?? "2").replace(/\D/g, "")) || 2;

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <OpenStatusBadge hours={hours} />
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display tracking-tight leading-[1.05] mb-5 sm:mb-6 text-balance break-words">
              Pusat <span className="gradient-text">literasi digital</span> santri SMA Riyadhussholihiin.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 sm:mb-10 text-pretty">
              {settings?.sambutan ??
                "Selamat datang di Lab Komputer. Membentuk generasi cakap teknologi yang berakhlakul karimah melalui fasilitas modern dan pembelajaran berkualitas."}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link to="/booking" className="px-7 sm:px-8 py-4 sm:py-4 bg-brand text-white font-semibold rounded-xl shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/40 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 text-base sm:text-lg">
                Booking Lab <ArrowRight className="size-5" />
              </Link>
              <Link to="/jadwal" className="px-7 sm:px-8 py-4 sm:py-4 bg-white text-foreground font-semibold rounded-xl border border-border shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-base sm:text-lg">
                Lihat Jadwal
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand to-accent2 rounded-3xl blur opacity-30" />
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-2xl">
                <img
                  src={settings?.hero_image_url || heroImg}
                  alt="Lab Komputer SMA Riyadhussholihiin"
                  width={1280}
                  height={960}
                  className="w-full aspect-[4/3] object-cover"
                />
                {/* subtle dark blue gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1e3f]/60 via-[#0b1e3f]/15 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1e3f]/40 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — card style with count-up */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <StatCard icon={<Cpu className="size-6" />} value={totalPc} suffix="+" label="Workstation PC" />
          <StatCard icon={<Wifi className="size-6" />} value={internetNum} suffix=" Mbps" label="Koneksi Internet" />
          <StatCard icon={<Building2 className="size-6" />} value={rooms} suffix=" Ruangan" label="Kapasitas Lab" />
          <StatCard icon={<Clock className="size-6" />} valueText={hours} label="Jam Operasional" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mt-4 sm:mt-5">
          <StatCard icon={<CalendarCheck className="size-6" />} value={liveStats?.bookings ?? 0} label="Booking Disetujui Bulan Ini" />
          <StatCard icon={<Newspaper className="size-6" />} value={liveStats?.posts ?? 0} label="Pengumuman Aktif" />
          <StatCard icon={<CheckCircle2 className="size-6" />} valueText="24/7" label="Layanan Lapor Online" />
        </div>
      </section>

      {/* Greeting + Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-12 gap-6 sm:gap-8">
        {head && (
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-border shadow-sm">
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

        <div className={`${head ? "lg:col-span-7" : "lg:col-span-12"} grid sm:grid-cols-3 gap-4 sm:gap-5`}>
          <Shortcut
            to="/booking"
            title="Booking Lab"
            desc="Reservasi ruangan di luar jam TIK."
            icon={<Calendar className="size-7" />}
            gradient="from-[#dbeafe] to-[#eff6ff]"
            iconBg="bg-[#3b82f6]/15 text-[#1d4ed8]"
            cta="text-[#1d4ed8]"
          />
          <Shortcut
            to="/lapor"
            title="Lapor Siswa"
            desc="Sampaikan kendala perangkat lab."
            icon={<FileWarning className="size-7" />}
            gradient="from-[#ffe4d6] to-[#fff5ee]"
            iconBg="bg-[#f97316]/15 text-[#c2410c]"
            cta="text-[#c2410c]"
          />
          <Shortcut
            to="/jadwal"
            title="Jadwal Lab"
            desc="Lihat ketersediaan ruangan."
            icon={<Clock className="size-7" />}
            gradient="from-[#ccfbf1] to-[#f0fdfa]"
            iconBg="bg-[#14b8a6]/15 text-[#0f766e]"
            cta="text-[#0f766e]"
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0b1e3f] via-[#0f2a5c] to-[#1e3a8a] p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Siap dipakai</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-tight">
                Butuh ruangan untuk belajar?
              </h2>
              <p className="text-white/70 mt-2 max-w-xl text-sm sm:text-base">
                Reservasi Lab Komputer hanya butuh beberapa menit. Ajukan jadwal sesuai kebutuhan kelas.
              </p>
            </div>
            <Link
              to="/booking"
              className="self-start md:self-auto inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-[#0b1e3f] font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              Booking Sekarang <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Posts */}
      {posts && posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-end justify-between mb-8 sm:mb-10 gap-4">
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
              <Link
                key={p.id}
                to="/berita/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <CategoryPlaceholder category={p.category} />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs text-brand font-bold uppercase tracking-widest mb-2">{p.category}</div>
                  <h3 className="font-display font-bold text-lg leading-snug mb-2 group-hover:text-brand transition-colors line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt ?? p.content}</p>
                  <div className="text-xs text-muted-foreground mt-auto pt-3">{formatDateID(p.created_at)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

/* ----- Real-time open/closed badge ----- */
function OpenStatusBadge({ hours }: { hours: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const m = hours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  let open = false;
  if (m) {
    const startMin = Number(m[1]) * 60 + Number(m[2]);
    const endMin = Number(m[3]) * 60 + Number(m[4]);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    open = nowMin >= startMin && nowMin < endMin;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-5 sm:mb-6 ${
      open ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
    }`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${open ? "bg-emerald-500" : "bg-rose-500"}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${open ? "bg-emerald-500" : "bg-rose-500"}`}></span>
      </span>
      {open ? "Sedang Buka" : "Sedang Tutup"} · {hours}
    </div>
  );
}

/* ----- Animated stat card ----- */
function StatCard({ icon, value, valueText, suffix, label }: { icon: React.ReactNode; value?: number; valueText?: string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-4 flex items-center justify-center">
        <span className="absolute inset-0 rounded-2xl bg-brand/10" />
        <span className="relative text-brand">{icon}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-display font-bold tracking-tight break-words">
        {typeof value === "number" ? <CountUp end={value} run={visible} suffix={suffix} /> : valueText}
      </div>
      <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5">{label}</div>
    </div>
  );
}

function CountUp({ end, run, suffix = "", duration = 1200 }: { end: number; run: boolean; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, end, duration]);
  return <>{n}{suffix}</>;
}

/* ----- Shortcut feature card ----- */
function Shortcut({ to, title, desc, icon, gradient, iconBg, cta }: { to: string; title: string; desc: string; icon: React.ReactNode; gradient: string; iconBg: string; cta: string }) {
  return (
    <Link
      to={to}
      className={`group relative p-7 sm:p-8 rounded-2xl bg-gradient-to-br ${gradient} border border-border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[220px] overflow-hidden`}
    >
      <div className={`size-14 sm:size-16 rounded-2xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="mt-8">
        <h3 className="font-display font-bold text-xl mb-1.5">{title}</h3>
        <p className="text-sm text-foreground/70">{desc}</p>
        <span className={`mt-5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/80 backdrop-blur text-xs font-bold uppercase tracking-widest shadow-sm group-hover:shadow ${cta}`}>
          Buka <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

/* ----- Category placeholder for posts ----- */
function CategoryPlaceholder({ category }: { category: string }) {
  const c = (category || "").toLowerCase();
  let bg = "from-blue-400 to-blue-600";
  let Icon = Megaphone;
  if (c.includes("kegiatan")) { bg = "from-emerald-400 to-emerald-600"; Icon = Sparkles; }
  else if (c.includes("prestasi")) { bg = "from-amber-400 to-amber-500"; Icon = Trophy; }
  return (
    <div className={`w-full h-full bg-gradient-to-br ${bg} flex flex-col items-center justify-center text-white gap-2`}>
      <Icon className="size-10 opacity-90" />
      <div className="text-xs font-bold uppercase tracking-widest">{category}</div>
    </div>
  );
}
