import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateID } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/laporan")({ component: AdminLaporan });

function AdminLaporan() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data } = useQuery({
    queryKey: ["admin-reports", filter],
    queryFn: async () => {
      let q = supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      return (await q).data ?? [];
    },
  });

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("reports").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-1">Laporan Siswa</h1>
      <p className="text-muted-foreground mb-6">Tinjau laporan dari siswa.</p>

      <div className="mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="baru">Baru</SelectItem>
            <SelectItem value="diproses">Diproses</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {data?.map((r) => (
          <div key={r.id} className="p-5 rounded-xl bg-surface/60 border border-border">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-xs font-mono text-brand">{r.ticket_number}</div>
                <div className="font-semibold mt-1">{r.student_name} · {r.class}</div>
                <div className="text-xs text-muted-foreground">{formatDateID(r.created_at)} · {r.category}</div>
              </div>
              <Badge variant={r.status === "selesai" ? "default" : r.status === "diproses" ? "secondary" : "destructive"}>{r.status}</Badge>
            </div>
            <p className="text-sm mb-3 whitespace-pre-line">{r.content}</p>
            {r.photo_url && <img src={r.photo_url} alt="" className="max-w-xs rounded-lg border border-border mb-3" />}
            <Textarea
              placeholder="Catatan admin (internal)..."
              defaultValue={r.admin_notes ?? ""}
              onBlur={(e) => e.target.value !== (r.admin_notes ?? "") && update(r.id, { admin_notes: e.target.value })}
              rows={2}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => update(r.id, { status: "diproses" })}>Tandai Diproses</Button>
              <Button size="sm" onClick={() => update(r.id, { status: "selesai" })}>Tandai Selesai</Button>
            </div>
          </div>
        ))}
        {data && data.length === 0 && <p className="text-center text-muted-foreground py-12">Belum ada laporan.</p>}
      </div>
    </div>
  );
}
