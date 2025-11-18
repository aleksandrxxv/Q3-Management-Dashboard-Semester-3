import React from 'react';

interface FactoryStatsProps {
  locationName?: string;
  stats: {
    active: number;
    maintenance: number;
    errors: number;
    efficiency: number;
    uptime: number;
    total: number;
  };
}

export default function FactoryStats({ locationName, stats }: FactoryStatsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{locationName}</h2>
          <div className="flex items-center mt-2 space-x-6">
            <div className="text-sm">
              <span className="text-gray-400">Efficiency:</span>
              <span className={`ml-2 ${stats.efficiency >= 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                {stats.efficiency}%
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Uptime:</span>
              <span className={`ml-2 ${stats.uptime >= 90 ? 'text-blue-400' : 'text-yellow-400'}`}>
                {stats.uptime}%
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Total Machines:</span>
              <span className="ml-2 text-white">{stats.total}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1.5 rounded-lg bg-green-900/50 text-green-300 border border-green-700">
            {stats.active} Active
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-yellow-900/50 text-yellow-300 border border-yellow-700">
            {stats.maintenance} Maintenance
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-red-900/50 text-red-300 border border-red-700">
            {stats.errors} Errors
          </div>
        </div>
      </div>
    </div>
  );
}