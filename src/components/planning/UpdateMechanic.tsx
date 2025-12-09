"use client"

import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Pencil} from "lucide-react";
import {Mechanic} from "@/types/supabase";
import {FormEvent, useState} from "react";
import {updateMechanic} from "@/lib/supabase/updateMechanic";
import {toast} from "react-toastify";

interface Props {
    mechanic: Mechanic,
    refresh: () => void
}

export default function UpdateMechanic(props: Props){
    const [updatedMechanic, setUpdatedMechanic] = useState<Mechanic>(props.mechanic);
    const [opened, setOpened] = useState<boolean>(false)

    function formSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        updateMechanic(updatedMechanic).then(() => {
            toast("Mechanic is edited.", {type: "success"})
            setOpened(false)
            props.refresh()
        }).catch(error => {
            toast("Cannot edit mechanic.", {type: "error"});
            console.error(error)
        })
    }

    return (
        <Dialog open={opened} onOpenChange={(v) => setOpened(v)}>
            <DialogTrigger className="flex items-center justify-center gap-1 px-2 rounded-full hover:bg-neutral-200 transition-all py-1">
                <Pencil size={17}/> edit
            </DialogTrigger>
            <DialogContent>
                <DialogTitle className="font-semibold">Mechanic information</DialogTitle>
                <form className="z-form grid grid-cols-1 gap-3" onSubmit={formSubmit}>
                    <div className="grid grid-cols-2 items-center gap-3">
                        <span>Name</span>
                        <input required type="text" value={updatedMechanic.name} onChange={(e) => setUpdatedMechanic({...updatedMechanic, name:e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-3">
                        <span>Specialty</span>
                        <input required type="text" value={updatedMechanic.specialization} onChange={(e) => setUpdatedMechanic({...updatedMechanic, specialization:e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-3">
                        <button type={"button"} className="button !bg-neutral-300 !text-neutral-700">Cancel</button>
                        <button type={"submit"} className={"button"}>Save</button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}