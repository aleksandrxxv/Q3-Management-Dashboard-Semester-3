// lib/utils/chartData.ts
import { MachineTimeline } from "@/types/supabase";
import { IntervalType } from "@/types/interval";

/**
 * Fill time gaps in chart data - run in frontend
 */
/**
 * Normalize timestamp to ISO string for consistent comparison
 * Handles both with and without timezone, with and without milliseconds
 * Also handles timestamps that might be in different formats from database
 * For day/week intervals, normalizes to midnight UTC for consistent matching
 */
function normalizeTimestamp(timestamp: string | Date, interval?: IntervalType): string {
  if (!timestamp) return '';
  
  let date: Date;
  if (typeof timestamp === 'string') {
    // Parse the timestamp string
    // If it already has timezone info, use it as-is
    if (timestamp.includes('Z') || timestamp.match(/[+-]\d{2}:\d{2}$/)) {
      date = new Date(timestamp);
    } else {
      // If no timezone, assume it's UTC (database timestamp without time zone)
      // Append 'Z' to force UTC interpretation
      date = new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z');
    }
  } else {
    date = timestamp;
  }
  
  // Round to seconds (remove milliseconds) for consistent matching
  const normalized = new Date(date);
  normalized.setUTCMilliseconds(0);
  
  // For day/week intervals, also normalize to midnight UTC
  // This ensures all day timestamps match exactly, preventing spacing issues
  if (interval === IntervalType.Day || interval === IntervalType.Week) {
    normalized.setUTCHours(0, 0, 0, 0);
  }
  
  return normalized.toISOString();
}

export function fillTimeGaps(
  data: MachineTimeline[],
  startDate: Date,
  endDate: Date,
  interval: IntervalType
): MachineTimeline[] {
  // Calculate interval in milliseconds
  const intervalMs = getIntervalMilliseconds(interval);
  
  // Round start date to interval boundary
  let current = roundToInterval(startDate, interval);
  const end = roundToInterval(endDate, interval);
  
  // Calculate expected number of intervals
  const expectedIntervals = Math.floor((end.getTime() - current.getTime()) / intervalMs) + 1;
  
  // Performance optimization: For very large ranges, limit the number of intervals
  // This prevents generating thousands of data points which slows down rendering
  const MAX_INTERVALS = 1000; // Reasonable limit for chart rendering
  if (expectedIntervals > MAX_INTERVALS) {
    // For very large ranges, just return the data as-is without gap filling
    // The chart library can handle sparse data
    console.warn(`[fillTimeGaps] Range too large (${expectedIntervals} intervals), skipping gap filling for performance`);
    return data;
  }
  
  // If we have data, process it to fill gaps
  if (data.length > 0) {
    const dataMap = new Map<string, MachineTimeline>();
    
    // Create lookup map - normalize timestamps for matching
    // Important: Database might return timestamps in different formats
    data.forEach(item => {
      const normalizedKey = normalizeTimestamp(item.truncated_timestamp, interval);
      // Store the original data, not just the key
      dataMap.set(normalizedKey, item);
    });
    
    const result: MachineTimeline[] = [];
    let normalizedCurrent = new Date(current);
    normalizedCurrent.setUTCMilliseconds(0);
    
    // For day/week intervals, ensure we normalize to midnight UTC
    if (interval === IntervalType.Day || interval === IntervalType.Week) {
      normalizedCurrent.setUTCHours(0, 0, 0, 0);
    }
    
    // Generate complete series
    while (current <= end) {
      const normalizedKey = normalizedCurrent.toISOString();
      const existing = dataMap.get(normalizedKey);
      
      result.push({
        truncated_timestamp: normalizedKey,
        total_shots: existing?.total_shots ?? 0,
        average_shot_time: existing?.average_shot_time ?? 0
      });
      
      // Move to next interval
      current = new Date(current.getTime() + intervalMs);
      
      // For day/week intervals, ensure we normalize to midnight UTC
      // This prevents floating point errors or timezone issues from causing spacing problems
      if (interval === IntervalType.Day || interval === IntervalType.Week) {
        current.setUTCHours(0, 0, 0, 0);
        current.setUTCMilliseconds(0);
      }
      
      normalizedCurrent = new Date(current);
      normalizedCurrent.setUTCMilliseconds(0);
      
      // For day/week intervals, ensure normalizedCurrent is also at midnight
      if (interval === IntervalType.Day || interval === IntervalType.Week) {
        normalizedCurrent.setUTCHours(0, 0, 0, 0);
      }
    }
    
    return result;
  } else {
    // No data - generate all zeros
    const result: MachineTimeline[] = [];
    let normalizedCurrent = new Date(current);
    normalizedCurrent.setUTCMilliseconds(0);
    
    // For day/week intervals, ensure we normalize to midnight UTC
    if (interval === IntervalType.Day || interval === IntervalType.Week) {
      normalizedCurrent.setUTCHours(0, 0, 0, 0);
    }
    
    while (current <= end) {
      result.push({
        truncated_timestamp: normalizedCurrent.toISOString(),
        total_shots: 0,
        average_shot_time: 0
      });
      
      current = new Date(current.getTime() + intervalMs);
      
      // For day/week intervals, ensure we normalize to midnight UTC
      // This prevents floating point errors or timezone issues from causing spacing problems
      if (interval === IntervalType.Day || interval === IntervalType.Week) {
        current.setUTCHours(0, 0, 0, 0);
        current.setUTCMilliseconds(0);
      }
      
      normalizedCurrent = new Date(current);
      normalizedCurrent.setUTCMilliseconds(0);
      
      // For day/week intervals, ensure normalizedCurrent is also at midnight
      if (interval === IntervalType.Day || interval === IntervalType.Week) {
        normalizedCurrent.setUTCHours(0, 0, 0, 0);
      }
    }
    
    return result;
  }
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