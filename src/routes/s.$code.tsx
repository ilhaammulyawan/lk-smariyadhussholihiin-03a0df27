import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/s/$code")({
  // SSR: lookup + redirect
  loader: async ({ params }) => {
    const { data, error } = await supabase.rpc("increment_short_link_click", { _code: params.code });
    if (error || !data) {
      return { target: null as string | null };
    }
    if (typeof window === "undefined") {
      throw redirect({ href: data, statusCode: 302 });
    }
    return { target: data as string };
  },
  component: ShortRedirect,
  notFoundComponent: () => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", color: "#475569", padding: 24, textAlign: "center" }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Link tidak ditemukan</h1>
        <p>Kode link pendek ini tidak terdaftar.</p>
        <a href="/s" style={{ color: "#3b82f6", marginTop: 12, display: "inline-block" }}>← Buat link pendek</a>
      </div>
    </div>
  ),
});

function ShortRedirect() {
  const { target } = Route.useLoaderData();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (target) {
      window.location.replace(target);
    } else {
      setNotFound(true);
    }
  }, [target]);

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", color: "#475569", padding: 24, textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Link tidak ditemukan</h1>
          <p>Kode link pendek ini tidak terdaftar atau sudah dihapus.</p>
          <a href="/s" style={{ color: "#3b82f6", marginTop: 12, display: "inline-block" }}>← Buat link pendek</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", color: "#475569" }}>
      <p>Mengalihkan…</p>
    </div>
  );
}
