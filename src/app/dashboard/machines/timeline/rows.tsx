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

const PAGE_SIZE = 5;

export default function Rows({ machines }: RowsProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2020, 8, 1),
    to: new Date(2020, 8, 30),
  });

  const [interval, setInterval] = useState<IntervalType>(IntervalType.Day);

  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(machines.length / PAGE_SIZE);

  const paginatedMachines = machines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
        {/* Machines for this page */}
        {paginatedMachines.map((machine) => (
          <TimelineRow
            key={machine.machine_id}
            machine={machine}
            targetEfficiency={0}
            date={date}
            interval={interval}
          />
        ))}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
