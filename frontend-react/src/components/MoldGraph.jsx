import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area
} from "recharts";

export default function MoldGraph({ moldId, moldName }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

    fetch(`${apiUrl}/api/molds/${moldId}/operations/weekly?startDate=2019-01-01&endDate=2024-12-31`)
      .then((res) => res.json())
      .then((rows) => {
        const formatted = rows.reduce((acc, cur) => {
          const year = String(cur.week).slice(0, 4);
          const weekNum = String(cur.week).slice(4);
          acc[`${year}-W${weekNum}`] = cur.operation;
          return acc;
        }, {});
        setData(formatted);
      })
      .catch((err) => console.error("Error fetching weekly ops:", err));
  }, [moldId]);

  const chartData = Object.entries(data).map(([week, ops]) => ({
    week,
    operations: ops,
  }));

  return (
    <div className="w-full h-72 bg-white border border-gray-200 rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Operations Trend – {moldName}
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" />
          <YAxis label={{ value: "Ops", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <defs>
            <linearGradient id="opsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="operations" fill="url(#opsGradient)" stroke="none" />
          <Line type="monotone" dataKey="operations" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
