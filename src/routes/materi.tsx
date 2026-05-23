import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const TARGET_URL = "https://kelasinformatika.pages.dev/";

export const Route = createFileRoute("/materi")({
  component: MateriRedirect,
  // SSR: redirect via response
  loader: () => {
    if (typeof window === "undefined") {
      throw new Response(null, { status: 302, headers: { Location: TARGET_URL } });
    }
    return null;
  },
});

function MateriRedirect() {
  useEffect(() => {
    window.location.replace(TARGET_URL);
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", color: "#475569" }}>
      <p>Mengalihkan ke Kelas Informatika…</p>
    </div>
  );
}
