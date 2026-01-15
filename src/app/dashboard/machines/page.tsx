// src/app/dashboard/machines/page.tsx

import { getMachines } from "@/lib/data/getMachines";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Link from "next/link";
import Header from "../header";
import { unstable_cache } from "next/cache";
import { Activity, Clock, Cpu } from "lucide-react";
import { EnergyMonitoringDialog } from "@/components/energy-monitoring-dialog";

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    'Actief': { 
      label: 'Active', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/50', 
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500'
    },
    'Stilstand': { 
      label: 'Standstill', 
      bg: 'bg-amber-50 dark:bg-amber-950/50', 
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500'
    },
    'Inactief': { 
      label: 'Inactive', 
      bg: 'bg-slate-100 dark:bg-slate-800', 
      text: 'text-slate-600 dark:text-slate-400',
      dot: 'bg-slate-400'
    },
  };
  
  const style = config[status] || config['Inactief'];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default async function Page() {
  const getMachinesCached = unstable_cache(
    async () => getMachines(),
    ["machines"],
    { revalidate: 10 }
  );

  const machines = await getMachinesCached();

  // Calculate stats for footer
  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status === 'Actief').length;
  const standstillMachines = machines.filter(m => m.status === 'Stilstand').length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Header
        title="Machines"
        description="List of all machines"
      />

      <div className="p-8">
        {/* Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">All Machines</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Real-time status and performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <EnergyMonitoringDialog />
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Activity className="h-4 w-4" />
                <span>Live updates every 10s</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 pl-6">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Machine</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Avg. Shot Time</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Total Shots</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 pr-6">Last Update</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {machines.map((machine, index) => (
                  <TableRow 
                    key={`${machine.machine_id}-${index}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <StatusBadge status={machine.status} />
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/dashboard/machines/${machine.machine_id}`}
                        className="group flex items-center gap-2"
                      >
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {machine.machine_name || `Machine ${machine.machine_id}`}
                        </span>
                      </Link>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-600 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-mono text-sm">
                          {machine.avg_shot_time != null 
                            ? `${machine.avg_shot_time.toFixed(2)}s`
                            : "—"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="font-mono text-sm text-slate-900 dark:text-slate-100">
                        {machine.total_shots != null 
                          ? machine.total_shots.toLocaleString()
                          : "0"}
                      </span>
                    </TableCell>

                    <TableCell className="pr-6">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {machine.last_update
                          ? new Date(machine.last_update).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Showing {machines.length} machines</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {activeMachines} active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {standstillMachines} standstill
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  {totalMachines - activeMachines - standstillMachines} inactive
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
