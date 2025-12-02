import { formatTimestampToInterval } from '@/lib/utils';
import { MachineTimeline } from '@/types/supabase';
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
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
  lineColor = '#3B82F6',
  hideTooltip = false
}) => {

  const zeroAreas = useMemo(() => {
    const areas: { start: any; end: any }[] = [];
    let currentStart: any = null;

    data.forEach((item, idx) => {
      const isZero = item.total_shots === 0;

      if (isZero && currentStart === null) {
        currentStart = item.truncated_timestamp;
      }

      const nextIsZero = data[idx + 1]?.total_shots === 0;

      if (currentStart && (!nextIsZero || idx === data.length - 1)) {
        areas.push({
          start: currentStart,
          end: item.truncated_timestamp,
        });
        currentStart = null;
      }
    });

    return areas;
  }, [data]);


  return data && data.length > 0 ? (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
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
              value && formatTimestampToInterval(value, interval)
            }
          />
        )}

        {!hideAxis && (
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => value.toFixed(0)}
            domain={[0, 5]}
          />
        )}

        {!hideTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white left-0 p-2 z-50 rounded-lg shadow-md">
                    <p className="text-sm text-gray-500">
                      {payload[0].payload.truncated_timestamp
                        ? new Date(payload[0].payload.truncated_timestamp).toLocaleString('nl-NL')
                        : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shots: {payload[0].payload.total_shots}
                    </p>
                    <p className="text-sm text-gray-500">
                      Avg shot time: {payload[0].payload.average_shot_time.toFixed(2)}s
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        )}

        <ReferenceLine y={5} stroke="#9CA3AF" strokeDasharray="3 3" />

        {/* Main production line */}
        <Line
          type="monotone"
          dataKey="total_shots"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="h-full flex items-center justify-center text-gray-400">
      No data available
    </div>
  );
};

export default TimelineChart;
