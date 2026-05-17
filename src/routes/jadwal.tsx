import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toISODate } from "@/lib/format";
import { Calendar, Check, Laptop, Users } from "lucide-react";

export const Route = createFileRoute("/jadwal")({ component: Jadwal });

const DAYS = [
  { id: 1, short: "Sen", name: "Senin" },
  { id: 2, short: "Sel", name: "Selasa" },
  { id: 3, short: "Rab", name: "Rabu" },
  { id: 4, short: "Kam", name: "Kamis" },
  { id: 5, short: "Jum", name: "Jumat" },
  { id: 6, short: "Sab", name: "Sabtu" },
  { id: 7, short: "Ahd", name: "Ahad" },
];

type Range = "month" | "week" | "next";

function Jadwal() {
  const [range, setRange] = useState<Range>("week");

  const { data: tik } = useQuery({
    queryKey: ["tik"],
    queryFn: async () => (await supabase.from("tik_schedule").select("*").eq("active", true)).data ?? [],
  });

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (range === "week") {
      const e = new Date(monday); e.setDate(monday.getDate() + 6);
      return { rangeStart: new Date(monday), rangeEnd: e };
    }
    if (range === "next") {
      const s = new Date(monday); s.setDate(monday.getDate() + 7);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return { rangeStart: s, rangeEnd: e };
    }
    const s = new Date(today.getFullYear(), today.getMonth(), 1);
    const e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { rangeStart: s, rangeEnd: e };
  }, [range, today.getTime()]);

  const { data: bookings } = useQuery({
    queryKey: ["bookings", range, toISODate(rangeStart), toISODate(rangeEnd)],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings").select("*")
        .gte("date", toISODate(rangeStart))
        .lte("date", toISODate(rangeEnd))
        .in("status", ["pending", "approved"]);
      return data ?? [];
    },
  });

  const slotMap = new Map<string, { start: string; end: string }>();
  tik?.forEach((t) => slotMap.set(`${t.start_time}-${t.end_time}`, { start: t.start_time, end: t.end_time }));
  bookings?.forEach((b) => {
    const k = `${b.start_time}-${b.end_time}`;
    if (!slotMap.has(k)) slotMap.set(k, { start: b.start_time, end: b.end_time });
  });
  const HIDDEN = new Set(["07:30-09:00", "09:15-10:45"]);
  const SLOTS = Array.from(slotMap.values())
    .filter((s) => !HIDDEN.has(`${s.start.slice(0,5)}-${s.end.slice(0,5)}`))
    .sort((a, b) => a.start.localeCompare(b.start));

  // For week/next view: a single date per day column. For month view: aggregate (any booking that weekday in range => booked).
  const weekStart = range === "next" ? rangeStart : monday;

  const getStatus = (dayId: number, slot: { start: string; end: string }) => {
    const t = tik?.find((x) => x.day_of_week === dayId && x.start_time === slot.start && x.end_time === slot.end);
    if (t) return { kind: "tik" as const, label: t.class_name };

    if (range === "month") {
      const b = bookings?.find((x) => {
        const d = new Date(x.date);
        const dow = ((d.getDay() + 6) % 7) + 1;
        return dow === dayId && x.start_time === slot.start && x.end_time === slot.end;
      });
      if (b) return { kind: "booked" as const, label: b.subject };
    } else {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayId - 1);
      const dateStr = toISODate(date);
      const b = bookings?.find((x) => x.date === dateStr && x.start_time === slot.start && x.end_time === slot.end);
      if (b) return { kind: "booked" as const, label: b.subject };
    }
    return { kind: "free" as const, label: "Tersedia" };
  };

  // Counts
  let cFree = 0, cTik = 0, cBooked = 0;
  SLOTS.forEach((s) => DAYS.forEach((d) => {
    const k = getStatus(d.id, s).kind;
    if (k === "free") cFree++; else if (k === "tik") cTik++; else cBooked++;
  }));

  const todayDow = ((today.getDay() + 6) % 7) + 1;
  const isCurrentWeek = range === "week";

  return (
    <SiteLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Jadwal Lab Komputer</h1>
            <p className="text-sm text-muted-foreground mt-1">SMA Riyadhussholihiin</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <LegendItem dot="#C0DD97" label="Tersedia" />
            <LegendItem dot="#B5D4F4" label="Jam TIK" />
            <LegendItem dot="#F7C1C1" label="Sudah Dibooking" />
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-lg bg-muted border border-border mb-5">
          {([
            { id: "month", label: "Bulan ini" },
            { id: "week", label: "Minggu ini" },
            { id: "next", label: "Minggu depan" },
          ] as { id: Range; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
                range === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm min-w-[820px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 border-b border-border">Jam</th>
                {DAYS.map((d) => {
                  const isToday = isCurrentWeek && d.id === todayDow;
                  return (
                    <th key={d.id} className={`text-center text-[11px] font-semibold uppercase tracking-wider px-2 py-3 border-b border-border ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      <span className="inline-flex items-center gap-1.5">
                        {isToday && <span className="size-1.5 rounded-full bg-primary" />}
                        {d.short}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((s, i) => (
                <tr key={`${s.start}-${s.end}`}>
                  <td className={`px-4 py-3 whitespace-nowrap ${i < SLOTS.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="font-semibold text-sm text-foreground leading-tight">{s.start.slice(0,5)}</div>
                    <div className="text-[11px] text-muted-foreground">s/d {s.end.slice(0,5)}</div>
                  </td>
                  {DAYS.map((d) => {
                    const st = getStatus(d.id, s);
                    const isLast = i === SLOTS.length - 1;
                    const bg =
                      st.kind === "tik" ? "bg-[#E6F1FB]" :
                      st.kind === "booked" ? "bg-[#FCEBEB]" :
                      "bg-[#EAF3DE]";
                    const badge =
                      st.kind === "tik" ? "bg-[#B5D4F4] text-[#0C447C]" :
                      st.kind === "booked" ? "bg-[#F7C1C1] text-[#791F1F]" :
                      "bg-[#C0DD97] text-[#27500A]";
                    const Icon = st.kind === "tik" ? Laptop : st.kind === "booked" ? Users : Check;
                    return (
                      <td key={d.id} className={`p-1.5 ${bg} transition-[filter] hover:brightness-95 ${isLast ? "" : "border-b border-border"}`}>
                        <div className={`inline-flex w-full items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium ${badge}`}>
                          <Icon className="size-3" />
                          <span className="truncate">{st.label}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex flex-wrap gap-6">
            <Stat value={cFree} label="Tersedia" color="#27500A" />
            <Stat value={cTik} label="Jam TIK" color="#0C447C" />
            <Stat value={cBooked} label="Sudah Dibooking" color="#791F1F" />
          </div>
          <Link to="/booking" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 text-sm">
            <Calendar className="size-4" /> Booking Sekarang
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function LegendItem({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ background: dot }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div className="text-2xl font-bold leading-none" style={{ color }}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
