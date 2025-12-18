import { supabase } from './client';
import { IntervalType } from "@/types/interval";
import { INTERVALS } from "@/config/intervals";


// =============================================================================
// TYPES -
// =============================================================================

/**
 * Interval types
 */


/**
 * Return type from get_monitoring_intervals function
 *
 */
export interface MachineTimeline {
  truncated_timestamp: string;  // TIMESTAMPTZ
  total_shots: number;          // INT
  average_shot_time: number;    // NUMERIC/FLOAT
}

/**
 * Parameters for the RPC call
 */
interface MonitoringIntervalsParams {
  board_input: number;
  port_input: number;
  start_date: string;   // ISO string -> TIMESTAMPTZ
  end_date: string;     // ISO string -> TIMESTAMPTZ
  interval_input: IntervalType;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const RPC_FUNCTION_NAME = 'get_monitoring_intervals';

// Cache TTL based on interval type (milliseconds)
const CACHE_TTL: Record<IntervalType, number> = {
  [IntervalType.Minute]: 30 * 1000,       // 30 sec - minute data changes fast
  [IntervalType.FiveMinute]: 60 * 1000,   // 1 min
  [IntervalType.Hour]: 5 * 60 * 1000,     // 5 min
  [IntervalType.Day]: 15 * 60 * 1000,     // 15 min
  [IntervalType.Week]: 30 * 60 * 1000,    // 30 min - weekly data is stable
};

// =============================================================================
// CACHE IMPLEMENTATION
// =============================================================================

interface CacheEntry {
  data: MachineTimeline[];
  timestamp: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<MachineTimeline[]>>();

/**
 * Generate cache key - rounds timestamps to reduce cache fragmentation
 */
const generateCacheKey = (params: MonitoringIntervalsParams): string => {
  const startRounded = roundTimestamp(params.start_date, params.interval_input);
  const endRounded = roundTimestamp(params.end_date, params.interval_input);
  return `${params.board_input}:${params.port_input}:${startRounded}:${endRounded}:${params.interval_input}`;
};

/**
 * Round timestamp based on interval to improve cache hit rate
 */
const roundTimestamp = (isoString: string, interval: IntervalType): string => {
  const date = new Date(isoString);

  switch (interval) {
    case IntervalType.Minute:
      date.setSeconds(0, 0);
      break;
    case IntervalType.FiveMinute:
      date.setMinutes(Math.floor(date.getMinutes() / 5) * 5, 0, 0);
      break;
    case IntervalType.Hour:
      date.setMinutes(0, 0, 0);
      break;
    case IntervalType.Day:
    case IntervalType.Week:
      date.setHours(0, 0, 0, 0);
      break;
  }

  return date.toISOString();
};

const getFromCache = (key: string): MachineTimeline[] | null => {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) cache.delete(key);
    return null;
  }
  return entry.data;
};

const setInCache = (
  key: string,
  data: MachineTimeline[],
  interval: IntervalType
): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL[interval],
  });

  // Prevent memory leaks
  if (cache.size > 100) {
    pruneCache();
  }
};

const pruneCache = (): void => {
  const now = Date.now();

  // Remove expired
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }

  // Remove oldest if still too large
  if (cache.size > 50) {
    const sorted = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (let i = 0; i < cache.size - 50; i++) {
      cache.delete(sorted[i][0]);
    }
  }
};

// =============================================================================
// CORE FETCH FUNCTION
// =============================================================================

/**
 * Fetches data from PostgreSQL function with caching and deduplication
 */
const fetchFromRPC = async (
  params: MonitoringIntervalsParams,
  bypassCache = false
): Promise<MachineTimeline[]> => {
  const cacheKey = generateCacheKey(params);

  //  Check cache
  if (!bypassCache) {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  }

  // Check if same request is already in-flight
  const pending = pendingRequests.get(cacheKey);
  if (pending) return pending;

  // Make request
  const requestPromise = (async () => {
    try {
      const { data, error } = await supabase.rpc(RPC_FUNCTION_NAME, {
        board_input: params.board_input,
        port_input: params.port_input,
        start_date: params.start_date,
        end_date: params.end_date,
        interval_input: params.interval_input,
      });

      if (error) {
        throw new Error(`RPC error: ${error.message}`);
      }

      const result: MachineTimeline[] = data ?? [];
      setInCache(cacheKey, result, params.interval_input);

      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Fetches chart data for a specific board, port, and time range.
 */
export const fetchChartData = async (
  board: number,
  port: number,
  startDate: Date,
  endDate: Date,
  interval: IntervalType,
  realtime = false
): Promise<MachineTimeline[]> => {
  const params: MonitoringIntervalsParams = {
    board_input: board,
    port_input: port,
    start_date: startDate.toISOString(),
    end_date: realtime
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
      : endDate.toISOString(),
    interval_input: interval,
  };

  return fetchFromRPC(params, realtime);
};

/**
 * Fetches 12 hours of real-time timeline data with hourly granularity.
 */
export const fetchRealtimeData = async (
  board: number,
  port: number
): Promise<MachineTimeline[]> => {
  const params: MonitoringIntervalsParams = {
    board_input: board,
    port_input: port,
    start_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    interval_input: IntervalType.Hour,
  };

  return fetchFromRPC(params, false);
};

/**
 * Prefetch data in background (fire and forget)
 */
export const prefetchChartData = (
  board: number,
  port: number,
  startDate: Date,
  endDate: Date,
  interval: IntervalType
): void => {
  fetchChartData(board, port, startDate, endDate, interval).catch(() => {});
};

/**
 * Clear cache for specific board/port or all
 */
export const invalidateCache = (board?: number, port?: number): void => {
  if (board === undefined && port === undefined) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    const [b, p] = key.split(':');
    if (
      (board === undefined || Number(b) === board) &&
      (port === undefined || Number(p) === port)
    ) {
      cache.delete(key);
    }
  }
};

/**
 * Debug helper
 */
export const getCacheStats = () => ({
  size: cache.size,
  pending: pendingRequests.size,
});