import { supabase } from '$lib/supabaseClient';

export async function load() {
  // Only fetch light RPCs
  const [activeRes, historyRes] = await Promise.all([
    supabase.rpc('get_molds_on_machine'),
    supabase.rpc('get_mold_machine_history'),
  ]);

  if (activeRes.error || historyRes.error) {
    return {
      molds: [],
      error:
        activeRes.error?.message ||
        historyRes.error?.message,
    };
  }

  const active = activeRes.data;
  const history = historyRes.data;

  // Derive unique molds from the history function
  const uniqueMolds = [
    ...new Map(
      history.map((h) => [
        h.mold_id,
        {
          id: h.mold_id,
          name: h.mold_name,
          description: h.mold_description ?? '',
        },
      ])
    ).values(),
  ];

  // Combine with machine and status info
  const molds = uniqueMolds.map((m) => {
    const activeRow =
      active.find((a) => a.mold1_id === m.id || a.mold2_id === m.id) || null;

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
      totalOperations: null,
      currentMachine: activeRow ? activeRow.machine : null,
      linkedMachines,
    };
  });

  return { molds };
}
