// components/timeline/TimelineRow.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Machine, MachineTimeline } from "@/types/supabase";
import StatusIndicator from "./StatusIndicator";
import TimelineChart from "./TimelineChart";
import { Card } from "../ui/card";
import { IntervalType } from "@/types/interval";
import { fillTimeGaps, aggregateTo5Minutes } from "@/lib/utils/chartData";

interface Props {
  machine: Machine;
  data?: MachineTimeline[];
  dataPromise?: Promise<MachineTimeline[]>;
  interval?: IntervalType;
  startDate?: Date;
  endDate?: Date;
}

const TimelineRow: React.FC<Props> = ({ 
  machine, 
  data, 
  dataPromise,
  interval = IntervalType.Day,
  startDate,
  endDate,
}) => {
  const [resolvedData, setResolvedData] = useState<MachineTimeline[]>(
    data ?? []
  );

  // Process data with gap filling - memoized for performance
  const processedData = useMemo(() => {
    // Early return if no date range
    if (!startDate || !endDate) {
      return resolvedData.length > 0 ? resolvedData : [];
    }
    
    // If no data, fill with zeros
    if (!resolvedData.length) {
      return fillTimeGaps([], startDate, endDate, interval);
    }
    
    let processed = resolvedData;
    
    // Handle 5-minute aggregation if needed
    if (interval === IntervalType.FiveMinute) {
      processed = aggregateTo5Minutes(resolvedData);
    }
    
    // Fill time gaps with zero values for missing intervals
    processed = fillTimeGaps(processed, startDate, endDate, interval);
    
    return processed;
  }, [resolvedData, interval, startDate, endDate]);

  // Resolve promise if provided - use AbortController for cleanup
  useEffect(() => {
    if (!dataPromise) return;
    
    let cancelled = false;
    dataPromise.then((data) => {
      if (!cancelled) {
        setResolvedData(data);
      }
    }).catch((error) => {
      if (!cancelled) {
        console.error('Error loading timeline data:', error);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [dataPromise]);

  return (
    <Card className="mb-2">
      <div className="flex items-center h-12">
        <div className="w-32 px-4 flex items-center gap-2">
          <StatusIndicator status={machine.status} />
          <span className="text-sm font-medium truncate">
            {machine.machine_name}
          </span>
        </div>

        <div className="flex-1 h-full">
          <TimelineChart 
            interval={interval} 
            data={processedData} 
          />
        </div>
      </div>
    </Card>
  );
};

export default React.memo(TimelineRow);