import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, ClipboardList, Newspaper, Users } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/")({ component: AdminHome });

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [b, r, p] = await Promise.all([
        supabase.from("bookings").select("status", { count: "exact" }),
        supabase.from("reports").select("status", { count: "exact" }),
        supabase.from("posts").select("id", { count: "exact" }),
      ]);
      const pending = (b.data ?? []).filter((x: any) => x.status === "pending").length;
      const newReports = (r.data ?? []).filter((x: any) => x.status === "baru").length;
      return { totalBooking: b.count ?? 0, pending, totalLaporan: r.count ?? 0, newReports, totalPosts: p.count ?? 0 };
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-1">Beranda Admin</h1>
      <p className="text-muted-foreground mb-8">Ringkasan aktivitas Lab Komputer.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<CalendarCheck className="size-5 text-brand" />} label="Total Booking" value={data?.totalBooking ?? 0} sub={`${data?.pending ?? 0} pending`} />
        <Stat icon={<ClipboardList className="size-5 text-brand" />} label="Total Laporan" value={data?.totalLaporan ?? 0} sub={`${data?.newReports ?? 0} baru`} />
        <Stat icon={<Newspaper className="size-5 text-brand" />} label="Berita" value={data?.totalPosts ?? 0} />
        <Stat icon={<Users className="size-5 text-brand" />} label="Status" value="Aktif" />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub?: string }) {
  return (
    <div className="p-5 rounded-2xl bg-surface/60 border border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">{icon}{label}</div>
      <div className="text-3xl font-display font-bold mt-3">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
