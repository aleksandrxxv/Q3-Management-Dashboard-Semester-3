// lib/data/getMachineTimelinesCached.ts
// Server-side cached version for use in server components
import { unstable_cache } from "next/cache";
import { IntervalType } from "@/types/interval";
import { MachineTimeline } from "@/types/supabase";
import { fetchChartData } from "@/lib/supabase/fetchMachineTimelines";

/**
 * Server-side cached version for faster initial loads
 * Use this in server components (pages, server components)
 * Cache key includes all parameters to ensure correctness
 */
export async function getMachineTimelinesCached(
  board: number,
  port: number,
  from: Date,
  to: Date,
  interval: IntervalType
): Promise<MachineTimeline[]> {
  // Round dates to improve cache hit rate
  const fromRounded = roundDate(from, interval);
  const toRounded = roundDate(to, interval);
  
  const cacheKey = `machine-timeline-${board}-${port}-${fromRounded.toISOString()}-${toRounded.toISOString()}-${interval}`;
  
  return unstable_cache(
    () => fetchChartData(board, port, from, to, interval, false),
    [cacheKey],
    {
      revalidate: getCacheRevalidateTime(interval),
      tags: [`machine-${board}-${port}`, `interval-${interval}`],
    }
  )();
}

/**
 * Round date based on interval to improve cache hit rate
 */
function roundDate(date: Date, interval: IntervalType): Date {
  const rounded = new Date(date);
  
  switch (interval) {
    case IntervalType.Minute:
      rounded.setSeconds(0, 0);
      break;
    case IntervalType.FiveMinute:
      rounded.setMinutes(Math.floor(rounded.getMinutes() / 5) * 5, 0, 0);
      break;
    case IntervalType.Hour:
      rounded.setMinutes(0, 0, 0);
      break;
    case IntervalType.Day:
    case IntervalType.Week:
      rounded.setHours(0, 0, 0, 0);
      break;
  }
  
  return rounded;
}

/**
 * Get cache revalidation time based on interval
 */
function getCacheRevalidateTime(interval: IntervalType): number {
  switch (interval) {
    case IntervalType.Minute:
      return 30; // 30 seconds
    case IntervalType.FiveMinute:
      return 60; // 1 minute
    case IntervalType.Hour:
      return 300; // 5 minutes
    case IntervalType.Day:
      return 900; // 15 minutes
    case IntervalType.Week:
      return 1800; // 30 minutes
    default:
      return 300;
  }
}
