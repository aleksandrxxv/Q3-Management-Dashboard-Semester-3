"use client"

import {MaintenanceFull, Mechanic} from "@/types/supabase";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {fetchMechanics} from "@/lib/supabase/fetchMechanics";
import {formatDateToISO} from "@/lib/utils";
import {updateMaintenance} from "@/lib/supabase/updateMaintenance";
import {toast} from "react-toastify";

interface Props {
    maintenance: MaintenanceFull,
    onEdited: () => void
}

export default function FullMaintenanceDetails(props: Props) {
    const [editing, setEditing] = useState(false);
    const [editedForm, setEditedForm] = useState<MaintenanceFull>(props.maintenance)
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);

    function updateFormValue(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLTextAreaElement>) {
        setEditedForm({
            ...editedForm,
            [e.target.name]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
        })
    }

    function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // klote fix omdat te veel velden werden meegestuurd in supabase update
        updateMaintenance({
            id: editedForm.id,
            assigned_to: editedForm.assigned_to,
            description: editedForm.description,
            maintenance_type: editedForm.maintenance_type,
            maintenance_action: editedForm.maintenance_action,
            planned_date: new Date(editedForm.planned_date),
            mold_id: editedForm.mold_id
        }).then(() => {
            toast("Onderhoudsplan is aangepast.", {type: 'success'})
            props.onEdited()
            setEditing(false)
        }).catch((e) => {
            toast("Kon onderhoud niet aanpassen.", {type: 'error'})
            console.error(e)
        })
    }

    useEffect(() => {
        fetchMechanics().then(mechanics => setMechanics(mechanics));
    }, []);

    if (editing) {
        return (
            <form onSubmit={handleFormSubmit} className="block w-full h-full z-form">
                <div className="grid grid-cols-2 gap-4">
                    <span className="block font-semibold">Mold</span>
                    <span>{props.maintenance.mold_name || props.maintenance.mold_id  }</span>

                    <span className="block font-semibold">Planned for</span>
                    <Input onChange={updateFormValue} name="planned_date" type='datetime-local'
                           value={(formatDateToISO(new Date(editedForm.planned_date)))}/>

                    <span className="block font-semibold">Maintenance type</span>
                    <select onChange={updateFormValue} value={editedForm.maintenance_type}
                            name="maintenance_type">
                        <option value="Preventative">Preventive</option>
                        <option value="Corrective">Corrective</option>
                    </select>

                    <span className="block font-semibold">Maintenance action</span>
                    <select onChange={updateFormValue} value={editedForm.maintenance_action}
                            name="maintenance_action">
                        <option value="" disabled>Select an option</option>
                        <option value={"Poetsen"}>Cleaning</option>
                        <option value={"Kalibreren"}>Calibration</option>
                    </select>

                    <span className="block font-semibold">Assigned mechanic</span>
                    <select onChange={updateFormValue} value={editedForm.assigned_to} name="assigned_to">
                        <option value="" disabled>Select an option</option>
                        {mechanics.map(m => (<option key={m.id} value={m.id}>{m.name} ({m.specialization})</option>))}
                    </select>

                    <button onClick={() => setEditing(false)}
                            className="button !bg-neutral-300 !text-neutral-800">Cancel
                    </button>
                    <button type={"submit"} className="button !bg-green-500">Save</button>
                </div>
            </form>
        )
    } else {
        return (
            <div className="block w-full h-full">
                <div className="grid grid-cols-2 gap-4">
                    <span className="block font-semibold">Mold</span>
                    <span>{props.maintenance.mold_name || props.maintenance.mold_id}</span>

                    <span className="block font-semibold">Planned for</span>
                    <span>{new Intl.DateTimeFormat("nl", {
                        dateStyle: "medium",
                        timeStyle: "medium"
                    }).format(props.maintenance.planned_date)}</span>

                    <span className="block font-semibold">Maintenance type</span>
                    <span>{props.maintenance.maintenance_type}</span>

                    <span className="block font-semibold">Maintenance action</span>
                    <span>{props.maintenance.maintenance_action}</span>


                    <span className="block font-semibold">Assigned mechanic</span>
                    <span>{props.maintenance.mechanic_name} ({props.maintenance.mechanic_specialization})</span>

                    <span></span>
                    <button onClick={() => setEditing(true)} className="button">Edit</button>
                </div>
            </div>
        )
    }

}