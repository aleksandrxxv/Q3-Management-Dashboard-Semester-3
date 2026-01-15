// src/app/dashboard/machines/page.tsx

import { getMachines } from "@/lib/data/getMachines";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import StatusIndicator from "@/components/timeline/StatusIndicator";
import Link from "next/link";
import Header from "../header";
import { Machine } from "@/types/supabase";
import { unstable_cache } from "next/cache";

export default async function Page() {
  // const getMachinesCached = unstable_cache(
  //   async () => getMachines(),
  //   ["machines"],
  //   { revalidate: 10}
  // );

  const machines = await getMachines();

  const machineStatus = (machine: Machine) => {
    if (machine.status === "Actief") return "Active";
    if (machine.status === "Stilstand") return "Standstill";
    if (machine.status === "Inactief") return "Inactive";
    if (machine.status === "Failure") return "Failure";
  };

  return (
    <>
      <Header
        title="Machines"
        description="List of all machines"
      />

      <div>
        <Table>
          <TableCaption>Machines</TableCaption>

          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Machine</TableHead>
              <TableHead className="text-right w-44">Avg. Shot Time</TableHead>
              <TableHead>Total Shots</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {machines.map((machine) => (
              <TableRow key={machine.machine_id}>
                <TableCell className="flex items-center justify-center gap-1">
                  <StatusIndicator status={machine.status} />
                  {machineStatus(machine)}
                </TableCell>

                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/machines/${machine.machine_id}`}
                    className="text-blue-500 underline"
                  >
                    {machine.machine_name || `Machine ${machine.machine_id}`}
                  </Link>
                </TableCell>

                <TableCell className="text-right">
                  {machine.avg_shot_time != null 
                    ? machine.avg_shot_time.toFixed(2) 
                    : "0.00"}
                </TableCell>

                <TableCell>
                  {machine.total_shots != null ? machine.total_shots : 0}
                </TableCell>

                <TableCell>
                  {machine.last_update
                    ? new Date(machine.last_update).toLocaleString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>
                Total: {machines.length} machines
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  );
}
