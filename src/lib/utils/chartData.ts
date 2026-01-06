// lib/utils/chartData.ts
import { MachineTimeline } from "@/types/supabase";
import { IntervalType } from "@/types/interval";

/**
 * Fill time gaps in chart data - run in frontend
 */
export function fillTimeGaps(
  data: MachineTimeline[],
  startDate: Date,
  endDate: Date,
  interval: IntervalType
): MachineTimeline[] {
  if (!data.length) return [];
  
  const result: MachineTimeline[] = [];
  const dataMap = new Map<string, MachineTimeline>();
  
  // Create lookup map from existing data
  data.forEach(item => {
    dataMap.set(item.truncated_timestamp, item);
  });
  
  // Calculate interval in milliseconds
  const intervalMs = getIntervalMilliseconds(interval);
  
  // Round start date to interval boundary
  let current = roundToInterval(startDate, interval);
  const end = roundToInterval(endDate, interval);
  
  // Generate complete series
  while (current <= end) {
    const timestamp = current.toISOString();
    const existing = dataMap.get(timestamp);
    
    result.push({
      truncated_timestamp: timestamp,
      total_shots: existing?.total_shots || 0,
      average_shot_time: existing?.average_shot_time || 0
    });
    
    // Move to next interval
    current = new Date(current.getTime() + intervalMs);
  }
  
  return result;
}

/**
 * Convert 5-minute intervals from minute data
 */
export function aggregateTo5Minutes(
  minuteData: MachineTimeline[]
): MachineTimeline[] {
  if (!minuteData.length) return [];
  
  const aggregated = new Map<string, { shots: number; totalTime: number }>();
  
  minuteData.forEach(item => {
    const date = new Date(item.truncated_timestamp);
    // Round to nearest 5 minutes
    const minutes = date.getMinutes();
    date.setMinutes(Math.floor(minutes / 5) * 5, 0, 0);
    const key = date.toISOString();
    
    const existing = aggregated.get(key) || { shots: 0, totalTime: 0 };
    existing.shots += item.total_shots;
    
    // Handle null average_shot_time safely
    const avgTime = item.average_shot_time || 0;
    existing.totalTime += item.total_shots * avgTime;
    
    aggregated.set(key, existing);
  });
  
  return Array.from(aggregated.entries()).map(([timestamp, data]) => ({
    truncated_timestamp: timestamp,
    total_shots: data.shots,
    average_shot_time: data.shots > 0 ? data.totalTime / data.shots : 0
  }));
}

/**
 * Handle 5-minute intervals directly (if DB returns 5-min data)
 */
export function handle5MinuteIntervals(
  data: MachineTimeline[],
  startDate: Date,
  endDate: Date
): MachineTimeline[] {
  if (!data.length) return [];
  
  // If data is already at 5-minute intervals, just fill gaps
  const aggregated = aggregateTo5Minutes(data);
  
  return fillTimeGaps(aggregated, startDate, endDate, IntervalType.FiveMinute);
}

// Helper functions remain the same
function getIntervalMilliseconds(interval: IntervalType): number {
  switch (interval) {
    case IntervalType.Minute: return 60 * 1000;
    case IntervalType.FiveMinute: return 5 * 60 * 1000;
    case IntervalType.Hour: return 60 * 60 * 1000;
    case IntervalType.Day: return 24 * 60 * 60 * 1000;
    case IntervalType.Week: return 7 * 24 * 60 * 60 * 1000;
    default: return 60 * 60 * 1000;
  }
}

function roundToInterval(date: Date, interval: IntervalType): Date {
  const d = new Date(date);
  
  switch (interval) {
    case IntervalType.Minute:
      d.setUTCSeconds(0, 0);
      break;
    case IntervalType.FiveMinute:
      d.setUTCMinutes(Math.floor(d.getUTCMinutes() / 5) * 5, 0, 0);
      d.setUTCSeconds(0, 0);
      break;
    case IntervalType.Hour:
      d.setUTCMinutes(0, 0, 0);
      break;
    case IntervalType.Day:
    case IntervalType.Week:
      d.setUTCHours(0, 0, 0, 0);
      break;
  }
  
  return d;
}