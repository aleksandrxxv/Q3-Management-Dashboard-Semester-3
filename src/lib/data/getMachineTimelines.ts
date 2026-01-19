// lib/data/getMachineTimelines.ts
import { IntervalType } from "@/types/interval";
import { MachineTimeline } from "@/types/supabase";
import { fetchChartData } from "@/lib/supabase/fetchMachineTimelines";

/**
 * Client-side function for fetching machine timelines
 * Uses in-memory caching from fetchChartData for fast repeated requests
 * 
 * For server-side usage, use getMachineTimelinesCached instead
 */
export function getMachineTimelines(
  board: number,
  port: number,
  from: Date,
  to: Date,
  interval: IntervalType
): Promise<MachineTimeline[]> {
  return fetchChartData(board, port, from, to, interval, false);
}
