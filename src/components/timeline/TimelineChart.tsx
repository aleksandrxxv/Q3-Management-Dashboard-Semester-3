// src/components/timeline/TimelineChart.tsx

import { formatTimestampToInterval } from '@/lib/utils';
import { MachineTimeline } from '@/types/supabase';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { IntervalType } from '@/types/enum';

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
  lineColor = '#2563EB', // nice blue
  hideTooltip = false,
}) =>
  data && data.length > 0 ? (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={
          !hideAxis
            ? { top: 4, right: 8, left: 0, bottom: -6 }
            : { top: 2, right: 8, left: 0, bottom: 0 }
        }
      >
        {/* light dashed grid like the Q3 screenshot */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        {!hideAxis && (
          <XAxis
            dataKey="truncated_timestamp"
            tick={{ fontSize: 10, fill: '#6B7280' }}
            tickFormatter={(value) =>
              value && formatTimestampToInterval(value, interval)
            }
            tickMargin={4}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
        )}

        {!hideAxis && (
          <YAxis
            tick={{ fontSize: 10, fill: '#6B7280' }}
            tickFormatter={(value: number) => value.toFixed(0)}
            domain={[0, 5]} // 0–5 shots, as in Q3 example
            axisLine={false}
            tickLine={false}
            width={22}
          />
        )}

        {!hideTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload as MachineTimeline & {
                  truncated_timestamp?: string;
                  total_shots?: number;
                  average_shot_time?: number;
                };

                return (
                  <div className="bg-white p-2 rounded-lg shadow-md text-xs space-y-1">
                    <p className="text-gray-500">
                      {p.truncated_timestamp
                        ? new Date(p.truncated_timestamp).toLocaleString(
                            'nl-NL'
                          )
                        : ''}
                    </p>
                    <p className="text-gray-700">
                      Shots:{' '}
                      <span className="font-medium">
                        {p.total_shots ?? 0}
                      </span>
                    </p>
                    {typeof p.average_shot_time === 'number' && (
                      <p className="text-gray-700">
                        Avg shot time:{' '}
                        <span className="font-medium">
                          {p.average_shot_time.toFixed(2)}s
                        </span>
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
        )}

        {/* Target line at 5 shots */}
        <ReferenceLine y={5} stroke="#9CA3AF" strokeDasharray="3 3" />

        <Line
          className="z-0 relative"
          type="monotone"
          dataKey="total_shots"
          stroke={lineColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
      No data available
    </div>
  );

export default TimelineChart;
