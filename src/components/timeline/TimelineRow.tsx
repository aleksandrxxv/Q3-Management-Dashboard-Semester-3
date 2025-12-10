"use client";

import React, { useEffect, useState } from "react";
import { Machine, MachineTimeline } from "@/types/supabase";
import StatusIndicator from "./StatusIndicator";
import TimelineChart from "./TimelineChart";
import { Card } from "../ui/card";
import { IntervalType } from "@/types/interval";

interface Props {
  machine: Machine;
  data?: MachineTimeline[];
  dataPromise?: Promise<MachineTimeline[]>;
}

const TimelineRow: React.FC<Props> = ({ machine, data, dataPromise }) => {
  const [resolvedData, setResolvedData] = useState<MachineTimeline[]>(
    data ?? []
  );

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
          <TimelineChart interval={IntervalType.Day} data={resolvedData} />
        </div>
      </div>
    </Card>
  );
};

export default React.memo(TimelineRow);
