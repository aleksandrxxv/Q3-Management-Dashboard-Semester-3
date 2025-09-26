import { Link } from "react-router-dom";
import { useState } from "react";
import MachineRow from "./MachineRow";
import MachineGraph from "./MachineGraph";
import MoldPill from "./MoldPill";




const machineData = [
  {
    id: 1,
    name: "Machine 1",
    status: "Operational",
    output: "Active",
    lastChecked: "24/08/2023 08:42 AM",
    molds: [
      { moldId: 1, moldName: "Mold A" },
      { moldId: 2, moldName: "Mold B" },
    ],
    shots: [
        { timestamp: "2025-09-22T08:00:00", shotTime: 12.4 },
        { timestamp: "2025-09-25T09:00:00", shotTime: 11.8 },
        { timestamp: "2025-09-25T10:00:00", shotTime: 13.1 },
        { timestamp: "2025-09-26T08:00:00", shotTime: 12.0 },
        { timestamp: "2025-09-26T09:00:00", shotTime: 14.2 },
    ],
  },
  {
    id: 2,
    name: "Machine 2",
    status: "Maintenance",
    output: "Inactive",
    lastChecked: "24/08/2023 11:23 PM",
    molds: [
      { moldId: 3, moldName: "Mold A" },
      { moldId: 4, moldName: "Mold B" },
    ],
    shots: [
      { timestamp: "08:00", shotTime: 20.2 },
      { timestamp: "08:15", shotTime: 18.9 },
      { timestamp: "08:30", shotTime: 21.0 },
      { timestamp: "00:45", shotTime: 19.4 },
    ],
  },
  {
    id: 2,
    name: "Machine 3",
    status: "Inactive",
    output: "Inactive",
    lastChecked: "24/08/2023 11:23 PM",
    molds: [
      { moldId: 5, moldName: "Mold A" },
      { moldId: 6, moldName: "Mold B" },
    ],
    shots: [
      { timestamp: "08:00", shotTime: 20.2 },
      { timestamp: "08:15", shotTime: 18.9 },
      { timestamp: "08:30", shotTime: 21.0 },
      { timestamp: "08:45", shotTime: 19.4 },
    ],
  },
];

export default function MachineTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [timeRanges, setTimeRanges] = useState({}); // per-machine time range

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Fake filter logic (replace with real API or aggregation later)
  const filterShots = (shots, range) => {
    if (range === "5m") return shots.slice(-1);
    if (range === "10m") return shots.slice(-2);
    if (range === "1h") return shots; // demo: show all
    if (range === "1d") return shots; // later: group by hour
    if (range === "1w") return shots; // later: group by day
    return shots;
  };

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Machine Name</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Output</th>
            <th className="px-4 py-3">Last Checked</th>
            <th className="px-4 py-3">Alerts</th>
            <th className="px-4 py-3 text-right">Expand</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {machineData.map((machine) => {
            const currentRange = timeRanges[machine.id] || "1h";

            return (
              <>
                <MachineRow
                  key={machine.id}
                  {...machine}
                  isExpanded={expandedRow === machine.id}
                  toggleRow={() => toggleRow(machine.id)}
                />
                <tr>
                  <td colSpan="6" className="p-0">
                    <div
                      className={`grid transition-all duration-500 ease-in-out ${
                        expandedRow === machine.id
                          ? "grid-rows-[1fr] p-6 bg-gray-50"
                          : "grid-rows-[0fr] p-0 bg-transparent"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-4">
                          {/* Pills Row */}
                          <div className="flex flex-wrap gap-2">
                            {machine.molds.map((mold) => (
                              <MoldPill key={mold.moldId} mold={mold} />
                            ))}
                          </div>

                          {/* Time Range Filters */}
                          <div className="flex gap-2">
                            {["5m", "10m", "1h", "1d", "1w"].map((range) => (
                              <button
                                key={range}
                                onClick={() =>
                                  setTimeRanges((prev) => ({
                                    ...prev,
                                    [machine.id]: range,
                                  }))
                                }
                                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                                  currentRange === range
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                              >
                                {range}
                              </button>
                            ))}
                          </div>

                          {/* Graph */}
                          <MachineGraph
                            machineName={machine.name}
                            data={filterShots(machine.shots, currentRange)}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
