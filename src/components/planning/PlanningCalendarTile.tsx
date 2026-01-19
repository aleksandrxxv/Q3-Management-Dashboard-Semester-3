"use client"

import {MaintenanceFull} from "@/types/supabase"
import {useDrag, useDrop} from "react-dnd";
import {addMaintenanceToGroup} from "@/lib/supabase/createMaintenanceGroup";
import {toast} from "react-toastify";

interface Props {
    maintenancePlan: MaintenanceFull;
    refreshCalendar: () => void
}

export default function PlanningCalendarTile(props: Props) {
    const [{isDragging}, dragRef] = useDrag(
        () => ({
            type: "PlanningCalendarTile",
            item: {id: props.maintenancePlan.id, planned_date: props.maintenancePlan.planned_date},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            })
        }),
        []
    )

    const [{isOver}, drop] = useDrop(() => ({
        accept: "PlanningCalendarTile",
        drop: (item: { id: number, planned_date: Date }) => {
            addMaintenanceToGroup(item.id, props.maintenancePlan.id).then(() => {
                toast("Group created.", {type: "success"})
                props.refreshCalendar()
            }).catch((e) => {
                toast("Could not create group.", {type: "error"})
                console.error(e)
            })
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
        }),
    }))

    return (
        <div
            ref={el => {
                dragRef(el);
                drop(el)
            }}
            className={
                "block rounded border p-2 shadow-lg shadow-black/5 text-left bg-white transition-all hover:opacity-70 hover:shadow-xl " +
                (isDragging ? "!opacity-50 " : "") +
                (isOver ? "!bg-blue-50" : "")
            }
            key={props.maintenancePlan.id}
        >
            <div className="flex">
                <span className="block text-sm uppercase font-bold mr-auto">
                    {props.maintenancePlan.machine_name}
                </span>

                <span className="block text-xs">
                    {new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(props.maintenancePlan.planned_date)}
                </span>
            </div>

            <span className="flex w-full gap-2 items-center text-xs">
                <span className="block mr-auto">
                    {props.maintenancePlan.maintenance_action}
                </span>

                <span
                    className={
                        "block px-2 rounded-full border w-24 text-center " +
                        (props.maintenancePlan.status === "Finished" ? "border-green-400" : "border-red-400")
                    }
                >
                    {props.maintenancePlan.status}
                </span>
                <span
                    className={
                        "block px-2 rounded-full border w-24 text-center " +
                        (props.maintenancePlan.maintenance_type === "Corrective" ? "border-orange-400" : "")
                    }
                >
                    {props.maintenancePlan.maintenance_type}
                </span>
            </span>
        </div>
    )
}
