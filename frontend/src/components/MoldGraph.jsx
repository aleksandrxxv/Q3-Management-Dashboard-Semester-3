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

// Helper to format weekly labels
function formatWeekLabel(week) {
  return week; // e.g. "2021-W12"
}

export default function MoldGraph({ moldName, data }) {
  // Transform opsPerWeek { "2021-W12": 5, "2021-W13": 10 } → array
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

          <XAxis
            dataKey="week"
            tickFormatter={formatWeekLabel}
            stroke="#9ca3af"
            fontSize={12}
            tickMargin={8}
          />

          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickMargin={8}
            label={{
              value: "Operations",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#374151", fontSize: 12 },
            }}
          />

          <Tooltip
            formatter={(v) => [`${v}`, "Operations"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              fontSize: "0.8rem",
            }}
          />

          <defs>
            <linearGradient id="opsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area type="monotone" dataKey="operations" fill="url(#opsGradient)" stroke="none" />
          <Line
            type="monotone"
            dataKey="operations"
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
