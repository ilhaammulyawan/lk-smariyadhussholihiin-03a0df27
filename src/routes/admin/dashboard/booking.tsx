import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateID } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/booking")({ component: AdminBooking });

function AdminBooking() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data } = useQuery({
    queryKey: ["admin-bookings", filter],
    queryFn: async () => {
      let q = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data } = await q;
      return data ?? [];
    },
  });

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

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-1">Manajemen Booking</h1>
      <p className="text-muted-foreground mb-6">Kelola booking dari guru.</p>

      <div className="mb-4 flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {data?.map((b) => (
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
        {data && data.length === 0 && <p className="text-center text-muted-foreground py-12">Belum ada booking.</p>}
      </div>
    </div>
  );
}
