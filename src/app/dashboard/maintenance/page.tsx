"use client"

import PlanningCalendar from "@/components/PlanningCalendar";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
import Header from "../header";

export default function Page() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Header
                title={"Maintenance"}
                description={"Plan the maintenance of the machines here."}
            />
            <PlanningCalendar mechanic={null}/>
        </DndProvider>
    )
}