import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateID } from "@/lib/format";
import { toast } from "sonner";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/booking")({ component: AdminBooking });

const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function AdminBooking() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all"); // "all" | "YYYY-MM"

  const { data } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*").order("date", { ascending: false });
      return data ?? [];
    },
  });

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((b) => set.add(b.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (monthFilter !== "all" && !b.date.startsWith(monthFilter)) return false;
      return true;
    });
  }, [data, statusFilter, monthFilter]);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Booking ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus booking ini?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const printReport = () => {
    const statusLabel = statusFilter === "all" ? "Semua Status" : statusFilter;
    const monthLabel = monthFilter === "all"
      ? "Semua Bulan"
      : `${MONTHS_ID[Number(monthFilter.slice(5, 7)) - 1]} ${monthFilter.slice(0, 4)}`;

    const rows = filtered.map((b, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${formatDateID(b.date)}</td>
        <td>${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}</td>
        <td>${escapeHtml(b.teacher_name)}</td>
        <td>${escapeHtml(b.subject)}</td>
        <td style="text-align:center">${b.student_count}</td>
        <td>${escapeHtml(b.teacher_wa)}</td>
        <td>${escapeHtml(b.notes ?? "")}</td>
        <td style="text-transform:capitalize">${b.status}</td>
      </tr>
    `).join("");

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Laporan Booking Lab Komputer</title>
<style>
  @page { size: A4 landscape; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; }
  .head { display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 14px; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { font-size: 12px; color: #555; }
  .meta { font-size: 11px; color: #333; text-align: right; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #999; padding: 6px 8px; vertical-align: top; text-align: left; }
  th { background: #f1f1f1; font-weight: 600; }
  tbody tr:nth-child(even) { background: #fafafa; }
  .foot { margin-top: 16px; font-size: 11px; color: #555; display:flex; justify-content:space-between; }
  .empty { text-align:center; padding: 40px; color: #777; }
</style></head>
<body>
  <div class="head">
    <div>
      <h1>Laporan Booking Lab Komputer</h1>
      <div class="sub">SMA Riyadhussholihiin</div>
    </div>
    <div class="meta">
      <div><strong>Periode:</strong> ${monthLabel}</div>
      <div><strong>Status:</strong> ${statusLabel}</div>
      <div><strong>Total:</strong> ${filtered.length} booking</div>
      <div>Dicetak: ${formatDateID(new Date())}</div>
    </div>
  </div>
  ${filtered.length === 0 ? `<div class="empty">Tidak ada data untuk filter ini.</div>` : `
  <table>
    <thead>
      <tr>
        <th style="width:32px">No</th>
        <th>Tanggal</th>
        <th>Jam</th>
        <th>Guru</th>
        <th>Mapel</th>
        <th>Siswa</th>
        <th>WA</th>
        <th>Catatan</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`}
  <div class="foot">
    <div>Laporan otomatis sistem Lab Komputer</div>
    <div>Halaman 1</div>
  </div>
  <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
</body></html>`;

    const w = window.open("", "_blank", "width=1200,height=800");
    if (!w) return toast.error("Popup diblokir. Izinkan popup untuk mencetak.");
    w.document.write(html);
    w.document.close();
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-1">Manajemen Booking</h1>
      <p className="text-muted-foreground mb-6">Kelola booking dari guru.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Bulan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bulan</SelectItem>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {MONTHS_ID[Number(m.slice(5, 7)) - 1]} {m.slice(0, 4)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">{filtered.length} data</div>

        <Button className="ml-auto" onClick={printReport} disabled={filtered.length === 0}>
          <Printer className="size-4 mr-2" /> Cetak Laporan
        </Button>
      </div>

      <div className="grid gap-3">
        {filtered.map((b) => (
          <div key={b.id} className="p-4 rounded-xl bg-surface/60 border border-border">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{b.teacher_name} · <span className="text-muted-foreground">{b.subject}</span></div>
                <div className="text-sm text-muted-foreground mt-1">{formatDateID(b.date)} · {b.start_time.slice(0,5)}–{b.end_time.slice(0,5)} · {b.student_count} siswa</div>
                <div className="text-xs text-muted-foreground mt-1">WA: {b.teacher_wa}{b.notes ? ` · ${b.notes}` : ""}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={b.status === "approved" ? "default" : b.status === "rejected" ? "destructive" : "secondary"}>{b.status}</Badge>
                {b.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => update(b.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => update(b.id, "rejected")}>Reject</Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove(b.id)}>Hapus</Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Belum ada booking.</p>}
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
