import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  Heart,
  Monitor,
  ShieldAlert,
  Lock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/peraturan")({
  component: Peraturan,
  head: () => ({
    meta: [
      { title: "Peraturan & Tata Tertib — Lab Komputer SMA Riyadhussholihiin" },
      {
        name: "description",
        content:
          "Pedoman penggunaan Laboratorium Komputer SMA Riyadhussholihiin: adab, ketertiban KBM, keamanan, kebersihan, dan sistem kredit poin.",
      },
    ],
  }),
});

type Rule = {
  icon: LucideIcon;
  title: string;
  items: { term: string; desc: string }[];
};

const RULES: Rule[] = [
  {
    icon: Heart,
    title: "1. Adab, Niat, dan Persiapan",
    items: [
      { term: "Meluruskan Niat", desc: "Menuntut ilmu untuk mencari ridha Allah, bukan sekadar bermain." },
      { term: "Menjaga Lisan", desc: "Dilarang berbicara kasar, gaduh, atau mengganggu teman." },
      { term: "Adab Memasuki Ruangan", desc: "Mengucap salam, melepas alas kaki, dan masuk dengan tertib." },
      { term: "Barang Bawaan", desc: "Hanya membawa alat tulis dan perangkat yang diperlukan untuk KBM." },
    ],
  },
  {
    icon: Monitor,
    title: "2. Ketertiban Kegiatan Belajar Mengajar (KBM)",
    items: [
      { term: "Fokus dan Serius", desc: "Mengikuti instruksi guru serta tidak mengoperasikan hal di luar materi." },
      { term: "Akses Terbatas", desc: "Hanya membuka aplikasi/situs yang diizinkan pada jam pelajaran." },
      { term: "Pemantauan Terpusat", desc: "Aktivitas layar dipantau melalui sistem monitoring lab." },
      { term: "Penyimpanan Data", desc: "Simpan tugas pada folder pribadi yang telah ditentukan." },
      { term: "Pelaporan Kendala", desc: "Segera laporkan kerusakan atau gangguan kepada pengawas." },
    ],
  },
  {
    icon: ShieldAlert,
    title: "3. Kepatuhan Syariat (Aturan Mutlak)",
    items: [
      { term: "Menjaga Pandangan", desc: "Dilarang keras mengakses konten yang bertentangan dengan syariat." },
      { term: "Larangan Hiburan Sia-sia", desc: "Tidak memutar musik, film, atau permainan tanpa izin." },
    ],
  },
  {
    icon: Lock,
    title: "4. Keamanan Sistem dan Jaringan",
    items: [
      { term: "Keamanan Sistem Utama", desc: "Dilarang mengubah pengaturan sistem, password, atau konfigurasi jaringan." },
      { term: "Penggunaan Perangkat Eksternal", desc: "Flashdisk/HDD wajib dipindai sebelum digunakan." },
    ],
  },
  {
    icon: Wrench,
    title: "5. Kebersihan dan Perawatan Inventaris",
    items: [
      { term: "Kawasan Bebas Makanan/Minuman", desc: "Dilarang membawa makanan/minuman ke dalam lab." },
      { term: "Menjaga Kebersihan", desc: "Membuang sampah pada tempatnya dan menjaga meja tetap rapi." },
      { term: "Perawatan Alat", desc: "Gunakan mouse, keyboard, dan headset dengan hati-hati." },
      { term: "Prosedur Shutdown", desc: "Matikan komputer sesuai SOP setelah selesai digunakan." },
      { term: "Kerapian Akhir", desc: "Rapikan kursi dan pastikan meja bersih sebelum meninggalkan lab." },
    ],
  },
];

type PenaltyTier = "warn" | "danger" | "critical";
type Penalty = { offense: string; points: string; sanction: string; tier: PenaltyTier; highlight?: boolean };

const PENALTIES: Penalty[] = [
  { offense: "Terlambat masuk / tidak tertib berbaris", points: "2", sanction: "Teguran lisan", tier: "warn" },
  { offense: "Membawa makanan atau minuman ke dalam lab", points: "5", sanction: "Membersihkan area lab", tier: "warn" },
  { offense: "Gaduh / mengganggu KBM", points: "5", sanction: "Peringatan & catatan pengawas", tier: "warn" },
  { offense: "Membuka aplikasi/situs di luar materi", points: "10", sanction: "Sesi ditutup, tugas tetap diselesaikan", tier: "danger" },
  { offense: "Bermain game saat jam pelajaran", points: "15", sanction: "Peringatan tertulis + lapor wali kelas", tier: "danger" },
  { offense: "Merusak perangkat karena kelalaian", points: "20", sanction: "Wajib mengganti / memperbaiki", tier: "danger" },
  { offense: "Mengubah konfigurasi sistem / jaringan", points: "30", sanction: "Pencabutan hak akses sementara", tier: "critical" },
  { offense: "Menyebarkan virus / malware", points: "40", sanction: "Skorsing lab & panggilan orang tua", tier: "critical" },
  { offense: "Mengakses situs maksiat / konten terlarang", points: "50", sanction: "Pelimpahan ke BK, SP, & Skorsing Labkom", tier: "critical", highlight: true },
];

const TIER_BADGE: Record<PenaltyTier, string> = {
  warn: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  danger: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  critical: "bg-red-100 text-red-800 ring-1 ring-red-200",
};

const STEPS = [
  {
    tone: "green",
    icon: CheckCircle2,
    title: "Tahap 1: Pembinaan Lab (10 – 20 Poin)",
    desc: "Santri mendapatkan teguran lisan dan wajib piket kebersihan lab.",
  },
  {
    tone: "orange",
    icon: Bell,
    title: "Tahap 2: Peringatan Keras (21 – 49 Poin)",
    desc: "Hak akses internet diputus. Layar PC dikunci jarak jauh. Wali Kelas diberikan laporan.",
  },
  {
    tone: "red",
    icon: XCircle,
    title: "Tahap 3: Pelimpahan ke BK (Mencapai 50 Poin)",
    desc: "Batas toleransi habis. Santri dikeluarkan dari lab, dilaporkan ke BK, menerima SP dan Skorsing Labkom.",
  },
] as const;

const STEP_TONE: Record<"green" | "orange" | "red", { ring: string; dot: string; icon: string; border: string }> = {
  green: { ring: "ring-emerald-200", dot: "bg-emerald-500", icon: "text-emerald-600 bg-emerald-50", border: "border-emerald-500" },
  orange: { ring: "ring-orange-200", dot: "bg-orange-500", icon: "text-orange-600 bg-orange-50", border: "border-orange-500" },
  red: { ring: "ring-red-200", dot: "bg-red-500", icon: "text-red-600 bg-red-50", border: "border-red-500" },
};

function Peraturan() {
  return (
    <SiteLayout>
      <div className="bg-slate-50 text-slate-900">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-slate-900/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-5 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/5 text-slate-700 text-[11px] font-bold uppercase tracking-widest ring-1 ring-slate-900/10">
              <ShieldAlert className="size-3.5" /> Dokumen Resmi
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-slate-900 text-balance">
              PERATURAN &amp; TATA TERTIB
            </h1>
            <h2 className="mt-4 text-base sm:text-xl font-medium text-slate-600 text-pretty">
              Pedoman Penggunaan Laboratorium Komputer SMA Riyadhussholihiin
            </h2>
            <blockquote className="mt-8 sm:mt-10 mx-auto max-w-3xl text-left bg-white rounded-2xl border border-slate-200 border-l-4 border-l-slate-900 p-5 sm:p-6 shadow-sm">
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 italic">
                “Laboratorium komputer adalah fasilitas amanah umat yang ditujukan untuk menunjang Kegiatan Belajar Mengajar (KBM).
                Setiap santri wajib mematuhi pedoman berikut untuk menjaga keberkahan ilmu, ketertiban, dan keawetan inventaris sekolah.”
              </p>
            </blockquote>
          </div>
        </section>

        {/* RULES GRID */}
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-8">
          <div className="mb-8 sm:mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Bagian I</div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Pokok-Pokok Peraturan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <article
                  key={rule.title}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 sm:p-7"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <span className="inline-flex items-center justify-center size-11 shrink-0 rounded-xl bg-slate-900 text-white">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-snug pt-1">
                      {rule.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {rule.items.map((it) => (
                      <li key={it.term} className="flex gap-3 text-sm sm:text-[15px] leading-relaxed">
                        <CheckCircle2 className="size-4 mt-1 shrink-0 text-slate-900" />
                        <span className="text-slate-600">
                          <span className="font-semibold text-slate-900">{it.term}:</span> {it.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* POINTS SYSTEM */}
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-8">
          <div className="mb-6 sm:mb-8">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Bagian II</div>
            <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-display font-bold text-slate-900">
              <AlertTriangle className="size-6 sm:size-7 text-amber-500" />
              Sistem Kredit Poin dan Penindakan
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-3xl">
              Sistem poin diterapkan untuk mendidik dan menjaga kedisiplinan. Batas maksimal adalah{" "}
              <span className="font-semibold text-slate-900">50 Poin</span> sebelum diserahkan kepada Bimbingan Konseling (BK).
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left font-semibold px-6 py-4">Bentuk Pelanggaran</th>
                    <th className="text-center font-semibold px-6 py-4 w-28">Poin</th>
                    <th className="text-left font-semibold px-6 py-4">Sanksi Langsung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PENALTIES.map((p, i) => (
                    <tr
                      key={i}
                      className={p.highlight ? "bg-red-50/70" : "hover:bg-slate-50/60 transition-colors"}
                    >
                      <td className={`px-6 py-4 ${p.highlight ? "font-bold text-red-900" : "text-slate-700"}`}>
                        {p.offense}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full text-xs font-bold ${TIER_BADGE[p.tier]}`}>
                          {p.points}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${p.highlight ? "font-semibold text-red-900" : "text-slate-600"}`}>
                        {p.sanction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {PENALTIES.map((p, i) => (
                <div key={i} className={`p-4 ${p.highlight ? "bg-red-50/70" : ""}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className={`text-sm ${p.highlight ? "font-bold text-red-900" : "font-semibold text-slate-900"}`}>
                      {p.offense}
                    </div>
                    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${TIER_BADGE[p.tier]}`}>
                      {p.points}
                    </span>
                  </div>
                  <div className={`text-xs ${p.highlight ? "font-medium text-red-900" : "text-slate-600"}`}>
                    <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400 mr-1">Sanksi:</span>
                    {p.sanction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESCALATION TIMELINE */}
        <section className="max-w-4xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-8">
          <div className="mb-8 sm:mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Bagian III</div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Alur Tindak Lanjut (Eskalasi Poin)
            </h2>
          </div>

          <ol className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-6">
            {STEPS.map((step) => {
              const tone = STEP_TONE[step.tone];
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative pl-8 sm:pl-10">
                  <span className={`absolute -left-[13px] top-1 inline-flex items-center justify-center size-6 rounded-full ${tone.dot} ring-4 ring-white`} />
                  <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${tone.border} shadow-sm p-5 sm:p-6`}>
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`inline-flex items-center justify-center size-9 shrink-0 rounded-lg ${tone.icon}`}>
                        <Icon className="size-5" />
                      </span>
                      <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 leading-snug pt-1">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed sm:pl-12">
                      {step.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* SIGNATURE */}
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="text-right">
            <p className="text-sm sm:text-base text-slate-600">
              Kepala Laboratorium Komputer / Koordinator TIK
            </p>
            <p className="mt-1 text-lg sm:text-xl font-display font-bold text-slate-900">
              SMA Riyadhussholihiin
            </p>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
