"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { DateRange } from "react-day-picker";

import TimelineLegend from "@/components/timeline/TimelineLegend";
import TimelineRow from "@/components/timeline/TimelineRow";
import { SelectStartEndDate } from "@/components/SelectStartEndDate";
import { SelectInterval } from "@/components/SelectInterval";

import Header from "../../header";

import { Machine, MachineTimeline } from "@/types/supabase";
import { IntervalType } from "@/types/interval";

import { getMachineTimelines } from "@/lib/data/getMachineTimelines";

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
  
  // Track loading state for visible machines
  const [loadingCount, setLoadingCount] = useState(0);
  
  // Reset loading count when date/interval changes
  useEffect(() => {
    setLoadingCount(0);
  }, [date, interval]);

  // Auto-adjust date range when switching to restricted intervals (minute, five_minute, hour)
  useEffect(() => {
    if (!date?.from || !date?.to) return;

    const isRestrictedInterval = 
      interval === IntervalType.Minute || 
      interval === IntervalType.FiveMinute || 
      interval === IntervalType.Hour;

    if (isRestrictedInterval) {
      const diff = date.to.getTime() - date.from.getTime();
      const oneDay = 1000 * 60 * 60 * 24;

      // If range exceeds 1 day, cap it to 1 day from the start date
      if (diff > oneDay) {
        const maxDate = new Date(date.from);
        maxDate.setDate(maxDate.getDate() + 1);
        maxDate.setHours(23, 59, 59, 999);
        setDate({
          from: date.from,
          to: maxDate,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]); // Only run when interval changes to avoid infinite loops

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

  // Cache key for timeline data
  const cacheKey = (
    machine: Machine,
    from: Date,
    to: Date,
    interval: IntervalType
  ): string =>
    `${machine.machine_id}_${from.toISOString()}_${to.toISOString()}_${interval}`;

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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // VIRTUALIZATION - memoized for performance
  const visibleRows = useMemo(() => Math.ceil(viewportHeight / rowHeight) || 10, [viewportHeight, rowHeight]);
  const totalRows = useMemo(() => visibleRows + BUFFER_ROWS * 2, [visibleRows]);

  const startIndex = useMemo(
    () => Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS),
    [scrollTop, rowHeight]
  );

  const endIndex = useMemo(
    () => Math.min(machines.length, startIndex + totalRows),
    [machines.length, startIndex, totalRows]
  );
  
  const visibleMachines = useMemo(
    () => machines.slice(startIndex, endIndex),
    [machines, startIndex, endIndex]
  );

  // LOG MACHINES LEAVING VIEW (optional debug)
  useEffect(() => {
    const now = new Set<number>(visibleMachines.map((m) => m.machine_id));

    prevVisible.current = now;
  }, [visibleMachines]);

  // ✅ PROGRESSIVE LOADING: Load visible machines first, then others
  useEffect(() => {
    if (!date?.from || !date?.to) return;

    const fromDate = date.from;
    const toDate = date.to;

    // Priority 1: Visible machines + buffer (load immediately)
    const visibleMachinesToLoad = machines.slice(
      Math.max(0, startIndex - BUFFER_ROWS),
      Math.min(machines.length, endIndex + BUFFER_ROWS)
    );

    // Priority 2: Other machines (load progressively after a delay)
    const otherMachines = [
      ...machines.slice(0, Math.max(0, startIndex - BUFFER_ROWS)),
      ...machines.slice(Math.min(machines.length, endIndex + BUFFER_ROWS)),
    ];

    // Load visible machines immediately (these are what user sees)
    visibleMachinesToLoad.forEach((machine) => {
      const key = cacheKey(machine, fromDate, toDate, interval);
      if (!timelineCache.current.has(key)) {
        getMachineTimelines(
          machine.board,
          machine.port,
          fromDate,
          toDate,
          interval
        ).catch(() => {
          // Silently fail on prefetch errors
        });
      }
    });

    // Load other machines progressively (staggered to avoid overwhelming)
    if (otherMachines.length > 0) {
      const delay = 500; // Start loading others after 500ms
      const batchSize = 3; // Load 3 at a time
      const batchDelay = 200; // 200ms between batches

      setTimeout(() => {
        otherMachines.forEach((machine, index) => {
          const key = cacheKey(machine, fromDate, toDate, interval);
          if (!timelineCache.current.has(key)) {
            setTimeout(() => {
              getMachineTimelines(
                machine.board,
                machine.port,
                fromDate,
                toDate,
                interval
              ).catch(() => {
                // Silently fail on prefetch errors
              });
            }, Math.floor(index / batchSize) * batchDelay);
          }
        });
      }, delay);
    }
  }, [visibleMachines, date, interval, startIndex, endIndex, machines]);

  // ✅ DATA FETCH (GLOBAL SWITCHED)
  const getData = (machine: Machine, isVisibleMachine: boolean = false): Promise<MachineTimeline[]> => {
    if (!date?.from || !date?.to) {
      return Promise.resolve([]);
    }

    const key = cacheKey(machine, date.from, date.to, interval);
    const cached = timelineCache.current.get(key);
    if (cached) {
      // Return cached promise immediately
      return cached;
    }

    // Track loading for visible machines
    if (isVisibleMachine) {
      setLoadingCount(prev => prev + 1);
    }

    // Create promise and cache it before making the request
    // This ensures deduplication even if multiple components request same data
    const promise = getMachineTimelines(
      machine.board,
      machine.port,
      date.from,
      date.to,
      interval
    )
      .finally(() => {
        if (isVisibleMachine) {
          setLoadingCount(prev => Math.max(0, prev - 1));
        }
      })
      .catch((error) => {
        // Remove from cache on error so it can be retried
        timelineCache.current.delete(key);
        throw error;
      });

    timelineCache.current.set(key, promise);
    return promise;
  };

  // RENDER
  return (
    <div className="flex flex-col gap-1">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <Header
          title="Historical Data"
          description={
            loadingCount > 0 
              ? `Loading charts... (${loadingCount} remaining)`
              : "Here you can view the historical machine shot data"
          }
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
              interval={interval}
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
              interval={interval}
              startDate={date?.from}
              endDate={date?.to}
            />
          </div>
        )}

        <div style={{ height: machines.length * rowHeight }}>
          <div style={{ height: startIndex * rowHeight }} />

          {visibleMachines.map((machine) => (
            <TimelineRow
              key={machine.machine_id}
              machine={machine}
              dataPromise={getData(machine, true)}
              interval={interval}
              startDate={date?.from}
              endDate={date?.to}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
