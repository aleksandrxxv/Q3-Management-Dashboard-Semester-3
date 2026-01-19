import { supabase } from "./client";
import { Mechanic } from "@/types/supabase";

type NewMechanic = Omit<Mechanic, "id">;

export async function insertMechanic(mechanic: NewMechanic) {
  // Insert mechanic FIRST
  const { data, error } = await supabase
    .from("i_mechanics")
    .insert({
      name: mechanic.name,
      specialization: mechanic.specialization,
      phone: mechanic.phone,
      email: mechanic.email,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating mechanic: ${error.message}`);
  }

  // Auto-create contact also
  if (mechanic.phone) {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mechanic.name,
          phone: mechanic.phone,
        }),
      });

      const contactResult = await res.json();
      if (!res.ok) {
        console.error("Failed to auto-create contact:", contactResult.error);
      }
    } catch (err) {
      console.error("Auto-contact creation failed:", err);
    }
  }

  return data;
}
