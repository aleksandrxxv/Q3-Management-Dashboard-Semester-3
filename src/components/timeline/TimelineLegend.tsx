import React from "react";

export default function TimelineLegend() {
  const items = [
    { color: "bg-green-500", label: "Active - Above target" },
    { color: "bg-yellow-500", label: "Active - Below target" },
    { color: "bg-blue-500", label: "In Maintenance" },
    { color: "bg-red-500", label: "Fault" },
    { color: "bg-gray-500", label: "Inactive" },
  ];

  return (
    <div className="px-6 py-2 border-b border-gray-200">
      <ul className="flex flex-wrap items-center gap-4">
        {items.map(({ color, label }) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${color}`}
              aria-hidden="true"
            />
            <span className="text-sm text-gray-600">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
