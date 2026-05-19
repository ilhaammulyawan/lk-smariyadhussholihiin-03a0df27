import type { LucideIcon } from "lucide-react";
import { Crown, GraduationCap, FlaskConical, BookOpen, Users, Wrench, Network, UserCog } from "lucide-react";

export type RoleKey =
  | "kepala_sekolah"
  | "wakil_kepala"
  | "kepala_lab"
  | "koordinator_tik"
  | "guru_tik"
  | "teknisi"
  | "it_jaringan"
  | "pengurus"
  // backward-compat
  | "kepala";

export type RoleMeta = {
  key: RoleKey;
  label: string;
  tier: number; // 1 = highest
  icon: LucideIcon;
  accent: string; // tailwind text color class
};

export const ROLES: RoleMeta[] = [
  { key: "kepala_sekolah", label: "Kepala Sekolah", tier: 1, icon: Crown, accent: "text-amber-600" },
  { key: "wakil_kepala", label: "Wakil Kepala Sekolah", tier: 2, icon: GraduationCap, accent: "text-indigo-600" },
  { key: "kepala_lab", label: "Kepala Lab Komputer", tier: 2, icon: FlaskConical, accent: "text-brand" },
  { key: "kepala", label: "Kepala Lab Komputer", tier: 2, icon: FlaskConical, accent: "text-brand" },
  { key: "koordinator_tik", label: "Koordinator TIK", tier: 3, icon: BookOpen, accent: "text-teal-600" },
  { key: "guru_tik", label: "Guru TIK / Informatika", tier: 3, icon: BookOpen, accent: "text-teal-600" },
  { key: "pengurus", label: "Pengurus Lab", tier: 4, icon: Users, accent: "text-slate-600" },
  { key: "teknisi", label: "Teknisi Lab", tier: 4, icon: Wrench, accent: "text-orange-600" },
  { key: "it_jaringan", label: "IT & Jaringan", tier: 5, icon: Network, accent: "text-cyan-600" },
];

export const ROLE_MAP: Record<string, RoleMeta> = Object.fromEntries(
  ROLES.map((r) => [r.key, r]),
);

export function getRoleMeta(role: string | null | undefined): RoleMeta {
  if (role && ROLE_MAP[role]) return ROLE_MAP[role];
  return { key: "pengurus", label: role || "Pengurus", tier: 4, icon: UserCog, accent: "text-slate-600" };
}
