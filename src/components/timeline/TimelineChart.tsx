"use client";

import React, { useMemo, useCallback } from "react";
import { formatTimestampToInterval } from "@/lib/utils";
import { MachineTimeline } from "@/types/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { IntervalType } from "@/types/interval";

interface TimelineChartProps {
  data: MachineTimeline[];
  interval: IntervalType;
  hideAxis?: boolean;
  hideTooltip?: boolean;
  lineColor?: string;
}

// Memoized tooltip component to prevent recreation on every render
const CustomTooltip = React.memo<{
  active?: boolean;
  payload?: any[];
  interval: IntervalType;
}>(({ active, payload, interval }) => {
  if (!active || !payload || !payload.length) return null;

  const p = payload[0]?.payload as MachineTimeline | undefined;
  if (!p) return null;

  const ts = p.truncated_timestamp
    ? new Date(p.truncated_timestamp).toLocaleString("nl-NL")
    : "No data";

  const shots =
    typeof p.total_shots === "number" && Number.isFinite(p.total_shots)
      ? p.total_shots
      : "No data";

  const avg = p.average_shot_time;
  const fmt = (v: unknown, digits = 2) =>
    typeof v === "number" && Number.isFinite(v) ? v.toFixed(digits) : "No data";

  return (
    <div className="bg-white left-0 p-2 z-50 rounded-lg shadow-md">
      <p className="text-sm text-gray-500">{ts}</p>
      <p className="text-sm text-gray-500">Shots: {shots}</p>
      <p className="text-sm text-gray-500">
        Avg shot time: {fmt(avg, 2)}
        {typeof avg === "number" && Number.isFinite(avg) ? "s" : ""}
      </p>
    </div>
  );
});

CustomTooltip.displayName = "CustomTooltip";

const TimelineChart: React.FC<TimelineChartProps> = ({
  data,
  interval,
  hideAxis = false,
  lineColor = "#3B82F6",
  hideTooltip = false,
}) => {
  // Normalize incoming data so chart logic never crashes.
  // - total_shots: treat null/undefined as 0 (since you visualize "zero" areas + line)
  // - average_shot_time: keep null if not a valid number (tooltip will show "No data")
  // - Convert timestamps to numeric values for proper time-based spacing on XAxis
  // - For day intervals, normalize to midnight UTC to ensure consistent spacing
  const safeData = useMemo(() => {
    return (data ?? []).map((d) => {
      const timestamp = d.truncated_timestamp;
      let timestampMs: number;
      
      if (timestamp) {
        const date = new Date(timestamp);
        
        // For day intervals, normalize to midnight UTC to ensure consistent spacing
        // This prevents issues where timestamps might have slight time differences
        if (interval === IntervalType.Day || interval === IntervalType.Week) {
          date.setUTCHours(0, 0, 0, 0);
        }
        
        timestampMs = date.getTime();
      } else {
        timestampMs = Date.now();
      }
      
      return {
        ...d,
        truncated_timestamp: timestamp, // Keep original for display
        timestampMs, // Numeric value for proper spacing
        total_shots: typeof d.total_shots === "number" ? d.total_shots : 0,
        average_shot_time:
          typeof d.average_shot_time === "number" && Number.isFinite(d.average_shot_time)
            ? d.average_shot_time
            : null,
      };
    });
  }, [data, interval]);

  // Optimize zero areas: limit to max 50 areas to prevent performance issues
  // For very sparse data, we'll render fewer ReferenceAreas
  // Use numeric timestamps for proper spacing
  const zeroAreas = useMemo(() => {
    const areas: { startMs: number; endMs: number }[] = [];
    let currentStartMs: number | null = null;

    safeData.forEach((item, idx) => {
      const isZero = (item.total_shots ?? 0) === 0;

      if (isZero && currentStartMs === null) {
        currentStartMs = item.timestampMs;
      }

      const nextIsZero = ((safeData[idx + 1]?.total_shots ?? 0) === 0);

      if (currentStartMs !== null && (!nextIsZero || idx === safeData.length - 1)) {
        areas.push({
          startMs: currentStartMs,
          endMs: item.timestampMs,
        });
        currentStartMs = null;
      }
    });

    // Limit to 50 areas max for performance
    return areas.slice(0, 50);
  }, [safeData]);

  // Memoize tick formatters to prevent recreation
  const xAxisTickFormatter = useCallback(
    (value: any) => (value ? formatTimestampToInterval(value, interval) ?? "" : ""),
    [interval]
  );

  const yAxisTickFormatter = useCallback(
    (value: any) =>
      typeof value === "number" && Number.isFinite(value) ? value.toFixed(0) : "",
    []
  );

  if (!safeData || safeData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={safeData}
        margin={
          !hideAxis
            ? { top: 1, right: 0, left: 0, bottom: -10 }
            : { top: 0, right: 0, left: 0, bottom: 0 }
        }
      >
        {zeroAreas.map((area, i) => (
          <ReferenceArea
            key={i}
            x1={area.startMs}
            x2={area.endMs}
            strokeOpacity={0}
            fill="red"
            fillOpacity={0.25}
          />
        ))}

        {!hideAxis && (
          <XAxis
            type="number"
            dataKey="timestampMs"
            scale="linear"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => {
              // Convert numeric timestamp back to date string for formatting
              const dateStr = new Date(value).toISOString();
              return xAxisTickFormatter(dateStr);
            }}
            domain={safeData.length > 0 ? [
              safeData[0].timestampMs,
              safeData[safeData.length - 1].timestampMs
            ] : ['dataMin', 'dataMax']}
          />
        )}

        {!hideAxis && (
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={yAxisTickFormatter}
            domain={[0, 5]}
          />
        )}

        {!hideTooltip && (
          <Tooltip
            content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} interval={interval} />
            )}
          />
        )}

        <ReferenceLine y={5} stroke="#9CA3AF" strokeDasharray="3 3" />

        <Line
          type="monotone"
          dataKey="total_shots"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default React.memo(TimelineChart);
