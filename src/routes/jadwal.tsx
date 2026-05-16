import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatTime, toISODate } from "@/lib/format";

export const Route = createFileRoute("/jadwal")({ component: Jadwal });

const DAYS = [
  { id: 1, name: "Senin" }, { id: 2, name: "Selasa" }, { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" }, { id: 5, name: "Jumat" }, { id: 6, name: "Sabtu" }, { id: 7, name: "Ahad" },
];



function Jadwal() {
  const { data: tik } = useQuery({
    queryKey: ["tik"],
    queryFn: async () => {
      const { data } = await supabase.from("tik_schedule").select("*").eq("active", true);
      return data ?? [];
    },
  });

  // Bookings this week
  const { data: bookings } = useQuery({
    queryKey: ["bookings", "week"],
    queryFn: async () => {
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const { data } = await supabase
        .from("bookings").select("*")
        .gte("date", toISODate(monday))
        .lte("date", toISODate(sunday))
        .in("status", ["pending", "approved"]);
      return data ?? [];
    },
  });

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const getStatus = (dayId: number, slot: string) => {
    const t = tik?.find((x) => x.day_of_week === dayId && x.start_time.slice(0, 5) === slot);
    if (t) return { kind: "tik", label: t.class_name };
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayId - 1);
    const dateStr = toISODate(date);
    const b = bookings?.find((x) => x.date === dateStr && x.start_time.slice(0, 5) === slot);
    if (b) return { kind: "booked", label: b.subject };
    return { kind: "free", label: "Tersedia" };
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="Jadwal" title="Jadwal Mingguan Lab" desc="Lihat ketersediaan slot. Untuk booking lab, gunakan tombol di bawah." />

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-4 mb-6 text-xs">
          <Legend color="bg-destructive/30 border-destructive/50" label="Jam TIK" />
          <Legend color="bg-yellow-500/30 border-yellow-500/50" label="Sudah Dibooking" />
          <Legend color="bg-emerald-500/20 border-emerald-500/40" label="Tersedia" />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-surface/40">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Jam</th>
                {DAYS.map((d) => (
                  <th key={d.id} className="p-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{d.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((s) => (
                <tr key={s} className="border-b border-border last:border-0">
                  <td className="p-3 font-mono text-xs text-muted-foreground">{s}</td>
                  {DAYS.map((d) => {
                    const st = getStatus(d.id, s);
                    const cls =
                      st.kind === "tik" ? "bg-destructive/20 border-destructive/40 text-destructive-foreground" :
                      st.kind === "booked" ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300" :
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                    return (
                      <td key={d.id} className="p-1.5">
                        <div className={`px-2 py-2 rounded-lg border text-xs text-center ${cls}`}>{st.label}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link to="/booking" className="inline-flex px-6 py-3 bg-brand text-white font-semibold rounded-xl hover:opacity-90">
            Booking Sekarang
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-4 rounded border ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
