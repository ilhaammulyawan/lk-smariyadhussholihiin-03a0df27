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
  BookOpen,
  Users,
  Server,
  Wifi,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Heart, Monitor, ShieldAlert, Lock, Wrench, AlertTriangle,
  CheckCircle2, XCircle, Bell, BookOpen, Users, Server, Wifi, Trash2,
};

export type PenaltyTier = "warn" | "danger" | "critical";
export type StepTone = "green" | "orange" | "red";

export type PeraturanContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    blockquote: string;
  };
  rulesSectionTitle: string;
  rulesEyebrow: string;
  rules: {
    icon: string;
    title: string;
    items: { term: string; desc: string }[];
  }[];
  penaltiesSectionTitle: string;
  penaltiesEyebrow: string;
  penaltiesIntro: string;
  penalties: {
    offense: string;
    points: string;
    sanction: string;
    tier: PenaltyTier;
    highlight?: boolean;
  }[];
  escalationSectionTitle: string;
  escalationEyebrow: string;
  steps: {
    tone: StepTone;
    icon: string;
    title: string;
    desc: string;
  }[];
  signature: {
    role: string;
    school: string;
  };
};

export const DEFAULT_PERATURAN: PeraturanContent = {
  hero: {
    eyebrow: "Dokumen Resmi",
    title: "PERATURAN & TATA TERTIB",
    subtitle: "Pedoman Penggunaan Laboratorium Komputer SMA Riyadhussholihiin",
    blockquote:
      "Laboratorium komputer adalah fasilitas amanah umat yang ditujukan untuk menunjang Kegiatan Belajar Mengajar (KBM). Setiap santri wajib mematuhi pedoman berikut untuk menjaga keberkahan ilmu, ketertiban, dan keawetan inventaris sekolah.",
  },
  rulesEyebrow: "Bagian I",
  rulesSectionTitle: "Pokok-Pokok Peraturan",
  rules: [
    {
      icon: "Heart",
      title: "1. Adab, Niat, dan Persiapan",
      items: [
        { term: "Meluruskan Niat", desc: "Menuntut ilmu untuk mencari ridha Allah, bukan sekadar bermain." },
        { term: "Menjaga Lisan", desc: "Dilarang berbicara kasar, gaduh, atau mengganggu teman." },
        { term: "Adab Memasuki Ruangan", desc: "Mengucap salam, melepas alas kaki, dan masuk dengan tertib." },
        { term: "Barang Bawaan", desc: "Hanya membawa alat tulis dan perangkat yang diperlukan untuk KBM." },
      ],
    },
    {
      icon: "Monitor",
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
      icon: "ShieldAlert",
      title: "3. Kepatuhan Syariat (Aturan Mutlak)",
      items: [
        { term: "Menjaga Pandangan", desc: "Dilarang keras mengakses konten yang bertentangan dengan syariat." },
        { term: "Larangan Hiburan Sia-sia", desc: "Tidak memutar musik, film, atau permainan tanpa izin." },
      ],
    },
    {
      icon: "Lock",
      title: "4. Keamanan Sistem dan Jaringan",
      items: [
        { term: "Keamanan Sistem Utama", desc: "Dilarang mengubah pengaturan sistem, password, atau konfigurasi jaringan." },
        { term: "Penggunaan Perangkat Eksternal", desc: "Flashdisk/HDD wajib dipindai sebelum digunakan." },
      ],
    },
    {
      icon: "Wrench",
      title: "5. Kebersihan dan Perawatan Inventaris",
      items: [
        { term: "Kawasan Bebas Makanan/Minuman", desc: "Dilarang membawa makanan/minuman ke dalam lab." },
        { term: "Menjaga Kebersihan", desc: "Membuang sampah pada tempatnya dan menjaga meja tetap rapi." },
        { term: "Perawatan Alat", desc: "Gunakan mouse, keyboard, dan headset dengan hati-hati." },
        { term: "Prosedur Shutdown", desc: "Matikan komputer sesuai SOP setelah selesai digunakan." },
        { term: "Kerapian Akhir", desc: "Rapikan kursi dan pastikan meja bersih sebelum meninggalkan lab." },
      ],
    },
  ],
  penaltiesEyebrow: "Bagian II",
  penaltiesSectionTitle: "Sistem Kredit Poin dan Penindakan",
  penaltiesIntro:
    "Sistem poin diterapkan untuk mendidik dan menjaga kedisiplinan. Batas maksimal adalah 50 Poin sebelum diserahkan kepada Bimbingan Konseling (BK).",
  penalties: [
    { offense: "Terlambat masuk / tidak tertib berbaris", points: "2", sanction: "Teguran lisan", tier: "warn" },
    { offense: "Membawa makanan atau minuman ke dalam lab", points: "5", sanction: "Membersihkan area lab", tier: "warn" },
    { offense: "Gaduh / mengganggu KBM", points: "5", sanction: "Peringatan & catatan pengawas", tier: "warn" },
    { offense: "Membuka aplikasi/situs di luar materi", points: "10", sanction: "Sesi ditutup, tugas tetap diselesaikan", tier: "danger" },
    { offense: "Bermain game saat jam pelajaran", points: "15", sanction: "Peringatan tertulis + lapor wali kelas", tier: "danger" },
    { offense: "Merusak perangkat karena kelalaian", points: "20", sanction: "Wajib mengganti / memperbaiki", tier: "danger" },
    { offense: "Mengubah konfigurasi sistem / jaringan", points: "30", sanction: "Pencabutan hak akses sementara", tier: "critical" },
    { offense: "Menyebarkan virus / malware", points: "40", sanction: "Skorsing lab & panggilan orang tua", tier: "critical" },
    { offense: "Mengakses situs maksiat / konten terlarang", points: "50", sanction: "Pelimpahan ke BK, SP, & Skorsing Labkom", tier: "critical", highlight: true },
  ],
  escalationEyebrow: "Bagian III",
  escalationSectionTitle: "Alur Tindak Lanjut (Eskalasi Poin)",
  steps: [
    { tone: "green", icon: "CheckCircle2", title: "Tahap 1: Pembinaan Lab (10 – 20 Poin)", desc: "Santri mendapatkan teguran lisan dan wajib piket kebersihan lab." },
    { tone: "orange", icon: "Bell", title: "Tahap 2: Peringatan Keras (21 – 49 Poin)", desc: "Hak akses internet diputus. Layar PC dikunci jarak jauh. Wali Kelas diberikan laporan." },
    { tone: "red", icon: "XCircle", title: "Tahap 3: Pelimpahan ke BK (Mencapai 50 Poin)", desc: "Batas toleransi habis. Santri dikeluarkan dari lab, dilaporkan ke BK, menerima SP dan Skorsing Labkom." },
  ],
  signature: {
    role: "Kepala Laboratorium Komputer / Koordinator TIK",
    school: "SMA Riyadhussholihiin",
  },
};

export function parsePeraturanContent(raw: string | undefined | null): PeraturanContent {
  if (!raw) return DEFAULT_PERATURAN;
  try {
    const parsed = JSON.parse(raw);
    // shallow merge with defaults for resilience
    return {
      ...DEFAULT_PERATURAN,
      ...parsed,
      hero: { ...DEFAULT_PERATURAN.hero, ...(parsed.hero ?? {}) },
      signature: { ...DEFAULT_PERATURAN.signature, ...(parsed.signature ?? {}) },
    };
  } catch {
    return DEFAULT_PERATURAN;
  }
}
