import { supabase } from "@/integrations/supabase/client";

export type SettingsMap = Record<string, string>;

export async function fetchSettings(): Promise<SettingsMap> {
  const { data, error } = await supabase.from("settings").select("key,value");
  if (error) throw error;
  const map: SettingsMap = {};
  for (const r of data ?? []) map[r.key] = r.value ?? "";
  return map;
}
