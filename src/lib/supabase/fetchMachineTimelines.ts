// src/lib/supabase/fetchMachineTimelines.ts

import { supabase } from './client';
import { MachineTimeline } from '../../types/supabase';
import { IntervalType } from '@/types/enum';

/**
 * Clamp the requested date range for heavy intervals so we don't
 * overload Supabase / Postgres. We NEVER skip the fetch; we only
 * shrink the range from the left if it's too large.
 */
const clampRangeByInterval = (
    startDate: Date,
    endDate: Date,
    interval: IntervalType
): { normalizedStart: Date; normalizedEnd: Date } => {
    // Use the dates the user actually picked (no UTC day expansion)
    let normalizedStart = new Date(startDate);
    const normalizedEnd = new Date(endDate);

    const diffMs = normalizedEnd.getTime() - normalizedStart.getTime();
    const hourMs = 60 * 60 * 1000;

    let maxMs: number | null = null;

    switch (interval) {
        case IntervalType.Minute:
            // At most 24h for raw minute data
            maxMs = 24 * hourMs;
            break;

        case IntervalType.FiveMinutes:
            // At most 72h (3 days) for 5-minute data
            maxMs = 72 * hourMs;
            break;

        case IntervalType.Hour:
            // Example: at most 31 days for hourly data
            maxMs = 31 * 24 * hourMs;
            break;

        default:
            // Day / Week etc → no clamp
            maxMs = null;
            break;
    }

    if (maxMs !== null && diffMs > maxMs) {
        // Clamp the start so we don’t overload Supabase
        normalizedStart = new Date(normalizedEnd.getTime() - maxMs);

        console.warn('[get_monitoring_intervals] Range clamped', {
            interval,
            from: normalizedStart.toISOString(),
            to: normalizedEnd.toISOString(),
        });
    }

    return { normalizedStart, normalizedEnd };
};

export const fetchChartData = async (
    board: number,
    port: number,
    startDate: Date,
    endDate: Date,
    interval: IntervalType,
    realtime = false
): Promise<MachineTimeline[]> => {
    let normalizedStart: Date;
    let normalizedEnd: Date;

    if (!realtime) {
        const clamped = clampRangeByInterval(startDate, endDate, interval);
        normalizedStart = clamped.normalizedStart;
        normalizedEnd = clamped.normalizedEnd;
    } else {
        // Realtime: last 12 hours → +1h
        normalizedEnd = new Date(Date.now() + 1 * 60 * 60 * 1000);
        normalizedStart = new Date(Date.now() - 12 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase.rpc('get_monitoring_intervals', {
        board_input: board,
        port_input: port,
        start_date: normalizedStart.toISOString(),
        end_date: normalizedEnd.toISOString(),
        interval_input: interval, // "minute", "5 minute", "hour", ...
    });

    console.log('fetchChartData', {
        interval,
        normalizedStart,
        normalizedEnd,
        dataLength: data?.length ?? 0,
        error,
    });

    if (error) {
        throw new Error(`Error fetching chart data: ${error.message}`);
    }

    return data || [];
};

export const fetchRealtimeData = async (
    board: number,
    port: number
): Promise<MachineTimeline[]> => {
    const endDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
    const startDate = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const interval = IntervalType.Hour;

    const { data, error } = await supabase.rpc('get_monitoring_intervals', {
        board_input: board,
        port_input: port,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        interval_input: interval,
    });

    console.log('fetchRealtimeData', { dataLength: data?.length ?? 0, error });

    if (error) {
        throw new Error(`Error fetching realtime chart data: ${error.message}`);
    }

    return data || [];
};
