import { supabase } from '$lib/supabaseClient';

export async function load() {
  const [opsRes, activeRes, historyRes] = await Promise.all([
    supabase.rpc('get_molds_total_operation'),
    supabase.rpc('get_molds_on_machine'),
    supabase.rpc('get_mold_machine_history'),
  ]);

  if (opsRes.error || activeRes.error || historyRes.error) {
    return {
      molds: [],
      error:
        opsRes.error?.message ||
        activeRes.error?.message ||
        historyRes.error?.message,
    };
  }

  const totalOps = opsRes.data;
  const active = activeRes.data;
  const history = historyRes.data;

  const molds = totalOps.map((m) => {
    // find if mold is currently active
    const activeRow =
      active.find((a) => a.mold1_id === m.id || a.mold2_id === m.id) || null;

    // gather history (all machines ever linked)
    const linkedMachines = history
      .filter((h) => h.mold_id === m.id)
      .map((h) => ({
        machine: h.machine,
        start: h.latest_start_date,
        end: h.latest_end_date,
      }));

    return {
      id: m.id,
      name: m.name,
      description: m.description,
      totalOperations: m.operation,
      status: activeRow ? 'Active' : 'Inactive',
      currentMachine: activeRow ? activeRow.machine : null,
      linkedMachines,
    };
  });

  return { molds };
}
