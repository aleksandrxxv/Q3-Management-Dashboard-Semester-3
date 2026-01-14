// lib/data/getMachines.ts
import { Machine } from "@/types/supabase";
import { fetchMachines } from "@/lib/supabase/fetchMachines";

export function getMachines(): Promise<Machine[]> {
  return fetchMachines();
}
