import { AlertOctagon, PowerIcon } from 'lucide-react';
import React, { useMemo } from 'react';

interface StatusIndicatorProps {
  status: string;
}

// Memoize status styles and icons to prevent recreation
const STATUS_STYLES: Record<string, string> = {
  'Actief': 'bg-green-500 border-green-600',
  'Stilstand': 'bg-red-500 border-red-600',
  'Inactief': 'bg-gray-500 border-gray-600',
  'Failure': 'bg-red-500 border-red-600'
};

function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusStyle = useMemo(() => STATUS_STYLES[status] || 'bg-gray-500 border-gray-600', [status]);
  
  const icon = useMemo(() => {
    const iconClass = 'size-4 text-white';
    if (status === 'Actief' || status === 'Stilstand') {
      return <PowerIcon className={iconClass} />;
    }
    if (status === 'Inactief' || status === 'Failure') {
      return <AlertOctagon className={iconClass} />;
    }
    return null;
  }, [status]);

  return (
    <div className={`w-6 h-6 rounded-full border flex justify-center items-center ${statusStyle}`}>
      <div>{icon}</div>
    </div>
  );
}

export default React.memo(StatusIndicator);