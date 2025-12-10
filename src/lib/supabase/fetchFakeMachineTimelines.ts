import { supabase } from "./client";
import { MachineTimeline } from "@/types/supabase";
import { IntervalType } from "@/types/interval";


/**
 * Parameters for the RPC call
 */
interface MonitoringIntervalsParams {
  board_input: number;
  port_input: number;
  start_date: string;
  end_date: string;
  interval_input: IntervalType;
}

/**
 * Fake RPC ONLY
 */
const RPC_FUNCTION_NAME = "get_fake_monitoring_intervals";

/**
 * Cache TTL by interval (ms)
 */
const CACHE_TTL: Record<IntervalType, number> = {
  [IntervalType.Minute]: 30_000,
  [IntervalType.FiveMinutes]: 60_000,
  [IntervalType.Hour]: 5 * 60_000,
  [IntervalType.Day]: 15 * 60_000,
  [IntervalType.Week]: 30 * 60_000,
};


// =============================================================================
// Cache
// =============================================================================

interface CacheEntry {
  data: MachineTimeline[];
  timestamp: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<MachineTimeline[]>>();

const roundTimestamp = (iso: string, interval: IntervalType): string => {
  const d = new Date(iso);

  switch (interval) {
    case IntervalType.Minute:
      d.setSeconds(0, 0);
      break;
    case IntervalType.Hour:
      d.setMinutes(0, 0, 0);
      break;
    case IntervalType.Day:
    case IntervalType.Week:
      d.setHours(0, 0, 0, 0);
      break;
  }

  return d.toISOString();
};

const cacheKey = (p: MonitoringIntervalsParams) =>
  `${p.board_input}:${p.port_input}:${roundTimestamp(
    p.start_date,
    p.interval_input
  )}:${roundTimestamp(p.end_date, p.interval_input)}:${p.interval_input}`;

const getFromCache = (key: string): MachineTimeline[] | null => {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (
  key: string,
  data: MachineTimeline[],
  interval: IntervalType
) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL[interval],
  });
};

// =============================================================================
// Core fetch
// =============================================================================

const fetchFromRPC = async (
  params: MonitoringIntervalsParams
): Promise<MachineTimeline[]> => {
  const key = cacheKey(params);

  const cached = getFromCache(key);
  if (cached) return cached;

  const pending = pendingRequests.get(key);
  if (pending) return pending;

  console.log("[FAKE RPC]", RPC_FUNCTION_NAME, params);

  const promise = (async () => {
    try {
      const { data, error } = await supabase.rpc(RPC_FUNCTION_NAME, params);
      if (error) throw error;

      const result: MachineTimeline[] = data ?? [];
      setCache(key, result, params.interval_input);
      return result;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
};


// Public API (same signature as real one)


export const fetchFakeChartData = async (
  board: number,
  port: number,
  start: Date,
  end: Date,
  interval: IntervalType
): Promise<MachineTimeline[]> =>
  fetchFromRPC({
    board_input: board,
    port_input: port,
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    interval_input: interval,
  });

export const invalidateFakeCache = () => cache.clear();
export const getFakeCacheStats = () => ({
  size: cache.size,
  pending: pendingRequests.size,
});
