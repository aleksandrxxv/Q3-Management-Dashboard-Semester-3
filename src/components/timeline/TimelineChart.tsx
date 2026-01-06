"use client";

import React, { useMemo } from "react";
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

const TimelineChart: React.FC<TimelineChartProps> = ({
  data,
  interval,
  hideAxis = false,
  lineColor = "#3B82F6",
  hideTooltip = false,
}) => {
  // Safe number formatter: if null/undefined/not a finite number => "No data"
  const fmt = (v: unknown, digits = 2) =>
    typeof v === "number" && Number.isFinite(v) ? v.toFixed(digits) : "No data";

  // Normalize incoming data so chart logic never crashes.
  // - total_shots: treat null/undefined as 0 (since you visualize "zero" areas + line)
  // - average_shot_time: keep null if not a valid number (tooltip will show "No data")
  const safeData = useMemo(() => {
    return (data ?? []).map((d) => ({
      ...d,
      total_shots: typeof d.total_shots === "number" ? d.total_shots : 0,
      average_shot_time:
        typeof d.average_shot_time === "number" && Number.isFinite(d.average_shot_time)
          ? d.average_shot_time
          : null,
    }));
  }, [data]);

  const zeroAreas = useMemo(() => {
    const areas: { start: any; end: any }[] = [];
    let currentStart: any = null;

    safeData.forEach((item, idx) => {
      const isZero = (item.total_shots ?? 0) === 0;

      if (isZero && currentStart === null) {
        currentStart = item.truncated_timestamp;
      }

      const nextIsZero = ((safeData[idx + 1]?.total_shots ?? 0) === 0);

      if (currentStart && (!nextIsZero || idx === safeData.length - 1)) {
        areas.push({
          start: currentStart,
          end: item.truncated_timestamp,
        });
        currentStart = null;
      }
    });

    return areas;
  }, [safeData]);

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
            x1={area.start}
            x2={area.end}
            strokeOpacity={0}
            fill="red"
            fillOpacity={0.25}
          />
        ))}

        {!hideAxis && (
          <XAxis
            dataKey="truncated_timestamp"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) =>
              value ? formatTimestampToInterval(value, interval) : ""
            }
          />
        )}

        {!hideAxis && (
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(value) =>
              typeof value === "number" && Number.isFinite(value)
                ? value.toFixed(0)
                : ""
            }
            domain={[0, 5]}
          />
        )}

        {!hideTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;

              // recharts payload typing is loose; treat it defensively
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
            }}
          />
        )}

        <ReferenceLine y={5} stroke="#9CA3AF" strokeDasharray="3 3" />

        <Line
          type="monotone"
          dataKey="total_shots"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimelineChart;
