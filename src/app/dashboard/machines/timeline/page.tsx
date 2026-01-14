// src/app/dashboard/machines/timeline/page.tsx

import { unstable_cache } from "next/cache";
import { Suspense } from "react";

import Rows from "./rows";

import { getMachines } from "@/lib/data/getMachines";

import { Machine, MachineTimeline } from "@/types/supabase";

// extend machine type with timeline
export interface MachineWithData extends Machine {
  data?: MachineTimeline[];
}

// Loading skeleton component
function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
      </div>
      <div className="px-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Machines data fetcher component
async function MachinesData() {
  // Use longer cache time since machines don't change often
  const getMachinesCached = unstable_cache(
    () => getMachines(),
    ["machines-timeline"],
    { 
      revalidate: 300, // 5 minutes - machines list doesn't change frequently
      tags: ['machines']
    }
  );

  const machines = await getMachinesCached();

  return <Rows machines={machines} />;
}

export default function Page() {
  return (
    <Suspense fallback={<TimelineSkeleton />}>
      <MachinesData />
    </Suspense>
  );
}
