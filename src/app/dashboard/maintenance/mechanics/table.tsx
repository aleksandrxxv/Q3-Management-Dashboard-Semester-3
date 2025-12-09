"use client";
import { Mechanic } from "@/types/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateMechanic from "@/components/planning/UpdateMechanic";
import CreateMechanic from "@/components/planning/CreateMechanic";
import { Calendar1 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMechanics } from "@/lib/supabase/fetchMechanics";

interface MechanicTableProps {
  mechanics: Mechanic[];
}

export const MechanicTable = (props: MechanicTableProps) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>(props.mechanics);

  useEffect(() => {
    setMechanics(props.mechanics);
  }, [props.mechanics]);

  function refreshMechanics(): void {
    fetchMechanics().then((fetched) => setMechanics(fetched));
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Specialization</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead />
          <TableHead
            className="flex items-center justify-center"
            rowSpan={2}
          >
            <CreateMechanic refresh={refreshMechanics} />
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {mechanics
          .sort((m) => Number(m.id))
          .map((mechanic) => (
            <TableRow key={mechanic.id}>
              <TableCell className="font-medium">{mechanic.name}</TableCell>
              <TableCell>{mechanic.specialization}</TableCell>
              <TableCell>{mechanic.phone ?? "-"}</TableCell>
              <TableCell className="text-blue-600 underline">
                {mechanic.email ? (
                  <a href={`mailto:${mechanic.email}`}>{mechanic.email}</a>
                ) : (
                  "-"
                )}
              </TableCell>

              <TableCell className="w-14">
                <a
                  href={`/dashboard/maintenance/mechanic/${mechanic.id}`}
                  className="flex items-center justify-center gap-1 px-2 rounded-full hover:bg-neutral-200 transition-all py-1"
                >
                  <Calendar1 size={17} /> schedule
                </a>
              </TableCell>

              <TableCell className="w-14">
                <UpdateMechanic refresh={refreshMechanics} mechanic={mechanic} />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell colSpan={6}>
            Total: {mechanics.length} mechanics
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
