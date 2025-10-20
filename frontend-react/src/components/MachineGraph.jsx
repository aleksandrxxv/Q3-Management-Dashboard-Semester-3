import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { useEffect } from "react";

function formatLabel(value, view) {
  const date = new Date(value);

  if (view === "5m" || view === "10m" || view === "1h") {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (view === "1d") {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
    }).format(date);
  }

  if (view === "1w") {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(date);
  }

  return value;
}

export default function MachineGraph({ machineName, data, view }) {
  useEffect(() => {
    console.log("✅ MachineGraph mounted!");
    console.log("Props → machineName:", machineName, "view:", view);
    console.log("📈 Data received in MachineGraph for", machineName, "→", data);
  }, [machineName, data, view]);

  return (
    <div className="w-full h-72 bg-white border border-gray-200 rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Shot Time Trend – {machineName}
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={Array.isArray(data) ? data : []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => formatLabel(value, view)}
            stroke="#9ca3af"
            fontSize={12}
            tickMargin={8}
          />

          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickMargin={8}
            label={{
              value: "Shot Time (s)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#374151", fontSize: 12 },
            }}
          />

          <Tooltip
            labelFormatter={(value) =>
              new Date(value).toLocaleString("en-GB", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            formatter={(v) => [`${v}s`, "Shot Time"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              fontSize: "0.8rem",
            }}
          />

          <defs>
            <linearGradient id="shotGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area type="monotone" dataKey="shotTime" stroke="none" fill="url(#shotGradient)" />

          <Line
            type="monotone"
            dataKey="shotTime"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#1d4ed8", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
