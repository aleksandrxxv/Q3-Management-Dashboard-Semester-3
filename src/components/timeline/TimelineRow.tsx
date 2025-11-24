// src/components/timeline/TimelineRow.tsx

"use client";
import React, { useEffect, useMemo, useState } from 'react';
import StatusIndicator from './StatusIndicator';
import TimelineChart from './TimelineChart';
import { Machine, MachineTimeline } from '@/types/supabase';
import { fetchChartData } from '@/lib/supabase/fetchMachineTimelines';
import { Card } from '../ui/card';
import { DateRange } from 'react-day-picker';
import { IntervalType } from '@/types/enum';

interface TimelineRowProps {
  machine: Machine;
  targetEfficiency?: number;
  style?: React.CSSProperties;
  date: DateRange | undefined;
  interval: IntervalType;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  machine,
  style,
  date,
  interval,
}) => {
  const [liveData, setLiveData] = useState<MachineTimeline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!date?.from || !date?.to) return;

    let cancelled = false;

    // Small debounce so we don't spam Supabase when filters change
    const timeout = setTimeout(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setErrorText(null);

          const data = await fetchChartData(
            machine.board,
            machine.port,
            date.from!,
            date.to!,
            interval
          );

          if (!cancelled) {
            setLiveData(data);
          }
        } catch (err: any) {
          console.error('TimelineRow fetch error', err);
          if (!cancelled) {
            setErrorText(
              err?.message ?? 'Failed to load timeline data.'
            );
            setLiveData([]);
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

      fetchData();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [machine.board, machine.port, date?.from, date?.to, interval]);

  // 🔍 Only clamp by date on coarser intervals (day/hour/week)
  const filteredData = useMemo(() => {
    if (!date?.from || !date?.to) return liveData;

    // For very fine intervals (Minute, 5 Minutes), trust the backend range
    if (
      interval === IntervalType.Minute ||
      interval === IntervalType.FiveMinutes // adjust name if different
    ) {
      return liveData;
    }

    const fromMs = new Date(
      date.from.getFullYear(),
      date.from.getMonth(),
      date.from.getDate(),
      0, 0, 0, 0
    ).getTime();

    const toMs = new Date(
      date.to.getFullYear(),
      date.to.getMonth(),
      date.to.getDate(),
      23, 59, 59, 999
    ).getTime();

    return liveData.filter((point) => {
      if (!point.truncated_timestamp) return false;
      const ts = new Date(point.truncated_timestamp).getTime();
      return ts >= fromMs && ts <= toMs;
    });
  }, [liveData, date?.from, date?.to, interval]);

  return (
    <Card style={style} className="mb-2">
      <div className="flex items-center h-16">
        <div className="w-32 flex items-center text-left px-4">
          <div className="flex items-center space-x-3">
            <StatusIndicator status={machine.status} />
            <span className="text-sm font-medium text-gray-900 truncate">
              {machine.machine_name || `Machine ${machine.machine_id}`}
            </span>
          </div>
        </div>

        <div className="flex-1 h-full">
          {errorText && (
            <div className="text-xs text-red-500 px-2 pb-1">
              {errorText}
            </div>
          )}

          {isLoading && !errorText && (
            <div className="text-xs text-gray-400 px-2 pb-1">
              Loading timeline…
            </div>
          )}

          <TimelineChart
            interval={interval}
            data={filteredData}
          />
        </div>
      </div>
    </Card>
  );
};

export default React.memo(TimelineRow);
