"use client";
import TimelineLegend from "@/components/timeline/TimelineLegend";
import TimelineRow from "@/components/timeline/TimelineRow";
import { Machine } from "@/types/supabase";
import Header from "../../header";
import { SelectStartEndDate } from "@/components/SelectStartEndDate";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { SelectInterval } from "@/components/SelectInterval";
import { IntervalType } from "@/types/enum";

interface RowsProps {
  machines: Machine[];
}

export default function Rows({ machines }: RowsProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2020, 8, 1),
    to: new Date(2020, 8, 30),
  });

  const [interval, setInterval] = useState<IntervalType>(IntervalType.Day);

  return (
    <div className="flex flex-col gap-1 ">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <Header
          title={"Historical Data"}
          description="Here you can view the historical machine shot data"
        >
          <div className="flex gap-2">
            <SelectInterval
              interval={interval}
              setInterval={setInterval}
              date={date}
              setDate={setDate}
            />

            <SelectStartEndDate
              date={date}
              setDate={setDate}
              className="w-min"
            />
          </div>
        </Header>
        <TimelineLegend />
      </div>

      <div className="flex-1 overflow-auto px-4">
        {/* All machines displayed at once */}
        {machines.map((machine) => (
          <TimelineRow
            key={machine.machine_id}
            machine={machine}
            targetEfficiency={0}
            date={date}
            interval={interval}
          />
        ))}
      </div>
    </div>
  );
}