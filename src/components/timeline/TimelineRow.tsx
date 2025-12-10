"use client";
import React, { useEffect, useState } from "react";
import StatusIndicator from "./StatusIndicator";
import TimelineChart from "./TimelineChart";
import { Machine, MachineTimeline } from "@/types/supabase";
import { Card } from "../ui/card";
import { DateRange } from "react-day-picker";
import { IntervalType } from "@/types/enum";

interface TimelineRowProps {
  machine: Machine;
  targetEfficiency: number;
  style?: React.CSSProperties;
  date: DateRange | undefined;
  interval: IntervalType;
}

// ⚠️ TEMP PIN — REMOVE BEFORE DEPLOYMENT
const TEMP_ADMIN_PIN = "1234";

// =========================================================
// CHECK IF USER SELECTED YEAR 2026
// =========================================================
function isIn2026(dateRange?: DateRange): boolean {
  if (!dateRange?.from || !dateRange?.to) return false;

  return (
    dateRange.from.getFullYear() === 2026 &&
    dateRange.to.getFullYear() === 2026
  );
}

// =========================================================
// ALERT RATE LIMIT HELPERS (localStorage)
// =========================================================
function getLastAlertTime(machineId: number): number | null {
  const v = localStorage.getItem(`alert_time_${machineId}`);
  return v ? parseInt(v, 10) : null;
}

function setLastAlertTime(machineId: number) {
  localStorage.setItem(`alert_time_${machineId}`, Date.now().toString());
}

function clearLastAlertTime(machineId: number) {
  localStorage.removeItem(`alert_time_${machineId}`);
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  machine,
  style,
  date,
  interval,
}) => {
  const [liveData, setLiveData] = useState<MachineTimeline[]>([]);


  // AUTO ADMIN LOGIN
  async function autoAdminLogin() {
    try {
      const res = await fetch("/api/admin/pin", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ pin: TEMP_ADMIN_PIN }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Auto admin login failed");
        return false;
      }

      console.log("Admin auto-login SUCCESS");
      return true;
    } catch (err) {
      console.error("Admin login error:", err);
      return false;
    }
  }

  // SEND SMS BROADCAST
  async function notifyOffline() {
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Notify failed:", await res.json());
        return;
      }

      console.log("Broadcast SMS SENT!");
    } catch (err) {
      console.error("Broadcast SMS error:", err);
    }
  }

  // TEST MACHINE SIMULATION (ONLY IN 2026)
  useEffect(() => {
    if (machine.machine_name !== "TEST MACHINE") return;
    if (!isIn2026(date)) return;

    let start = Date.now();
    let shots = 1000;

    const loop = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;

      if (elapsed >= 15) {
        shots = 0;
      } else {
        shots -= Math.floor(Math.random() * 15);
        if (shots < 100) shots = 100;
      }

      const entry: MachineTimeline = {
        truncated_timestamp: new Date().toISOString(),
        total_shots: shots,
        average_shot_time: shots === 0 ? 0 : Math.random() * 2 + 1,
      };

      setLiveData((prev) => [...prev.slice(-50), entry]);
    }, 1000);

    return () => clearInterval(loop);
  }, [machine.machine_name, date]);

  // STANDARD 100 SHOT DATA FOR ALL OTHER MACHINES
  useEffect(() => {
    if (machine.machine_name === "TEST MACHINE") return;
    if (!date?.from || !date?.to) return;

    const arr: MachineTimeline[] = [];
    const dayMs = 1000 * 60 * 60 * 24;
    let current = new Date(date.from);

    while (current <= date.to) {
      arr.push({
        truncated_timestamp: new Date(current).toISOString(),
        total_shots: 100,
        average_shot_time: 1.5,
      });

      current = new Date(current.getTime() + dayMs);
    }

    setLiveData(arr);
  }, [machine, date]);

  // OFFLINE DETECTION — EVERY 10 MINUTES
  useEffect(() => {
    if (!isIn2026(date)) return;      
    if (liveData.length === 0) return;

    const last = liveData[liveData.length - 1];
    const machineId = machine.machine_id;

    if (last.total_shots > 0) {
      clearLastAlertTime(machineId);
      return;
    }

    // Machine is offline
    const lastAlert = getLastAlertTime(machineId);
    const now = Date.now();
    const TEN_MIN = 10 * 60 * 1000;

    if (!lastAlert) {
      setLastAlertTime(machineId);
      autoAdminLogin().then((ok) => ok && notifyOffline());
      return;
    }

    if (now - lastAlert >= TEN_MIN) {
      setLastAlertTime(machineId);
      autoAdminLogin().then((ok) => ok && notifyOffline());
      return;
    }
  }, [liveData, date]);

  // ZERO SHOT AREAS FOR CHART
  const zeroAreas = liveData
    .filter((d) => d.total_shots === 0)
    .map((d) => ({
      start: new Date(d.truncated_timestamp),
      end: new Date(d.truncated_timestamp),
    }));

  // RENDER
  return (
    <Card style={style} className="mb-2">
      <div className="flex items-center h-12">
        <div className="w-32 px-4 flex items-center space-x-2">
          <StatusIndicator status={machine.status} />
          <span className="text-sm font-medium">{machine.machine_name}</span>
        </div>

        <div className="flex-1 h-full">
          <TimelineChart data={liveData} interval={interval} zeroAreas={zeroAreas} />
        </div>
      </div>
    </Card>
  );
};

export default React.memo(TimelineRow);
