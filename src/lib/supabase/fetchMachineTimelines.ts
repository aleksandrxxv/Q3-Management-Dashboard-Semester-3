import { supabase } from './client';
import { MachineTimeline } from '../../types/supabase';
import { IntervalType } from '@/types/enum';

// Helper: clamp how big the range can be for heavy intervals
const clampRange = (start: Date, end: Date, interval: IntervalType) => {
    const msInDay = 1000 * 60 * 60 * 24;
    const diffDays = (end.getTime() - start.getTime()) / msInDay;

    // ⚠️ Adjust these limits to what feels reasonable for your app
    if (interval === IntervalType.Minute && diffDays > 1) {
        // Max 1 day for minute-level
        const newStart = new Date(end);
        newStart.setDate(end.getDate() - 1);
        return { start: newStart, end };
    }

    if (interval === IntervalType.Hour && diffDays > 7) {
        // Max 7 days for hour-level
        const newStart = new Date(end);
        newStart.setDate(end.getDate() - 7);
        return { start: newStart, end };
    }

    // For daily or coarser, you can allow more, or leave it as is
    return { start, end };
};

export const fetchChartData = async (
    board: number,
    port: number,
    startDate: Date,
    endDate: Date,
    interval: IntervalType,
    realtime = false
): Promise<MachineTimeline[]> => {
    // Clamp large ranges so we don't kill the DB
    const clamped = clampRange(startDate, endDate, interval);

    let normalizedStart = new Date(
        Date.UTC(
            clamped.start.getFullYear(),
            clamped.start.getMonth(),
            clamped.start.getDate(),
            0,
            0,
            0
        )
    );

    let normalizedEnd: Date;

    if (!realtime) {
        // End at end-of-day UTC for non-realtime
        normalizedEnd = new Date(
            Date.UTC(
                clamped.end.getFullYear(),
                clamped.end.getMonth(),
                clamped.end.getDate(),
                23,
                59,
                59
            )
        );
    } else {
        // For realtime, end is "now + 1h"
        normalizedEnd = new Date(Date.now() + 1 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase.rpc('get_monitoring_intervals', {
        board_input: board,
        port_input: port,
        start_date: normalizedStart.toISOString(),
        end_date: normalizedEnd.toISOString(),
        interval_input: interval,
    });

    console.log('fetchChartData', { data, error });

    if (error) {
        // Important: throw, so caller can catch and not crash the app
        throw new Error(`Error fetching chart data: ${error.message}`);
    }

    return data || [];
};

// fetch realtime timeline
export const fetchRealtimeData = async (
    board: number,
    port: number
): Promise<MachineTimeline[]> => {
    const startDate = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
    const endDate = new Date(Date.now() + 1 * 60 * 60 * 1000);   // +1 hour

    const interval = IntervalType.Hour;

    const { data, error } = await supabase.rpc('get_monitoring_intervals', {
        board_input: board,
        port_input: port,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        interval_input: interval,
    });

    console.log('fetchRealtimeData', { data, error });

    if (error) {
        throw new Error(`Error fetching realtime chart data: ${error.message}`);
    }

    return data || [];
};
