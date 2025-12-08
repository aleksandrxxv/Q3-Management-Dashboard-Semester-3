import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import PlanningCalendarTile from "@/components/planning/PlanningCalendarTile";
import FullMaintenanceDetails from "@/components/planning/FullMaintenanceDetails";
import {MaintenanceFull} from "@/types/supabase";
import {updateMaintenanceDate} from "@/lib/supabase/updateMaintenanceDate";
import {toast} from "react-toastify";
import {useDrop} from "react-dnd";
import {useEffect, useState} from "react";
import {removeMaintenanceGroup} from "@/lib/supabase/createMaintenanceGroup";
import {Group} from "lucide-react";

interface WeekDay {
    dayDate: Date,
    maintenancePlans: MaintenanceFull[]
}

interface Props {
    weekDay: WeekDay,
    onMaintenanceEdited: () => void,
}

interface MaintenanceGroup {
    id: number,
    maintenancePlans: MaintenanceFull[]
}

export default function WeekDayList(props: Props) {

    function maintenanceDroppedOn(item: { id: number, planned_date: Date }) {
        const newDate = new Date(props.weekDay.dayDate);

        newDate.setHours(item.planned_date.getHours());
        newDate.setMinutes(item.planned_date.getMinutes());

        updateMaintenanceDate(item.id, newDate).then(() => {
            removeMaintenanceGroup(item.id).then();
            toast("Maintenance date has been updated.", { type: "success" });
            props.weekDay.dayDate = newDate;
            props.onMaintenanceEdited();
        }).catch((e) => {
            toast("Could not update maintenance date.", { type: "error" });
            console.error(e);
        });
    }

    const [sortedPlans, setSortedPlans] = useState<MaintenanceFull[]>([]);
    const [sortedGroups, setSortedGroups] = useState<Map<number, MaintenanceFull[]>>(new Map());

    useEffect(() => {
        setSortedPlans(
            props.weekDay.maintenancePlans
                .filter(m => m.group_id == null)
                .sort(m => m.planned_date.getTime())
        );

        const withGroup = props.weekDay.maintenancePlans.filter(m => m.group_id != null);
        const groupedByGroup = Map.groupBy(withGroup, m => m.group_id!);

        setSortedGroups(groupedByGroup);
    }, [props.weekDay.maintenancePlans]);

    const [{isOver}, drop] = useDrop(() => ({
        accept: "PlanningCalendarTile",
        drop: (item: { id: number, planned_date: Date }) => maintenanceDroppedOn(item),
        collect: monitor => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={drop}
            className={
                "flex flex-grow gap-2 bg-white border-b p-3 flex-col transition-all " +
                (isOver ? "!bg-blue-50" : "")
            }
        >
            {/* Empty state */}
            <div
                className={
                    "w-full h-full flex items-center align-center justify-center " +
                    (props.weekDay.maintenancePlans.length === 0 ? "" : "hidden")
                }
            >
                <span className="block text-sm text-neutral-400">
                    Nothing scheduled today.
                </span>
            </div>

            {/* Groups */}
            {Array.from(sortedGroups.entries()).map(([groupId, items]) => (
                <div key={groupId} className="flex flex-col gap-2 w-full p-2 bg-blue-50 rounded">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-black/90">Route</span>
                        <Group size={17} className="mr-auto" />
                        <span className="text-xs text-black/70">
                            {items.length} {items.length === 1 ? "item" : "items"}
                        </span>
                    </div>

                    {items.map(mm => (
                        <Dialog key={mm.id}>
                            <DialogTrigger>
                                <PlanningCalendarTile
                                    refreshCalendar={props.onMaintenanceEdited}
                                    maintenancePlan={mm}
                                />
                            </DialogTrigger>
                            <DialogContent className="rounded-xl">
                                <DialogTitle>Maintenance Task</DialogTitle>
                                <FullMaintenanceDetails
                                    onEdited={props.onMaintenanceEdited}
                                    maintenance={mm}
                                />
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            ))}

            {/* Individual plans */}
            {sortedPlans.map(maintenancePlan => (
                <Dialog key={maintenancePlan.id}>
                    <DialogTrigger>
                        <PlanningCalendarTile
                            refreshCalendar={props.onMaintenanceEdited}
                            maintenancePlan={maintenancePlan}
                        />
                    </DialogTrigger>
                    <DialogContent className="rounded-xl">
                        <DialogTitle>Maintenance Task</DialogTitle>
                        <FullMaintenanceDetails
                            onEdited={props.onMaintenanceEdited}
                            maintenance={maintenancePlan}
                        />
                    </DialogContent>
                </Dialog>
            ))}
        </div>
    );
}
