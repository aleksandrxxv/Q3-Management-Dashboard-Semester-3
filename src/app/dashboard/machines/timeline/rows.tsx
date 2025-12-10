"use client";

import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";

import TimelineLegend from "@/components/timeline/TimelineLegend";
import TimelineRow from "@/components/timeline/TimelineRow";
import { SelectStartEndDate } from "@/components/SelectStartEndDate";
import { SelectInterval } from "@/components/SelectInterval";

import Header from "../../header";

import { Machine, MachineTimeline } from "@/types/supabase";
import { IntervalType } from "@/types/interval";

import { getMachineTimelines } from "@/lib/data/getMachineTimelines";
import { DATA_MODE } from "@/lib/data/dataMode";

interface RowsProps {
  machines: Machine[];
}

const BUFFER_ROWS = 1;

export default function Rows({ machines }: RowsProps) {
  // DATE / INTERVAL
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2020, 8, 1),
    to: new Date(2020, 8, 30),
  });

  const [interval, setInterval] = useState<IntervalType>(IntervalType.Day);

  // SCROLL / MEASURE
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rowMeasureRef = useRef<HTMLDivElement | null>(null);

  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [rowHeight, setRowHeight] = useState(80);

  // TIMELINE CACHE
  const timelineCache = useRef<Map<string, Promise<MachineTimeline[]>>>(
    new Map()
  );

  const prevVisible = useRef<Set<number>>(new Set());

  // ✅ CACHE KEY INCLUDES DATA MODE
  const cacheKey = (
    machine: Machine,
    from: Date,
    to: Date,
    interval: IntervalType
  ): string =>
    `${DATA_MODE}_${machine.machine_id}_${from.toISOString()}_${to.toISOString()}_${interval}`;

  // MEASURE VIEWPORT
  useEffect(() => {
    const measure = () => {
      if (!scrollRef.current) return;
      setViewportHeight(scrollRef.current.getBoundingClientRect().height);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // MEASURE ROW HEIGHT
  useEffect(() => {
    if (!rowMeasureRef.current) return;
    setRowHeight(rowMeasureRef.current.getBoundingClientRect().height);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // VIRTUALIZATION
  const visibleRows = Math.ceil(viewportHeight / rowHeight) || 10;
  const totalRows = visibleRows + BUFFER_ROWS * 2;

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / rowHeight) - BUFFER_ROWS
  );

  const endIndex = Math.min(machines.length, startIndex + totalRows);
  const visibleMachines = machines.slice(startIndex, endIndex);

  // LOG MACHINES LEAVING VIEW (optional debug)
  useEffect(() => {
    const now = new Set<number>(visibleMachines.map((m) => m.machine_id));

    prevVisible.current = now;
  }, [visibleMachines]);

  // ✅ DATA FETCH (GLOBAL SWITCHED)
  const getData = (machine: Machine): Promise<MachineTimeline[]> => {
    if (!date?.from || !date?.to) {
      return Promise.resolve([]);
    }

    const key = cacheKey(machine, date.from, date.to, interval);
    const cached = timelineCache.current.get(key);
    if (cached) return cached;

    const promise = getMachineTimelines(
      machine.board,
      machine.port,
      date.from,
      date.to,
      interval
    );

    timelineCache.current.set(key, promise);
    return promise;
  };

  // RENDER
  return (
    <div className="flex flex-col gap-1">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <Header
          title="Historical Data"
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

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-auto px-4"
        style={{ height: "calc(100vh - 160px)" }}
      >
        {machines.length > 0 && (
          <div
            ref={rowMeasureRef}
            style={{ position: "absolute", visibility: "hidden" }}
          >
            <TimelineRow
              machine={machines[0]}
              dataPromise={Promise.resolve([])}
            />
          </div>
        )}

        <div style={{ height: machines.length * rowHeight }}>
          <div style={{ height: startIndex * rowHeight }} />

          {visibleMachines.map((machine) => (
            <TimelineRow
              key={machine.machine_id}
              machine={machine}
              dataPromise={getData(machine)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
