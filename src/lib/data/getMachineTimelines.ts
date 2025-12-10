// lib/data/getMachineTimelines.ts
import { DATA_MODE } from "./dataMode";
import { IntervalType } from "@/types/interval";
import { MachineTimeline } from "@/types/supabase";

// FAKE
import { fetchFakeChartData } from "@/lib/supabase/fetchFakeMachineTimelines";

// REAL
import { fetchChartData } from "@/lib/supabase/fetchMachineTimelines";

export function getMachineTimelines(
  board: number,
  port: number,
  from: Date,
  to: Date,
  interval: IntervalType
): Promise<MachineTimeline[]> {
  return DATA_MODE === "real"
    ? fetchChartData(board, port, from, to, interval)
    : fetchFakeChartData(board, port, from, to, interval);
}
