"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Mechanic } from "@/types/supabase";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { insertMechanic } from "@/lib/supabase/insertMechanic";

interface Props {
  refresh: () => void;
}

export default function CreateMechanic(props: Props) {
  const [updatedMechanic, setUpdatedMechanic] =
    useState<Partial<Mechanic>>({});
  const [opened, setOpened] = useState<boolean>(false);

  function formSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate required fields
    if (!updatedMechanic.name || !updatedMechanic.specialization) return;

    insertMechanic(
      updatedMechanic as Required<Omit<Mechanic, "id">>,
    )
      .then(() => {
        toast("Mechanic has been created", { type: "success" });
        setOpened(false);
        props.refresh();
      })
      .catch((error) => {
        toast("Could not create mechanic.", { type: "error" });
        console.error(error);
      });
  }

  return (
    <Dialog open={opened} onOpenChange={(v) => setOpened(v)}>
      <DialogTrigger className="flex items-center justify-center gap-1 px-2 rounded-full hover:bg-neutral-200 transition-all py-1">
        <PlusCircle size={17} /> Add
      </DialogTrigger>

      <DialogContent>
        <DialogTitle className="font-semibold">Add Mechanic</DialogTitle>

        <form className="z-form grid grid-cols-1 gap-3" onSubmit={formSubmit}>

          {/* Name */}
          <div className="grid grid-cols-2 items-center gap-3">
            <span>Name</span>
            <input
              required
              type="text"
              onChange={(e) =>
                setUpdatedMechanic({
                  ...updatedMechanic,
                  name: e.target.value,
                })
              }
            />
          </div>

          {/* Specialization */}
          <div className="grid grid-cols-2 items-center gap-3">
            <span>Specialization</span>
            <input
              required
              type="text"
              onChange={(e) =>
                setUpdatedMechanic({
                  ...updatedMechanic,
                  specialization: e.target.value,
                })
              }
            />
          </div>

          {/* Phone */}
          <div className="grid grid-cols-2 items-center gap-3">
            <span>Phone</span>
            <input
              type="text"
              placeholder="+31 6 ..."
              onChange={(e) =>
                setUpdatedMechanic({
                  ...updatedMechanic,
                  phone: e.target.value,
                })
              }
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-2 items-center gap-3">
            <span>Email</span>
            <input
              type="email"
              placeholder="name@example.com"
              onChange={(e) =>
                setUpdatedMechanic({
                  ...updatedMechanic,
                  email: e.target.value,
                })
              }
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 items-center gap-3">
            <button
              type="button"
              className="button !bg-neutral-300 !text-neutral-700"
              onClick={() => setOpened(false)}
            >
              Cancel
            </button>
            <button type="submit" className="button">
              Save
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
