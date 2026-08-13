import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarCheck,
  ClipboardList,
  Newspaper,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { formatDateID } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard/")({ component: AdminHome });

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  cancelled: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  completed: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Dikonfirmasi",
  cancelled: "Dibatalkan",
  completed: "Selesai",
};

function AdminHome() {
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.name ||
    user?.email?.split("@")[0]?.replace(/\./g, " ") ||
    "Admin";

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonth = prev.toISOString().slice(0, 7);

      const [b, r, p] = await Promise.all([
        supabase.from("bookings").select("status, date", { count: "exact" }),
        supabase.from("reports").select("status, date", { count: "exact" }),
        supabase.from("posts").select("id", { count: "exact" }),
      ]);

      const bookings = b.data ?? [];
      const reports = r.data ?? [];
      const currentBookings = bookings.filter((x: any) => x.date?.startsWith(currentMonth)).length;
      const previousBookings = bookings.filter((x: any) => x.date?.startsWith(previousMonth)).length;
      const bookingTrend = previousBookings === 0
        ? 0
        : Math.round(((currentBookings - previousBookings) / previousBookings) * 100);

      const currentReports = reports.filter((x: any) => x.date?.startsWith(currentMonth)).length;
      const previousReports = reports.filter((x: any) => x.date?.startsWith(previousMonth)).length;
      const reportTrend = previousReports === 0
        ? 0
        : Math.round(((currentReports - previousReports) / previousReports) * 100);

      return {
        totalBooking: b.count ?? 0,
        pending: bookings.filter((x: any) => x.status === "pending").length,
        bookingTrend,
        totalLaporan: r.count ?? 0,
        newReports: reports.filter((x: any) => x.status === "baru").length,
        reportTrend,
        totalPosts: p.count ?? 0,
      };
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["admin-recent-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, date, start_time, end_time, teacher_name, subject, room, status")
        .order("date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Beranda Admin
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Ringkasan aktivitas Lab Komputer hari ini.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-border/60 rounded-full pl-2 pr-3 py-1.5 self-start sm:self-auto">
          <Avatar className="h-8 w-8 bg-[#3b82f6] text-white">
            <AvatarFallback className="bg-[#3b82f6] text-white text-xs font-semibold uppercase">
              {displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-none">Admin {displayName.split(" ")[0]}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Administrator</span>
          </div>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          icon={<CalendarCheck className="size-5 text-[#3b82f6]" />}
          label="Total Booking"
          value={stats?.totalBooking ?? 0}
          sub={`${stats?.pending ?? 0} pending`}
          trend={stats?.bookingTrend ?? 0}
        />
        <SummaryCard
          icon={<ClipboardList className="size-5 text-[#3b82f6]" />}
          label="Total Laporan"
          value={stats?.totalLaporan ?? 0}
          sub={`${stats?.newReports ?? 0} baru`}
          trend={-(stats?.reportTrend ?? 0)}
          trendInverse
        />
        <SummaryCard
          icon={<Newspaper className="size-5 text-[#3b82f6]" />}
          label="Berita"
          value={stats?.totalPosts ?? 0}
          sub="Publikasi terbaru"
        />
        <SummaryCard
          icon={<Users className="size-5 text-emerald-500" />}
          label="Status"
          value="Aktif"
          sub="Semua sistem berjalan"
          status="active"
        />
      </div>

      {/* Recent Bookings */}
      <Card className="bg-white border border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
          <div>
            <CardTitle className="text-lg font-display font-semibold">Booking Terbaru</CardTitle>
            <CardDescription className="text-sm mt-0.5">
              {recentBookings?.length ?? 0} peminjaman terakhir yang masuk
            </CardDescription>
          </div>
          <Link
            to="/admin/dashboard/booking"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#3b82f6] hover:underline"
          >
            Lihat semua <ArrowRight className="size-4" />
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="pl-6">Nama Peminjam</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Ruangan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentBookings ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Belum ada data booking.
                    </TableCell>
                  </TableRow>
                ) : (
                  (recentBookings ?? []).map((b: any) => (
                    <TableRow key={b.id} className="border-border/60">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{b.teacher_name}</span>
                          <span className="text-xs text-muted-foreground">{b.subject}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDateID(b.date)}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}
                      </TableCell>
                      <TableCell className="text-foreground">{b.room || "Lab Komputer"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium capitalize",
                            statusStyles[b.status] ?? "bg-slate-100 text-slate-700"
                          )}
                        >
                          {statusLabel[b.status] ?? b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  trend,
  trendInverse,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  trend?: number;
  trendInverse?: boolean;
  status?: "active";
}) {
  const isPositive = trendInverse ? trend && trend < 0 : trend && trend > 0;
  const showTrend = trend !== undefined && trend !== 0;
  const trendColor = status === "active"
    ? "text-emerald-600"
    : isPositive
      ? "text-emerald-600"
      : "text-red-500";

  return (
    <Card className="bg-white border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-border/40">
            {icon}
          </div>
          {status === "active" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Online
            </span>
          )}
          {showTrend && status !== "active" && (
            <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trendColor)}>
              {isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          {value}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{label}</div>
        <div className="text-xs text-muted-foreground/80 mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}
