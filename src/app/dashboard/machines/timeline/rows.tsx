"use client";

import TimelineLegend from "@/components/timeline/TimelineLegend";
import TimelineRow from "@/components/timeline/TimelineRow";
import { Machine, MachineTimeline } from "@/types/supabase";
import Header from "../../header";
import { SelectStartEndDate } from "@/components/SelectStartEndDate";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { SelectInterval } from "@/components/SelectInterval";
import { IntervalType } from "@/types/enum";
import { fetchChartData } from "@/lib/supabase/fetchMachineTimelines";

interface RowsProps {
  machines: Machine[];
}

const BUFFER_ROWS = 3;

export default function Rows({ machines }: RowsProps) {
  // ----------------------------------
  // DATE / INTERVAL
  // ----------------------------------
  const [date, setDate] = useState<DateRange>({
    from: new Date(2020, 8, 1),
    to: new Date(2020, 8, 30),
  });

  const [interval, setInterval] = useState<IntervalType>(IntervalType.Day);

  // ----------------------------------
  // SCROLL / MEASURE
  // ----------------------------------
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rowMeasureRef = useRef<HTMLDivElement | null>(null);

  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [rowHeight, setRowHeight] = useState(80);

  // ----------------------------------
  // TIMELINE CACHE
  // ----------------------------------
  const timelineCache = useRef<
    Map<string, Promise<MachineTimeline[]>>
  >(new Map());

  const prevVisible = useRef<Set<string>>(new Set());

  const cacheKey = (
    machine: Machine,
    from: Date,
    to: Date,
    interval: IntervalType
  ) =>
    `${machine.machine_id}_${from.toISOString()}_${to.toISOString()}_${interval}`;

  // ----------------------------------
  // MEASURE VIEWPORT
  // ----------------------------------
  useEffect(() => {
    const measure = () => {
      if (!scrollRef.current) return;
      setViewportHeight(scrollRef.current.getBoundingClientRect().height);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ----------------------------------
  // MEASURE ROW HEIGHT (ONCE)
  // ----------------------------------
  useEffect(() => {
    if (!rowMeasureRef.current) return;
    setRowHeight(rowMeasureRef.current.getBoundingClientRect().height);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // ----------------------------------
  // VIRTUALIZATION
  // ----------------------------------
  const visibleRows = Math.ceil(viewportHeight / rowHeight) || 10;
  const totalRows = visibleRows + BUFFER_ROWS * 2;

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / rowHeight) - BUFFER_ROWS
  );

  const endIndex = Math.min(machines.length, startIndex + totalRows);
  const visibleMachines = machines.slice(startIndex, endIndex);

  // ----------------------------------
  // FRONTEND WINDOW LOGS
  // ----------------------------------
  useEffect(() => {
    console.groupCollapsed("🧠 [FRONTEND ROW WINDOW]");
    console.log("Visible rows:", visibleRows);
    console.log("Mounted rows:", totalRows);
    console.log(
      "Machines IN VIEW:",
      visibleMachines.map((m) => m.machine_name)
    );
    console.groupEnd();
  }, [startIndex, endIndex, visibleRows]);

  // ----------------------------------
  // LOG MACHINES LEAVING VIEW
  // ----------------------------------
  useEffect(() => {
    const now = new Set(visibleMachines.map((m) => m.machine_id));

    prevVisible.current.forEach((id) => {
      if (!now.has(id)) {
        const m = machines.find((x) => x.machine_id === id);
        console.log("👋 [ROW LEFT VIEW]", m?.machine_name);
      }
    });

    prevVisible.current = now;
  }, [visibleMachines, machines]);

  // ----------------------------------
  // DATA FETCH (PROMISE CACHED ✅)
  // ----------------------------------
  const getData = (machine: Machine) => {
    if (!date?.from || !date?.to) {
      return Promise.resolve([]);
    }

    const key = cacheKey(machine, date.from, date.to, interval);
    const cached = timelineCache.current.get(key);

    if (cached) return cached;

    const promise = fetchChartData(
      machine.board,
      machine.port,
      date.from,
      date.to,
      interval
    );

    timelineCache.current.set(key, promise);
    return promise;
  };

  // ----------------------------------
  // RENDER
  // ----------------------------------
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
            <SelectStartEndDate date={date} setDate={setDate} />
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
