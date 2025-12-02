"use client";

import { useState } from "react";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import StatusIndicator from "@/components/timeline/StatusIndicator";
import MachineChart from "./MachineChart";

export default function MachineRowWithChart({ machine }) {
  const [open, setOpen] = useState(false);
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadChart() {
    if (loading || chartData) return;

    setLoading(true);

    const res = await fetch(`/api/machine/${machine.machine_id}/timeline`);
    const json = await res.json();

    setChartData(json.data || []);
    setLoading(false);
  }

  function toggle() {
    setOpen((prev) => !prev);
    if (!open) {
      loadChart();
    }
  }

  return (
    <>
      {/* MAIN ROW */}
      <TableRow
        onClick={toggle}
        className="cursor-pointer hover:bg-gray-50 transition"
      >
        <TableCell className="flex items-center gap-2">
          <StatusIndicator status={machine.status} />
          {machine.status}
        </TableCell>

        <TableCell className="font-medium">
          {machine.machine_name || `Machine ${machine.machine_id}`}
        </TableCell>

        <TableCell className="text-right">
          {machine.avg_shot_time.toFixed(2)}
        </TableCell>

        <TableCell>{machine.total_shots}</TableCell>

        <TableCell>
          {machine.last_update
            ? new Date(machine.last_update).toLocaleString()
            : "N/A"}
        </TableCell>
      </TableRow>

      {/* DROPDOWN ROW */}
      {open && (
        <TableRow>
          <TableCell colSpan={5} className="bg-gray-50">
            <div className="p-4">

              {loading && (
                <div className="text-center py-6 text-gray-500">
                  Loading chart…
                </div>
              )}

              {!loading && chartData && (
                <MachineChart data={chartData} />
              )}

            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
