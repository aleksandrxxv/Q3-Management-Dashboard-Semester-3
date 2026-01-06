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
  interval?: IntervalType; // Add interval prop!
}

const TimelineRow: React.FC<Props> = ({ 
  machine, 
  data, 
  dataPromise,
  interval = IntervalType.Day // Default to Day
}) => {
  const [resolvedData, setResolvedData] = useState<MachineTimeline[]>(
    data ?? []
  );

  // Process data with gap filling
  const processedData = useMemo(() => {
    if (!resolvedData.length) return [];
    
    let processed = resolvedData;
    
    // Handle 5-minute aggregation if needed
    if (interval === IntervalType.FiveMinute) {
      // Note: For 5-min data, you might need a different fetch strategy
      // This assumes you get minute data and aggregate
      processed = aggregateTo5Minutes(resolvedData);
    }
    
    return processed;
  }, [resolvedData, interval]);

  // Resolve promise if provided
  useEffect(() => {
    if (!dataPromise) return;
    dataPromise.then(setResolvedData);
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