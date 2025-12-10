// lib/data/getMachines.ts
import { DATA_MODE } from "./dataMode";
import { Machine } from "@/types/supabase";

// FAKE
import { fetchFakeMachines } from "@/lib/supabase/fetchFakeMachines";

// REAL
import { fetchMachines } from "@/lib/supabase/fetchMachines";

export function getMachines(): Promise<Machine[]> {
  switch (DATA_MODE) {
    case "real":
      return fetchMachines();
    case "fake":
    default:
      return fetchFakeMachines();
  }
}
