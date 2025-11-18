import React from 'react';

export default function TimelineLegend() {
  const items = [
    { color: 'bg-green-500', label: 'Actief - Boven target' },
    { color: 'bg-yellow-500', label: 'Actief - Onder target' },
    { color: 'bg-blue-500', label: 'In Onderhoud' },
    { color: 'bg-red-500', label: 'Storing' },
    { color: 'bg-gray-500', label: 'Inactief' }
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