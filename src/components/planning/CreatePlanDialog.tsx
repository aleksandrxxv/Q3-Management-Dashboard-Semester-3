"use client";

import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger} from "@/components/ui/dialog";
import {Plus} from "lucide-react";
import {Input} from "@/components/ui/input";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Machine, Maintenance, Mechanic, Mold} from "@/types/supabase";
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from "react-toastify";
import {insertNewMaintenance} from "@/lib/supabase/insertNewMaintenance";
import {fetchAllMolds} from "@/lib/supabase/fetchMolds";
import {fetchMechanics} from "@/lib/supabase/fetchMechanics";
import {formatDateToISO} from "@/lib/utils";
import {insertNewMoldMaintenanceMilestone} from "@/lib/supabase/insertNewMoldMaintenanceMilestone";
import { fetchMachines } from "@/lib/supabase/fetchMachines";

interface Props {
    formData: Partial<Omit<Maintenance, "id" | "status">>
    onCreatedNewPlanning: () => void
}

export default function CreatePlanDialog(props: Props) {
    const [maintenanceForm, setMaintenanceForm] = useState<Partial<Omit<Maintenance, "id" | "status"> & {lifespan: number}>>(props.formData);

    const [molds, setMolds] = useState<Mold[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [isOpened, setIsOpened] = useState<boolean>(false);
    const [isManual, setIsManual] = useState<boolean>(true);

    function handleOpenedChange(open: boolean) {
        setIsOpened(open);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (isManual) {
            if (typeof maintenanceForm.planned_date === 'string') {
                const plannedDateUTC = new Date(maintenanceForm.planned_date).toISOString();
                maintenanceForm.planned_date = new Date(plannedDateUTC);
            }
            //console.log(typeof maintenanceForm.planned_date, maintenanceForm.planned_date);
            insertNewMaintenance(maintenanceForm as Required<Omit<Maintenance, "id" | "status">>).then(() => {
                toast("Maintenance has been scheduled.", { type: "success" });
                setIsOpened(false);
                props.onCreatedNewPlanning();

            }).catch((reason: Error) => {
                toast("Could not schedule maintenance.", { type: "error" });
                console.log(reason);
            })
        } else {
            insertNewMoldMaintenanceMilestone(maintenanceForm.machine_id!, maintenanceForm.lifespan!).then(() => {
                toast("Milestone has been set.", { type: "success" });
                setIsOpened(false);
            }).catch((reason: Error) => {
                toast("Could not set milestone.", { type: "error" });
                console.log(reason);
            });
        }
    }

    function updateFormValue(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLTextAreaElement>) {
        setMaintenanceForm({
            ...maintenanceForm,
            [e.target.name]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
        })
    }

    useEffect(() => {
        fetchMachines().then(setMachines);
        fetchAllMolds().then(setMolds);
        fetchMechanics().then(setMechanics);
    }, []);

    return (
        <Dialog open={isOpened} onOpenChange={handleOpenedChange}>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <DialogTrigger className="button"><Plus size={20}/> Schedule Maintenance</DialogTrigger>
            <DialogContent className={"rounded-xl"}>
                <DialogTitle>Schedule Maintenance</DialogTitle>
                <DialogDescription>
                  Create a new maintenance schedule for a machine
                </DialogDescription>
                <form onSubmit={handleSubmit}>
                    <div className={"flex flex-col z-form items-center gap-3 w-full"}>

                        <div className={"grid grid-cols-2 gap-2 w-full h-max"}>
                            <button
                                type={"button"}
                                onClick={() => setIsManual(true)}
                                className={isManual ? "method-btn method-btn-select" : "method-btn"}
                            >
                                Manual
                            </button>

                            <button
                                type={"button"}
                                onClick={() => setIsManual(false)}
                                className={!isManual ? "method-btn method-btn-select" : "method-btn"}
                            >
                                Predictive
                            </button>
                        </div>

                        {/* Planned Date */}
                        <div className={`grid grid-cols-2 items-center gap-3 w-full ${isManual ? "" : "hidden"}`}>
                            <span className={"text-sm font-semibold"}>Date</span>
                            <Input
                                disabled={!isManual}
                                required
                                type={"datetime-local"}
                                min={formatDateToISO(new Date())}
                                name="planned_date"
                                onChange={updateFormValue}
                            />
                        </div>

                        {/* Mold */}
                        <div className={"grid grid-cols-2 items-center gap-3 w-full"}>
                            <span className={"text-sm font-semibold"}>Machine</span>
                            <select required defaultValue={""} name="machine_id" onChange={updateFormValue}>
                                <option value="" disabled>Select an option</option>
                                {machines.map((m, index) => (
                                    <option value={m.machine_id} key={index}>
                                        {m.machine_name || m.machine_id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lifespan */}
                        <div className={`grid grid-cols-2 items-center gap-3 w-full ${!isManual ? "" : "hidden"}`}>
                            <span className={"text-sm font-semibold"}>Lifespan</span>
                            <Input
                                disabled={isManual}
                                required
                                type={"number"}
                                min={0}
                                name="lifespan"
                                onChange={updateFormValue}
                            />
                        </div>

                        {/* Maintenance Type */}
                        <div className={`grid grid-cols-2 items-center gap-3 w-full ${isManual ? "" : "hidden"}`}>
                            <span className={"text-sm font-semibold"}>Maintenance Type</span>
                            <select disabled={!isManual} defaultValue={""} required name="maintenance_type" onChange={updateFormValue}>
                                <option value="" disabled>Select an option</option>
                                <option value={"Preventative"}>Preventive</option>
                                <option value={"Corrective"}>Corrective</option>
                            </select>
                        </div>

                        {/* Maintenance Action */}
                        <div className={`grid grid-cols-2 items-center gap-3 w-full ${isManual ? "" : "hidden"}`}>
                            <span className={"text-sm font-semibold"}>Maintenance Action</span>
                            <select disabled={!isManual} defaultValue={""} required name="maintenance_action" onChange={updateFormValue}>
                                <option value="" disabled>Select an option</option>

                                {/* Translated maintenance actions */}
                                <option>Calibrate</option>
                                <option>Clean</option>
                                <option>Inspect</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className={`grid grid-cols-2 items-center gap-3 ${isManual ? "" : "hidden"}`}>
                            <span className={"text-sm font-semibold"}>Description</span>
                            <input
                                disabled={!isManual}
                                type="text"
                                required
                                name="description"
                                onChange={updateFormValue}
                            />
                        </div>

                        {/* Mechanic */}
                        <div className={`grid grid-cols-2 items-center gap-3 ${isManual ? "" : "hidden"}`}>
                            <span className={"text-sm font-semibold"}>Mechanic</span>
                            <select disabled={!isManual} defaultValue={""} required name="assigned_to" onChange={updateFormValue}>
                                <option value="" disabled>Select an option</option>
                                {mechanics.map((mechanic) => (
                                    <option value={mechanic.id} key={mechanic.id}>
                                        {mechanic.name} ({mechanic.specialization})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={"w-full flex mt-4"}>
                        <button type={"submit"} className="ml-auto button">
                            <Plus size={20}/> Schedule
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
