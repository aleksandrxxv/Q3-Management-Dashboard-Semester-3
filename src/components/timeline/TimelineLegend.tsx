import React from 'react';

export default function TimelineLegend() {
  const items = [
    { color: 'bg-green-500', label: 'Active - Above target' },
    { color: 'bg-yellow-500', label: 'Active - Under target' },
    { color: 'bg-blue-500', label: 'In Maintenance' },
    { color: 'bg-red-500', label: 'Failure' },
    { color: 'bg-gray-500', label: 'Inactive' }
  ];

  return (
    <div className="px-6 py-2 border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-4">
        {items.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}