"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import PlanningCalendarTile from "@/components/planning/PlanningCalendarTile";
import FullMaintenanceDetails from "@/components/planning/FullMaintenanceDetails";
import { MaintenanceFull } from "@/types/supabase";
import { updateMaintenanceDate } from "@/lib/supabase/updateMaintenanceDate";
import { toast } from "react-toastify";
import { useDrop } from "react-dnd";
import { useEffect, useState, useRef } from "react";
import { removeMaintenanceGroup } from "@/lib/supabase/createMaintenanceGroup";
import { Group } from "lucide-react";

interface WeekDay {
  dayDate: Date;
  maintenancePlans: MaintenanceFull[];
}

interface Props {
  weekDay: WeekDay;
  onMaintenanceEdited: () => void;
}

export default function WeekDayList({ weekDay, onMaintenanceEdited }: Props) {
  // ----------------------------------
  // DROP HANDLER
  // ----------------------------------
  function maintenanceDroppedOn(item: { id: number; planned_date: Date }) {
    const newDate = new Date(weekDay.dayDate);

    newDate.setHours(item.planned_date.getHours());
    newDate.setMinutes(item.planned_date.getMinutes());

    updateMaintenanceDate(item.id, newDate)
      .then(() => {
        removeMaintenanceGroup(item.id);
        toast("Maintenance date has been updated.", { type: "success" });
        onMaintenanceEdited();
      })
      .catch((error) => {
        toast("Could not update maintenance date.", { type: "error" });
        console.error(error);
      });
  }

  // ----------------------------------
  // STATE
  // ----------------------------------
  const [sortedPlans, setSortedPlans] = useState<MaintenanceFull[]>([]);
  const [sortedGroups, setSortedGroups] = useState<Map<number, MaintenanceFull[]>>(
    new Map()
  );

  // ----------------------------------
  // SORT DATA
  // ----------------------------------
  useEffect(() => {
    setSortedPlans(
      weekDay.maintenancePlans
        .filter((m) => m.group_id == null)
        .sort((a, b) => a.planned_date.getTime() - b.planned_date.getTime())
    );

    const withGroup = weekDay.maintenancePlans.filter((m) => m.group_id != null);
    const groupedByGroup = Map.groupBy(withGroup, (m) => m.group_id!);

    setSortedGroups(groupedByGroup);
  }, [weekDay.maintenancePlans]);

  // ----------------------------------
  // REACT-DND (STRICT SAFE)
  // ----------------------------------
  const dropRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PlanningCalendarTile",
    drop: (item: { id: number; planned_date: Date }) =>
      maintenanceDroppedOn(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  // ----------------------------------
  // RENDER
  // ----------------------------------
  return (
    <div
      ref={dropRef}
      className={
        "flex flex-grow gap-2 bg-white border-b p-3 flex-col transition-all " +
        (isOver ? "!bg-blue-50" : "")
      }
    >
      {/* Empty state */}
      {weekDay.maintenancePlans.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm text-neutral-400">
            Nothing scheduled today.
          </span>
        </div>
      )}

      {/* Groups */}
      {Array.from(sortedGroups.entries()).map(([groupId, items]) => (
        <div
          key={groupId}
          className="flex flex-col gap-2 w-full p-2 bg-blue-50 rounded"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-black/90">Route</span>
            <Group size={17} className="mr-auto" />
            <span className="text-xs text-black/70">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          {items.map((mm) => (
            <Dialog key={mm.id}>
              <DialogTrigger>
                <PlanningCalendarTile
                  refreshCalendar={onMaintenanceEdited}
                  maintenancePlan={mm}
                />
              </DialogTrigger>
              <DialogContent className="rounded-xl">
                <DialogTitle>Maintenance Task</DialogTitle>
                <DialogDescription>
                  View and edit maintenance task details
                </DialogDescription>
                <FullMaintenanceDetails
                  onEdited={onMaintenanceEdited}
                  maintenance={mm}
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ))}

      {/* Individual plans */}
      {sortedPlans.map((maintenancePlan) => (
        <Dialog key={maintenancePlan.id}>
          <DialogTrigger>
            <PlanningCalendarTile
              refreshCalendar={onMaintenanceEdited}
              maintenancePlan={maintenancePlan}
            />
          </DialogTrigger>
          <DialogContent className="rounded-xl">
            <DialogTitle>Maintenance Task</DialogTitle>
            <DialogDescription>
              View and edit maintenance task details
            </DialogDescription>
            <FullMaintenanceDetails
              onEdited={onMaintenanceEdited}
              maintenance={maintenancePlan}
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
