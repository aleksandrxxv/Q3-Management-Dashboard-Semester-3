"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface MachineChartProps {
  data: Array<{
    timestamp: string;
    shots: number;
  }>;
}

export default function MachineChart({ data }: MachineChartProps) {
  return (
    <div className="p-4 bg-white rounded border">
      <LineChart width={600} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="shots" stroke="#0070f3" />
      </LineChart>
    </div>
  );
}
